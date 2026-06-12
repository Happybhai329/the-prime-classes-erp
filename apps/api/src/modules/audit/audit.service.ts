import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { QueryAuditDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    tenantId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    ipAddress?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          resource,
          resourceId: resourceId || null,
          ipAddress: ipAddress || null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error}`);
      // We don't throw here because audit logging shouldn't break the main business flow
    }
  }

  async findAll(tenantId: string, query: QueryAuditDto) {
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      ...(query.action && { action: query.action }),
      ...(query.resource && { resource: query.resource }),
      ...(query.userId && { userId: query.userId }),
      ...(query.search && {
        OR: [
          { action: { contains: query.search, mode: 'insensitive' as const } },
          { resource: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, role: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.email || 'Unknown',
        userRole: log.user?.role || 'Unknown',
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async getActivityFeed(tenantId: string, limit: number = 50) {
    // Activity feed usually excludes system/background tasks or high-volume reads
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      action: {
        notIn: ['VIEW', 'LOGIN', 'LOGOUT'], // Exclude noisy actions for the feed
      },
    };

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.email || 'Unknown',
        userRole: log.user?.role || 'Unknown',
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(logs.length, 1, limit), // Simplified meta for feed
    };
  }

  async getSecurityLogs(tenantId: string, query: QueryAuditDto) {
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      action: {
        in: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'FAILED_LOGIN'],
      },
      ...(query.userId && { userId: query.userId }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.email || 'Unknown',
        userRole: log.user?.role || 'Unknown',
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }
}
