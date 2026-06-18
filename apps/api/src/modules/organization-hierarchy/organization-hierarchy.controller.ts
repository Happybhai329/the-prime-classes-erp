import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import {
  OrganizationScope,
  OrganizationScopeGuard,
} from '../../common/enterprise';
import {
  AssignOrganizationScopeDto,
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
} from './dto/organization-hierarchy.dto';
import { OrganizationHierarchyService } from './organization-hierarchy.service';

@ApiTags('Organization Hierarchy')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard, OrganizationScopeGuard)
@Controller('enterprise/organizations')
export class OrganizationHierarchyController {
  constructor(private readonly service: OrganizationHierarchyService) {}

  @Get(':organizationId/tree')
  @Permissions(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @OrganizationScope(Permission.ENTERPRISE_DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get enterprise organization hierarchy tree' })
  async getTree(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.getTree(organizationId),
      message: 'Organization hierarchy retrieved successfully',
    };
  }

  @Post(':organizationId/units')
  @Permissions(Permission.ORG_HIERARCHY_MANAGE)
  @OrganizationScope(Permission.ORG_HIERARCHY_MANAGE)
  @ApiOperation({ summary: 'Create an organization hierarchy unit' })
  async createUnit(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationUnitDto,
  ) {
    const unit = await this.service.createUnit({ ...dto, organizationId });
    return {
      success: true,
      data: unit,
      message: 'Organization unit created successfully',
    };
  }

  @Patch(':organizationId/units/:unitId')
  @Permissions(Permission.ORG_HIERARCHY_MANAGE)
  @OrganizationScope(Permission.ORG_HIERARCHY_MANAGE)
  @ApiOperation({ summary: 'Update an organization hierarchy unit' })
  async updateUnit(
    @Param('unitId') unitId: string,
    @Body() dto: UpdateOrganizationUnitDto,
  ) {
    return {
      success: true,
      data: await this.service.updateUnit(unitId, dto),
      message: 'Organization unit updated successfully',
    };
  }

  @Post(':organizationId/scopes')
  @Permissions(Permission.ORG_SCOPE_MANAGE)
  @OrganizationScope(Permission.ORG_SCOPE_MANAGE)
  @ApiOperation({ summary: 'Assign an enterprise scope to a user' })
  async assignScope(
    @Param('organizationId') organizationId: string,
    @Body() dto: AssignOrganizationScopeDto,
  ) {
    return {
      success: true,
      data: await this.service.assignScope({ ...dto, organizationId }),
      message: 'Organization scope assigned successfully',
    };
  }

  @Get(':organizationId/scopes')
  @Permissions(Permission.ORG_SCOPE_MANAGE)
  @OrganizationScope(Permission.ORG_SCOPE_MANAGE)
  @ApiOperation({ summary: 'List user scopes for an organization' })
  async listScopes(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.listScopes(organizationId),
      message: 'Organization scopes retrieved successfully',
    };
  }

  @Post(':organizationId/backfill')
  @Permissions(Permission.ORG_HIERARCHY_MANAGE)
  @OrganizationScope(Permission.ORG_HIERARCHY_MANAGE)
  @ApiOperation({ summary: 'Backfill Phase 8 branches into Phase 10 hierarchy' })
  async backfill(@Param('organizationId') organizationId: string) {
    return {
      success: true,
      data: await this.service.backfillExistingBranches(organizationId),
      message: 'Organization hierarchy backfilled successfully',
    };
  }
}
