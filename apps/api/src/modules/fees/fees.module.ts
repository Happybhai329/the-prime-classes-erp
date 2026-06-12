import { Module } from '@nestjs/common';
import { FeePlansController } from './fee-plans.controller';
import { StudentFeesController } from './student-fees.controller';
import { PaymentsController } from './payments.controller';
import { ReceiptsController } from './receipts.controller';
import { RefundsController } from './refunds.controller';
import { FeeDashboardController } from './fee-dashboard.controller';
import { FeeReportsController } from './fee-reports.controller';
import { FeePlansService } from './services/fee-plans.service';
import { StudentFeesService } from './services/student-fees.service';
import { PaymentsService } from './services/payments.service';
import { ReceiptsService } from './services/receipts.service';
import { DiscountsService } from './services/discounts.service';
import { RefundsService } from './services/refunds.service';
import { FeeDashboardService } from './services/fee-dashboard.service';
import { FeeReportsService } from './services/fee-reports.service';

@Module({
  controllers: [
    FeePlansController,
    StudentFeesController,
    PaymentsController,
    ReceiptsController,
    RefundsController,
    FeeDashboardController,
    FeeReportsController,
  ],
  providers: [
    FeePlansService,
    StudentFeesService,
    PaymentsService,
    ReceiptsService,
    DiscountsService,
    RefundsService,
    FeeDashboardService,
    FeeReportsService,
  ],
  exports: [StudentFeesService, PaymentsService, FeeReportsService],
})
export class FeesModule {}
