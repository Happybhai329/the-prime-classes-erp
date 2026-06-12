import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Permissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get paginated audit logs' })
  async getLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.findAll(tenantId, query);
  }

  @Get('logs/user/:userId')
  @Permissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get logs for a specific user' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  async getUserLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: QueryAuditDto,
  ) {
    query.userId = userId;
    return this.auditService.findAll(tenantId, query);
  }

  @Get('logs/resource/:resource')
  @Permissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get logs for a specific resource type' })
  @ApiParam({ name: 'resource', type: 'string' })
  async getResourceLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Param('resource') resource: string,
    @Query() query: QueryAuditDto,
  ) {
    query.resource = resource;
    return this.auditService.findAll(tenantId, query);
  }

  @Get('activity-feed')
  @Permissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get recent activity feed (excludes noisy logs)' })
  async getActivityFeed(
    @CurrentUser('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getActivityFeed(tenantId, limit ? Number(limit) : 50);
  }

  @Get('security-logs')
  @Permissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Get security-related logs (logins, auth changes)' })
  async getSecurityLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.getSecurityLogs(tenantId, query);
  }
}
