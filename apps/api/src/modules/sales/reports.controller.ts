import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { ReportsService } from './reports.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-admissions')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get daily admissions report' })
  async getDailyAdmissions(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getDailyAdmissions(tenantId);
  }

  @Get('monthly-admissions')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get monthly admissions report' })
  async getMonthlyAdmissions(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getMonthlyAdmissions(tenantId);
  }

  @Get('counsellor-performance')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get counsellor performance report' })
  async getCounsellorPerformance(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getCounsellorPerformance(tenantId);
  }

  @Get('lead-source')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get lead source performance report' })
  async getLeadSourceReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getLeadSourceReport(tenantId);
  }

  @Get('conversion')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get sales conversion stages report' })
  async getConversionReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getConversionReport(tenantId);
  }

  @Get('revenue')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get sales revenue breakdowns report' })
  async getRevenueReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getRevenueReport(tenantId);
  }

  @Get('cancelled')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get cancelled admissions list' })
  async getCancelledAdmissions(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getCancelledAdmissions(tenantId);
  }

  @Get('pending')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get pending admissions list' })
  async getPendingAdmissions(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getPendingAdmissions(tenantId);
  }

  @Get('scholarships')
  @Permissions(Permission.SALES_REPORT_VIEW)
  @ApiOperation({ summary: 'Get scholarships list' })
  async getScholarshipReport(@CurrentUser('tenantId') tenantId: string) {
    return this.reportsService.getScholarshipReport(tenantId);
  }
}
