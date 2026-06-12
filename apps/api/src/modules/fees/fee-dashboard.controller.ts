import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { FeeDashboardService } from './services/fee-dashboard.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Fee Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('fees/dashboard')
export class FeeDashboardController {
  constructor(private readonly dashboardService: FeeDashboardService) {}

  @Get()
  @Permissions(Permission.FEE_DASHBOARD)
  @ApiOperation({ summary: 'Get fee dashboard widgets data' })
  async getDashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getDashboardData(tenantId);
  }

  @Get('monthly-revenue')
  @Permissions(Permission.FEE_DASHBOARD)
  @ApiOperation({ summary: 'Get monthly revenue chart data' })
  async getMonthlyRevenue(@CurrentUser('tenantId') tenantId: string, @Query('year') year?: string) {
    return this.dashboardService.getMonthlyRevenue(tenantId, year ? parseInt(year, 10) : undefined);
  }

  @Get('batch-revenue')
  @Permissions(Permission.FEE_DASHBOARD)
  @ApiOperation({ summary: 'Get batch-wise revenue data' })
  async getBatchRevenue(@CurrentUser('tenantId') tenantId: string, @Query('academicYear') academicYear?: string) {
    return this.dashboardService.getBatchRevenue(tenantId, academicYear);
  }

  @Get('collection-trend')
  @Permissions(Permission.FEE_DASHBOARD)
  @ApiOperation({ summary: 'Get daily collection trend for last N days' })
  async getCollectionTrend(@CurrentUser('tenantId') tenantId: string, @Query('days') days?: string) {
    return this.dashboardService.getCollectionTrend(tenantId, days ? parseInt(days, 10) : 30);
  }

  @Get('outstanding-trend')
  @Permissions(Permission.FEE_DASHBOARD)
  @ApiOperation({ summary: 'Get outstanding amount trend over months' })
  async getOutstandingTrend(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getOutstandingTrend(tenantId);
  }
}
