import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { DashboardService } from './dashboard.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getAdminDashboard(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getAdminDashboard(tenantId);
  }

  @Get('admin/charts/student-growth')
  @Permissions(Permission.STUDENT_READ)
  @ApiOperation({ summary: 'Student growth over 12 months' })
  async getStudentGrowth(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getStudentGrowthChart(tenantId);
  }

  @Get('admin/charts/attendance-trends')
  @Permissions(Permission.ATTENDANCE_READ_ALL)
  @ApiOperation({ summary: 'Attendance trends over 30 days' })
  async getAttendanceTrends(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getAttendanceTrendsChart(tenantId);
  }

  @Get('admin/charts/fee-trends')
  @Permissions(Permission.FEE_VIEW_ALL)
  @ApiOperation({ summary: 'Fee collection trends over 12 months' })
  async getFeeTrends(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getFeeCollectionChart(tenantId);
  }

  // ----------------------------------------------------------------------
  // PARENT ENDPOINTS
  // ----------------------------------------------------------------------

  @Get('parent')
  @Permissions(Permission.PARENT_READ_OWN)
  @ApiOperation({ summary: 'Get parent dashboard with linked children' })
  async getParentDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dashboardService.getParentDashboard(tenantId, userId);
  }

  @Get('parent/child/:studentId/analytics')
  @Permissions(Permission.PARENT_READ_OWN)
  @ApiOperation({ summary: 'Get analytics for a specific child' })
  async getChildAnalytics(
    @CurrentUser('tenantId') tenantId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.dashboardService.getChildAnalytics(tenantId, studentId);
  }
}
