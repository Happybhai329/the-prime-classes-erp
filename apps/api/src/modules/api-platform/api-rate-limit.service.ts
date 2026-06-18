import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class ApiRateLimitService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly fallback = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  async consume(key: string, limit: number) {
    const bucket = `public-api-rate:${key}:${Math.floor(Date.now() / 60000)}`;
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }
      const count = await this.redis.incr(bucket);
      if (count === 1) {
        await this.redis.expire(bucket, 70);
      }
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      return this.consumeFallback(bucket, limit);
    }
  }

  async onModuleDestroy() {
    if (this.redis.status !== 'end') {
      this.redis.disconnect();
    }
  }

  private consumeFallback(key: string, limit: number) {
    const now = Date.now();
    const current = this.fallback.get(key);
    const entry =
      !current || current.expiresAt <= now
        ? { count: 0, expiresAt: now + 70000 }
        : current;
    entry.count++;
    this.fallback.set(key, entry);
    return {
      allowed: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
    };
  }
}
