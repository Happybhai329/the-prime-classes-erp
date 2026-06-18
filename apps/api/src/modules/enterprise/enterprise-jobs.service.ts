import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import {
  ENTERPRISE_QUEUE,
  ENTERPRISE_ROLLUP_JOB,
} from './enterprise.constants';

@Injectable()
export class EnterpriseJobsService implements OnModuleInit {
  constructor(
    @InjectQueue(ENTERPRISE_QUEUE) private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    if (process.env.ENABLE_ENTERPRISE_SCHEDULES !== 'true') {
      return;
    }

    const organizations = await this.prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const organization of organizations) {
      await this.queue.add(
        ENTERPRISE_ROLLUP_JOB,
        { organizationId: organization.id },
        {
          jobId: `enterprise-rollup:${organization.id}`,
          repeat: { cron: '*/15 * * * *' },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    }
  }

  enqueueRollup(organizationId: string) {
    return this.queue.add(
      ENTERPRISE_ROLLUP_JOB,
      { organizationId },
      {
        jobId: `enterprise-rollup:${organizationId}:${Date.now()}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
  }
}
