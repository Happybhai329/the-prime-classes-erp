import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permission } from '@prime/shared-types';
import { Permissions } from '../../common/decorators';
import { PermissionsGuard } from '../../common/guards';
import { DisasterRecoveryService } from './disaster-recovery.service';

@ApiTags('Disaster Recovery')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Permissions(Permission.ENTERPRISE_SECURITY_MANAGE)
@Controller('disaster-recovery')
export class DisasterRecoveryController {
  constructor(private readonly service: DisasterRecoveryService) {}

  @Get('backups')
  backups() {
    return this.service.listBackupRuns();
  }

  @Post('backups')
  startBackup(
    @Body() body: { target: string; metadata?: Record<string, unknown> },
  ) {
    return this.service.startBackup(body.target, body.metadata);
  }

  @Patch('backups/:id')
  completeBackup(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'COMPLETED' | 'FAILED';
      backupUrl?: string;
      sizeBytes?: string;
      checksum?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.service.completeBackup(id, body);
  }

  @Get('restore-drills')
  restoreDrills() {
    return this.service.listRestoreDrills();
  }

  @Post('restore-drills')
  recordRestoreDrill(
    @Body()
    body: {
      backupRunId?: string;
      status: 'STARTED' | 'PASSED' | 'FAILED';
      rpoMinutes?: number;
      rtoMinutes?: number;
      notes?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.service.recordRestoreDrill(body);
  }

  @Get('events')
  events() {
    return this.service.listEvents();
  }
}
