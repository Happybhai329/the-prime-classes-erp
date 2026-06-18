import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
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
  CreateSsoDomainDto,
  CreateSsoProviderDto,
  RegisterTrustedDeviceDto,
  VerifyMfaDto,
} from './dto/security.dto';
import { SecurityService } from './security.service';

@ApiTags('Enterprise Security')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly service: SecurityService) {}

  @Post('mfa/totp/enroll')
  async enrollTotp(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('email') email: string,
  ) {
    return {
      success: true,
      data: await this.service.beginTotpEnrollment(tenantId, userId, email),
      message: 'TOTP enrollment started successfully',
    };
  }

  @Post('mfa/totp/verify')
  async verifyTotp(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: VerifyMfaDto,
  ) {
    return {
      success: true,
      data: await this.service.verifyTotpEnrollment(tenantId, userId, dto),
      message: 'TOTP MFA enabled successfully',
    };
  }

  @Get('mfa')
  async listMfa(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.service.listMfaFactors(tenantId, userId),
      message: 'MFA factors retrieved successfully',
    };
  }

  @Delete('mfa/:factorId')
  async disableMfa(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('factorId') factorId: string,
  ) {
    return {
      success: true,
      data: await this.service.disableMfaFactor(tenantId, userId, factorId),
      message: 'MFA factor disabled successfully',
    };
  }

  @Post('devices')
  async registerDevice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterTrustedDeviceDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return {
      success: true,
      data: await this.service.registerTrustedDevice(tenantId, userId, dto, {
        ipAddress,
        userAgent,
      }),
      message: 'Trusted device registered successfully',
    };
  }

  @Get('devices')
  async devices(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.service.listTrustedDevices(tenantId, userId),
      message: 'Trusted devices retrieved successfully',
    };
  }

  @Delete('devices/:deviceId')
  async revokeDevice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return {
      success: true,
      data: await this.service.revokeDevice(tenantId, userId, deviceId),
      message: 'Device revoked successfully',
    };
  }

  @Get('sessions')
  async sessions(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.service.listSessions(tenantId, userId),
      message: 'Sessions retrieved successfully',
    };
  }

  @Delete('sessions/:sessionId')
  async revokeSession(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return {
      success: true,
      data: await this.service.revokeSession(tenantId, userId, sessionId),
      message: 'Session revoked successfully',
    };
  }

  @Post('sso/providers')
  @Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
  async createSsoProvider(@Body() dto: CreateSsoProviderDto) {
    return {
      success: true,
      data: await this.service.createSsoProvider(dto),
      message: 'SSO provider created successfully',
    };
  }

  @Get('sso/providers')
  @Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
  async listSsoProviders(
    @Query('organizationId') organizationId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listSsoProviders(organizationId, tenantId),
      message: 'SSO providers retrieved successfully',
    };
  }

  @Post('sso/domains')
  @Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
  async createSsoDomain(@Body() dto: CreateSsoDomainDto) {
    return {
      success: true,
      data: await this.service.createSsoDomain(dto),
      message: 'SSO domain created successfully',
    };
  }
}
