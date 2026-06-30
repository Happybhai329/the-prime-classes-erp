import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Sales Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('sales/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Permissions(Permission.SALES_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get Sales Conversion Analytics' })
  async getAnalytics(@CurrentUser('tenantId') tenantId: string) {
    return this.analyticsService.getAnalytics(tenantId);
  }
}
