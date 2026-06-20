import { Injectable, OnModuleDestroy, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

type ThrottlerStorageRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>;

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `${redisKey}:blocked`;

    if (this.redis.status === 'wait') {
      await this.redis.connect();
    }

    // Check if the block key exists in Redis
    let timeToBlockExpire = await this.redis.ttl(blockKey);
    let isBlocked = timeToBlockExpire > 0;

    let totalHits: number;
    let timeToExpire: number;

    if (isBlocked) {
      // Client is already blocked. Fetch their current hit count and expiry.
      const pipeline = this.redis.pipeline();
      pipeline.get(redisKey);
      pipeline.ttl(redisKey);
      const results = await pipeline.exec();

      const hitsStr = results ? (results[0][1] as string | null) : null;
      totalHits = hitsStr ? parseInt(hitsStr, 10) : limit + 1;
      const ttlSec = results ? (results[1][1] as number) : -2;
      timeToExpire = ttlSec > 0 ? ttlSec : 0;
    } else {
      // Client is not blocked. Increment hits.
      const pipeline = this.redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);
      const results = await pipeline.exec();
      if (!results) {
        throw new Error('Redis pipeline execution failed');
      }

      totalHits = results[0][1] as number;
      const ttlSec = results[1][1] as number;

      const ttlSeconds = Math.ceil(ttl / 1000);
      if (totalHits === 1 || ttlSec === -1) {
        await this.redis.expire(redisKey, ttlSeconds);
        timeToExpire = ttlSeconds;
      } else {
        timeToExpire = ttlSec > 0 ? ttlSec : 0;
      }

      // Check if this hit exceeds the limit
      if (totalHits > limit) {
        isBlocked = true;
        const blockDurationSeconds = Math.ceil(blockDuration / 1000);
        await this.redis.set(blockKey, '1', 'EX', blockDurationSeconds);
        timeToBlockExpire = blockDurationSeconds;
      } else {
        timeToBlockExpire = 0;
      }
    }

    return {
      totalHits,
      timeToExpire: Math.max(0, timeToExpire),
      isBlocked,
      timeToBlockExpire: Math.max(0, timeToBlockExpire),
    };
  }

  onModuleDestroy() {
    if (this.redis.status !== 'end') {
      this.redis.disconnect();
    }
  }
}

@Module({
  providers: [RedisThrottlerStorage],
  exports: [RedisThrottlerStorage],
})
export class RedisThrottlerStorageModule {}
