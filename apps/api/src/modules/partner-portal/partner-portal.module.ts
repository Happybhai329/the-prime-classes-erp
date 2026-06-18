import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EnterpriseModule } from '../enterprise/enterprise.module';
import { FranchiseBillingModule } from '../franchise-billing/franchise-billing.module';
import { ResourceCenterModule } from '../resource-center/resource-center.module';
import { PartnerPortalController } from './partner-portal.controller';
import { PartnerPortalService } from './partner-portal.service';

@Module({
  imports: [
    DatabaseModule,
    EnterpriseModule,
    FranchiseBillingModule,
    ResourceCenterModule,
  ],
  controllers: [PartnerPortalController],
  providers: [PartnerPortalService],
})
export class PartnerPortalModule {}
