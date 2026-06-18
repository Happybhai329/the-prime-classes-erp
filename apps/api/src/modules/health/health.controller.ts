import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import Redis from 'ioredis';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../storage/storage.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly storage: StorageService,
  ) {}

  @Public()
  @Get()
  check() {
    return this.readiness();
  }

  @Public()
  @Get('live')
  liveness() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }

  @Public()
  @Get('ready')
  async readiness(@Res({ passthrough: true }) response?: Response) {
    const database = await this.checkDatabase();
    if (!database) {
      response?.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return {
      status: database ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: { database: database ? 'connected' : 'disconnected' },
    };
  }

  @Public()
  @Get('deep')
  async deep(@Res({ passthrough: true }) response: Response) {
    const [database, redis, objectStorage] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.storage.checkHealth(),
    ]);
    const healthy = database && redis && objectStorage;
    if (!healthy) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        database: database ? 'connected' : 'disconnected',
        redis: redis ? 'connected' : 'disconnected',
        objectStorage: objectStorage ? 'connected' : 'disconnected',
      },
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis() {
    const redis = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    try {
      await redis.connect();
      return (await redis.ping()) === 'PONG';
    } catch {
      return false;
    } finally {
      redis.disconnect();
    }
  }
}
