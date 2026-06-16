import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FranchiseService } from './franchise.service';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { Permission } from '@prime/shared-types';

@ApiTags('Franchise Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Get('report')
  @Permissions(Permission.FRANCHISE_VIEW)
  @ApiOperation({ summary: 'Get consolidated Head Office franchise reports' })
  async getFranchiseReport(@CurrentUser('tenantId') tenantId: string) {
    const report = await this.franchiseService.getFranchiseReport(tenantId);
    return {
      success: true,
      data: report,
      message: 'Franchise analytics aggregated successfully',
    };
  }
}
