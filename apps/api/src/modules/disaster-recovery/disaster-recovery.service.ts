import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DisasterRecoveryService {
  constructor(private readonly prisma: PrismaService) {}

  listBackupRuns() {
    return this.prisma.backupRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  startBackup(target: string, metadata: Record<string, unknown> = {}) {
    return this.prisma.backupRun.create({
      data: { target, metadata: metadata as any },
    });
  }

  completeBackup(
    id: string,
    input: {
      status: 'COMPLETED' | 'FAILED';
      backupUrl?: string;
      sizeBytes?: string;
      checksum?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.prisma.backupRun.update({
      where: { id },
      data: {
        status: input.status,
        backupUrl: input.backupUrl || null,
        sizeBytes: input.sizeBytes ? BigInt(input.sizeBytes) : null,
        checksum: input.checksum || null,
        completedAt: new Date(),
        metadata: (input.metadata as any) || {},
      },
    });
  }

  listRestoreDrills() {
    return this.prisma.restoreDrill.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  recordRestoreDrill(input: {
    backupRunId?: string;
    status: 'STARTED' | 'PASSED' | 'FAILED';
    rpoMinutes?: number;
    rtoMinutes?: number;
    notes?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.restoreDrill.create({
      data: {
        backupRunId: input.backupRunId || null,
        status: input.status,
        rpoMinutes: input.rpoMinutes || 15,
        rtoMinutes: input.rtoMinutes || 240,
        notes: input.notes || null,
        completedAt:
          input.status === 'PASSED' || input.status === 'FAILED'
            ? new Date()
            : null,
        metadata: (input.metadata as any) || {},
      },
    });
  }

  listEvents() {
    return this.prisma.disasterRecoveryEvent.findMany({
      orderBy: { openedAt: 'desc' },
      take: 100,
    });
  }
}
