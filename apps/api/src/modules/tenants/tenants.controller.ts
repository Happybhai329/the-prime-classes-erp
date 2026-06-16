import { Controller, Get, Patch, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TenantsService } from './tenants.service';
import { BrandingSettings } from '@prime/shared-types';
import { Public, CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { Permission } from '@prime/shared-types';

@ApiTags('Tenant Configuration')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get('branding')
  @ApiOperation({ summary: 'Resolve dynamic branding assets from subdomains/custom domains' })
  async getResolvedBranding(@Req() req: Request) {
    const tenantId = (req as any).tenantId;
    if (!tenantId) {
      // Return default SaaS system branding
      return {
        success: true,
        data: {
          name: 'Prime ERP SaaS',
          brandColors: {
            primaryColor: '#1a365d',
            secondaryColor: '#e53e3e',
            sidebarBg: '#ffffff',
          },
        },
      };
    }
    const branding = await this.tenantsService.getBranding(tenantId);
    return {
      success: true,
      data: branding,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch('branding')
  @Permissions(Permission.TENANT_MANAGE)
  @ApiOperation({ summary: 'Update custom colors, logo, and messaging assets' })
  async updateBranding(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: BrandingSettings
  ) {
    const tenant = await this.tenantsService.updateBranding(tenantId, dto);
    return {
      success: true,
      data: tenant,
      message: 'Dynamic branding settings updated successfully',
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post('domain/verify')
  @Permissions(Permission.TENANT_MANAGE)
  @ApiOperation({ summary: 'Verify and link a custom domain' })
  async verifyCustomDomain(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: { customDomain: string }
  ) {
    if (!body.customDomain) throw new BadRequestException('customDomain is required');
    const tenant = await this.tenantsService.verifyCustomDomain(tenantId, body.customDomain);
    return {
      success: true,
      data: tenant,
      message: 'Custom domain verified and activated successfully',
    };
  }
}
