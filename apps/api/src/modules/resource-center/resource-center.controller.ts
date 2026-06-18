import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import {
  OrganizationScope,
  OrganizationScopeGuard,
} from '../../common/enterprise';
import { PermissionsGuard } from '../../common/guards';
import {
  CreateResourceItemDto,
  CreateSharedAcademicAssetDto,
  PublishResourceDto,
} from './dto/resource-center.dto';
import { ResourceCenterService } from './resource-center.service';

@ApiTags('Enterprise Resource Center')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard, OrganizationScopeGuard)
@Controller('enterprise/organizations/:organizationId/resources')
export class ResourceCenterController {
  constructor(private readonly service: ResourceCenterService) {}

  @Post()
  @Permissions(Permission.RESOURCE_CENTER_MANAGE)
  @OrganizationScope(Permission.RESOURCE_CENTER_MANAGE)
  async createItem(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateResourceItemDto,
  ) {
    return {
      success: true,
      data: await this.service.createItem(organizationId, dto),
      message: 'Resource item created successfully',
    };
  }

  @Get()
  @Permissions(Permission.PARTNER_PORTAL_VIEW)
  @OrganizationScope(Permission.PARTNER_PORTAL_VIEW)
  async listItems(
    @Param('organizationId') organizationId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listItems(organizationId, tenantId),
      message: 'Resource items retrieved successfully',
    };
  }

  @Post(':resourceId/publish')
  @Permissions(Permission.RESOURCE_CENTER_MANAGE)
  @OrganizationScope(Permission.RESOURCE_CENTER_MANAGE)
  async publishItem(
    @Param('organizationId') organizationId: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: PublishResourceDto,
  ) {
    return {
      success: true,
      data: await this.service.publishItem(organizationId, resourceId, dto),
      message: 'Resource published successfully',
    };
  }

  @Post('academic-assets')
  @Permissions(Permission.RESOURCE_CENTER_MANAGE)
  @OrganizationScope(Permission.RESOURCE_CENTER_MANAGE)
  async createSharedAsset(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateSharedAcademicAssetDto,
  ) {
    return {
      success: true,
      data: await this.service.createSharedAsset(organizationId, dto),
      message: 'Shared academic asset created successfully',
    };
  }

  @Get('academic-assets')
  @Permissions(Permission.PARTNER_PORTAL_VIEW)
  @OrganizationScope(Permission.PARTNER_PORTAL_VIEW)
  async listSharedAssets(
    @Param('organizationId') organizationId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listSharedAssets(organizationId, tenantId),
      message: 'Shared academic assets retrieved successfully',
    };
  }

  @Post('academic-assets/:assetId/publish')
  @Permissions(Permission.RESOURCE_CENTER_MANAGE)
  @OrganizationScope(Permission.RESOURCE_CENTER_MANAGE)
  async publishSharedAsset(
    @Param('organizationId') organizationId: string,
    @Param('assetId') assetId: string,
    @Body() dto: PublishResourceDto,
  ) {
    return {
      success: true,
      data: await this.service.publishSharedAsset(
        organizationId,
        assetId,
        dto,
      ),
      message: 'Shared academic asset published successfully',
    };
  }
}
