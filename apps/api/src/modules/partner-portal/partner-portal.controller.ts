import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { PartnerPortalService } from './partner-portal.service';

@ApiTags('Partner Portal')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('partner-portal')
export class PartnerPortalController {
  constructor(private readonly service: PartnerPortalService) {}

  @Get()
  @Permissions(Permission.PARTNER_PORTAL_VIEW)
  async getPortal(@CurrentUser('tenantId') tenantId: string) {
    return {
      success: true,
      data: await this.service.getPortal(tenantId),
      message: 'Partner portal retrieved successfully',
    };
  }
}
