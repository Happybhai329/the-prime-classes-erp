import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission, RollupPeriodType } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import {
  OrganizationScope,
  OrganizationScopeGuard,
} from '../../common/enterprise';
import { PermissionsGuard } from '../../common/guards';
import { EnterpriseJobsService } from './enterprise-jobs.service';
import { EnterpriseService } from './enterprise.service';

@ApiTags('Enterprise Command Center')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard, OrganizationScopeGuard)
@Controller('enterprise/organizations/:organizationId')
export class EnterpriseController {
  constructor(
    private readonly enterprise: EnterpriseService,
    private readonly jobs: EnterpriseJobsService,
  ) {}

  @Get('dashboard')
  @Permissions(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @OrganizationScope(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get rollup-backed national command dashboard' })
  async dashboard(
    @Param('organizationId') organizationId: string,
    @Query('periodType') periodType: RollupPeriodType = RollupPeriodType.DAILY,
  ) {
    return {
      success: true,
      data: await this.enterprise.getDashboard(organizationId, periodType),
      message: 'Enterprise dashboard retrieved successfully',
    };
  }

  @Get('branch-health')
  @Permissions(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @OrganizationScope(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get latest health snapshot for every branch' })
  async branchHealth(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.enterprise.getLatestBranchHealth(organizationId),
      message: 'Branch health retrieved successfully',
    };
  }

  @Post('sync')
  @Permissions(Permission.ORG_HIERARCHY_MANAGE)
  @OrganizationScope(Permission.ORG_HIERARCHY_MANAGE)
  @ApiOperation({ summary: 'Queue enterprise rollup and health refresh' })
  async sync(@Param('organizationId') organizationId: string) {
    const job = await this.jobs.enqueueRollup(organizationId);
    return {
      success: true,
      data: { jobId: job.id },
      message: 'Enterprise sync queued successfully',
    };
  }
}
