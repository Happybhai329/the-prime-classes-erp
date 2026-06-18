import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrganizationScopeGuard } from '../../common/enterprise';
import { ENTERPRISE_QUEUE } from './enterprise.constants';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseJobsService } from './enterprise-jobs.service';
import { EnterpriseProcessor } from './enterprise.processor';
import { EnterpriseRollupService } from './enterprise-rollup.service';
import { EnterpriseService } from './enterprise.service';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: ENTERPRISE_QUEUE }),
  ],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    EnterpriseRollupService,
    EnterpriseJobsService,
    EnterpriseProcessor,
    OrganizationScopeGuard,
  ],
  exports: [EnterpriseService, EnterpriseRollupService, EnterpriseJobsService],
})
export class EnterpriseModule {}
