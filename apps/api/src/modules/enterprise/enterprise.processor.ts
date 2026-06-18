import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  BRANCH_HEALTH_JOB,
  ENTERPRISE_QUEUE,
  ENTERPRISE_ROLLUP_JOB,
} from './enterprise.constants';
import { EnterpriseRollupService } from './enterprise-rollup.service';

@Processor(ENTERPRISE_QUEUE)
export class EnterpriseProcessor {
  constructor(private readonly rollups: EnterpriseRollupService) {}

  @Process(ENTERPRISE_ROLLUP_JOB)
  async refreshRollups(job: Job<{ organizationId: string }>) {
    return this.rollups.refreshOrganization(job.data.organizationId);
  }

  @Process(BRANCH_HEALTH_JOB)
  async refreshBranchHealth(job: Job<{ organizationId: string }>) {
    return this.rollups.refreshOrganization(job.data.organizationId);
  }
}
