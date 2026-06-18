import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import {
  CreateMarketplaceAppDto,
  InstallMarketplaceAppDto,
} from './dto/marketplace.dto';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get('apps')
  async listApps(@Query('includeUnpublished') includeUnpublished?: string) {
    return {
      success: true,
      data: await this.service.listApps(includeUnpublished === 'true'),
      message: 'Marketplace apps retrieved successfully',
    };
  }

  @Post('apps')
  @Permissions(Permission.MARKETPLACE_INSTALL)
  async createApp(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateMarketplaceAppDto,
  ) {
    return {
      success: true,
      data: await this.service.createApp(userId, dto),
      message: 'Marketplace app submitted successfully',
    };
  }

  @Patch('apps/:appId/publish')
  @Permissions(Permission.MARKETPLACE_INSTALL)
  async publishApp(@Param('appId') appId: string) {
    return {
      success: true,
      data: await this.service.publishApp(appId),
      message: 'Marketplace app published successfully',
    };
  }

  @Post('apps/:appId/install')
  @Permissions(Permission.MARKETPLACE_INSTALL)
  async installApp(
    @Param('appId') appId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: InstallMarketplaceAppDto,
  ) {
    return {
      success: true,
      data: await this.service.installApp(appId, userId, dto),
      message: 'Marketplace app installed successfully',
    };
  }

  @Get('installations')
  @Permissions(Permission.MARKETPLACE_INSTALL)
  async listInstallations(
    @Query('organizationId') organizationId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listInstallations(organizationId, tenantId),
      message: 'Marketplace installations retrieved successfully',
    };
  }

  @Post('installations/:installationId/context-token')
  @Permissions(Permission.MARKETPLACE_INSTALL)
  async contextToken(
    @Param('installationId') installationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.service.issueContextToken(installationId, userId),
      message: 'Sandbox context token issued successfully',
    };
  }
}
