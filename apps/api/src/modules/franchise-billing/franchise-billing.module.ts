import { Module } from '@nestjs/common';
import { OrganizationScopeGuard } from '../../common/enterprise';
import { DatabaseModule } from '../../database/database.module';
import { FranchiseBillingController } from './franchise-billing.controller';
import { FranchiseBillingService } from './franchise-billing.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FranchiseBillingController],
  providers: [FranchiseBillingService, OrganizationScopeGuard],
  exports: [FranchiseBillingService],
})
export class FranchiseBillingModule {}
