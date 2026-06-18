import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { WebsiteService } from './website.service';
import { CurrentUser, Permissions, Public } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Website Builder')
@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public website content (domain/tenantId)' })
  async findPublic(
    @Query('tenantId') tenantId?: string,
    @Query('customDomain') customDomain?: string,
  ) {
    return this.websiteService.findPublic(tenantId, customDomain);
  }

  @Get('config')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.WEBSITE_BUILDER_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get website builder settings for admin' })
  async getConfig(@CurrentUser('tenantId') tenantId: string) {
    return this.websiteService.getConfig(tenantId);
  }

  @Post('config')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.WEBSITE_BUILDER_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save website builder configuration' })
  async updateConfig(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.websiteService.updateConfig(tenantId, body);
  }
}
