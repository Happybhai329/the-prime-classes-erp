import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { FeeReportsService } from './services/fee-reports.service';
import { FeeReportQueryDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/reports')
export class FeeReportsController {
  constructor(private readonly reportsService: FeeReportsService) {}

  @Get('daily-collection')
  @Permissions(Permission.FEE_REPORT)
  @ApiOperation({ summary: 'Get daily collection report' })
  async getDailyCollection(@CurrentUser('tenantId') tenantId: string, @Query() query: FeeReportQueryDto) {
    return this.reportsService.getDailyCollection(tenantId, query);
  }

  @Get('monthly-collection')
  @Permissions(Permission.FEE_REPORT)
  @ApiOperation({ summary: 'Get monthly collection report' })
  async getMonthlyCollection(@CurrentUser('tenantId') tenantId: string, @Query() query: FeeReportQueryDto) {
    return this.reportsService.getMonthlyCollection(tenantId, query);
  }

  @Get('student-ledger/:studentId')
  @Permissions(Permission.FEE_REPORT, Permission.FEE_VIEW_OWN)
  @ApiOperation({ summary: 'Get complete student fee ledger' })
  @ApiParam({ name: 'studentId', type: 'string', format: 'uuid' })
  async getStudentLedger(@CurrentUser('tenantId') tenantId: string, @Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.reportsService.getStudentLedger(tenantId, studentId);
  }

  @Get('batch-revenue/:batchId')
  @Permissions(Permission.FEE_REPORT)
  @ApiOperation({ summary: 'Get batch revenue report' })
  @ApiParam({ name: 'batchId', type: 'string', format: 'uuid' })
  async getBatchRevenueReport(
    @CurrentUser('tenantId') tenantId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.reportsService.getBatchRevenueReport(tenantId, batchId, academicYear);
  }

  @Get('outstanding')
  @Permissions(Permission.FEE_REPORT)
  @ApiOperation({ summary: 'Get outstanding fee report' })
  async getOutstandingReport(@CurrentUser('tenantId') tenantId: string, @Query() query: FeeReportQueryDto) {
    return this.reportsService.getOutstandingReport(tenantId, query);
  }

  @Get('parent-ledger')
  @Permissions(Permission.FEE_VIEW_OWN)
  @ApiOperation({ summary: 'Get fee ledger for parent portal (own children)' })
  async getParentFeeLedger(@CurrentUser('tenantId') tenantId: string, @CurrentUser() user: any) {
    // Get parent ID from user's parent relation
    return this.reportsService.getParentFeeLedger(tenantId, user.parentId || user.id);
  }
}
