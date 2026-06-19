import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected');

    // Log slow queries based on environment
    (this as any).$on('query', (e: any) => {
      const slowThreshold = process.env.NODE_ENV === 'production' ? 1000 : 500;
      if (e.duration > slowThreshold) {
        this.logger.warn(`Slow query (${e.duration}ms): ${e.query} -- Params: ${e.params}`);
      }
    });

    // Periodically monitor connection pool in production
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
      setInterval(async () => {
        try {
          const metrics = await this.$metrics.json();
          const active = metrics.gauges.find((g: any) => g.key === 'prisma_client_queries_active')?.value || 0;
          const pool = metrics.gauges.find((g: any) => g.key === 'prisma_client_queries_connections_opened')?.value || 0;
          this.logger.log(`Prisma Connection Pool: active_queries=${active}, opened_connections=${pool}`);
        } catch (err: any) {
          this.logger.error('Failed to retrieve connection pool metrics', err?.stack);
        }
      }, 60000); // log pool status every 60s
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Soft delete helper — sets deletedAt instead of hard deleting
   */
  async softDelete(model: string, id: string) {
    return (this as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Clean database for testing — NEVER call in production
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = (this as any)[modelKey];
        if (model?.deleteMany) {
          return model.deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
