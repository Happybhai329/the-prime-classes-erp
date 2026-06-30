import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { SalesDashboardService } from './sales-dashboard.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/dashboard')
export class SalesDashboardController {
  constructor(private readonly dashboardService: SalesDashboardService) {}

  @Get()
  @Permissions(Permission.SALES_DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get Sales Dashboard stats' })
  async getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.dashboardService.getDashboardStats(tenantId);
  }
}
