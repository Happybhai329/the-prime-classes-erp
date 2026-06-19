import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage, ThrottlerStorageRecord } from '@nestjs/throttler';
import Redis from 'ioredis';

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

    if (this.redis.status === 'wait') {
      await this.redis.connect();
    }

    const ttlSeconds = Math.ceil(ttl / 1000);

    const pipeline = this.redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.ttl(redisKey);

    const results = await pipeline.exec();
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const totalHits = results[0][1] as number;
    let timeToExpire = results[1][1] as number;

    if (totalHits === 1 || timeToExpire === -1) {
      await this.redis.expire(redisKey, ttlSeconds);
      timeToExpire = ttlSeconds;
    }

    return {
      totalHits,
      timeToExpire: Math.max(0, timeToExpire),
    };
  }

  onModuleDestroy() {
    if (this.redis.status !== 'end') {
      this.redis.disconnect();
    }
  }
}
