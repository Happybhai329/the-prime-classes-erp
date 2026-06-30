import { Module } from '@nestjs/common';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { FollowUpsController } from './followups.controller';
import { FollowUpsService } from './followups.service';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { CounsellorsController } from './counsellors.controller';
import { CounsellorsService } from './counsellors.service';
import { SalesDashboardController } from './sales-dashboard.controller';
import { SalesDashboardService } from './sales-dashboard.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [
    SalesDashboardController,
    EnquiriesController,
    FollowUpsController,
    AdmissionsController,
    CounsellorsController,
    AnalyticsController,
    ReportsController,
  ],
  providers: [
    SalesDashboardService,
    EnquiriesService,
    FollowUpsService,
    AdmissionsService,
    CounsellorsService,
    AnalyticsService,
    ReportsService,
  ],
  exports: [
    SalesDashboardService,
    EnquiriesService,
    FollowUpsService,
    AdmissionsService,
    CounsellorsService,
    AnalyticsService,
    ReportsService,
  ],
})
export class SalesModule {}
