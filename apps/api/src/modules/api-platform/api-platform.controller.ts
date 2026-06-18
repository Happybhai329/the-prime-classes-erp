import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { ApiPlatformService } from './api-platform.service';
import {
  CreateApiClientDto,
  CreateApiKeyDto,
  CreateWebhookEndpointDto,
  PublishWebhookEventDto,
} from './dto/api-platform.dto';

@ApiTags('API Platform Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('api-platform')
export class ApiPlatformController {
  constructor(private readonly service: ApiPlatformService) {}

  @Post('clients')
  @Permissions(Permission.API_KEY_MANAGE)
  @ApiOperation({ summary: 'Create a scoped public API client' })
  async createClient(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateApiClientDto,
  ) {
    return {
      success: true,
      data: await this.service.createClient(userId, dto),
      message: 'API client created successfully',
    };
  }

  @Get('clients')
  @Permissions(Permission.API_KEY_MANAGE)
  async listClients(
    @Query('organizationId') organizationId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listClients(organizationId, tenantId),
      message: 'API clients retrieved successfully',
    };
  }

  @Post('clients/:clientId/keys')
  @Permissions(Permission.API_KEY_MANAGE)
  async createKey(
    @Param('clientId') clientId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return {
      success: true,
      data: await this.service.createKey(clientId, userId, dto),
      message:
        'API key created successfully. The secret is returned only once.',
    };
  }

  @Delete('keys/:keyId')
  @Permissions(Permission.API_KEY_MANAGE)
  async revokeKey(@Param('keyId') keyId: string) {
    return {
      success: true,
      data: await this.service.revokeKey(keyId),
      message: 'API key revoked successfully',
    };
  }

  @Post('webhooks')
  @Permissions(Permission.WEBHOOK_MANAGE)
  async createWebhook(@Body() dto: CreateWebhookEndpointDto) {
    return {
      success: true,
      data: await this.service.createWebhookEndpoint(dto),
      message:
        'Webhook endpoint created successfully. The signing secret is returned only once.',
    };
  }

  @Get('webhooks')
  @Permissions(Permission.WEBHOOK_MANAGE)
  async listWebhooks(
    @Query('organizationId') organizationId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return {
      success: true,
      data: await this.service.listWebhookEndpoints(
        organizationId,
        tenantId,
      ),
      message: 'Webhook endpoints retrieved successfully',
    };
  }

  @Post('webhook-events')
  @Permissions(Permission.WEBHOOK_MANAGE)
  async publishEvent(@Body() dto: PublishWebhookEventDto) {
    return {
      success: true,
      data: await this.service.publishWebhookEvent(dto),
      message: 'Webhook event accepted successfully',
    };
  }
}
