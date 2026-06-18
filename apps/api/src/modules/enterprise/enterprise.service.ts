import { Injectable, NotFoundException } from '@nestjs/common';
import { RollupPeriodType } from '@prime/shared-types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EnterpriseService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(
    organizationId: string,
    periodType: RollupPeriodType = RollupPeriodType.DAILY,
  ) {
    const latest = await this.prisma.enterpriseRollup.findFirst({
      where: {
        organizationId,
        organizationUnitId: null,
        branchId: null,
        tenantId: null,
        periodType: periodType as any,
      },
      orderBy: { periodStart: 'desc' },
    });

    if (!latest) {
      throw new NotFoundException(
        'Enterprise rollup is not available yet. Trigger an enterprise sync first.',
      );
    }

    const [health, topUnits] = await Promise.all([
      this.getLatestBranchHealth(organizationId),
      this.prisma.enterpriseRollup.findMany({
        where: {
          organizationId,
          periodType: periodType as any,
          periodStart: latest.periodStart,
          organizationUnitId: { not: null },
        },
        include: {
          organizationUnit: { select: { name: true } },
        },
        orderBy: { totalRevenue: 'desc' },
        take: 10,
      }),
    ]);

    const healthCounts = {
      healthy: 0,
      degraded: 0,
      critical: 0,
      suspended: 0,
      unknown: 0,
    };

    health.forEach((item) => {
      const key = item.status.toLowerCase() as keyof typeof healthCounts;
      healthCounts[key] = (healthCounts[key] || 0) + 1;
    });

    return {
      organizationId,
      periodType: latest.periodType,
      periodStart: latest.periodStart.toISOString(),
      periodEnd: latest.periodEnd.toISOString(),
      totalInstitutes: latest.totalInstitutes,
      totalBranches: latest.totalBranches,
      totalStudents: latest.totalStudents,
      activeUsers: latest.activeUsers,
      totalRevenue: Number(latest.totalRevenue),
      enrollmentGrowth: Number(latest.enrollmentGrowth),
      examSuccessRate: Number(latest.examSuccessRate),
      facultyEffectiveness: Number(latest.facultyEffectiveness),
      branchHealth: healthCounts,
      topUnits: topUnits.map((item) => ({
        organizationUnitId: item.organizationUnitId,
        name: item.organizationUnit?.name || 'Unknown unit',
        totalStudents: item.totalStudents,
        totalRevenue: Number(item.totalRevenue),
      })),
    };
  }

  async getLatestBranchHealth(organizationId: string) {
    const branches = await this.prisma.branch.findMany({
      where: { organizationId },
      select: { tenantId: true },
    });

    if (branches.length === 0) {
      return [];
    }

    const tenantIds = branches.map((branch) => branch.tenantId);
    const snapshots = await this.prisma.branchHealthSnapshot.findMany({
      where: { organizationId, tenantId: { in: tenantIds } },
      orderBy: { recordedAt: 'desc' },
    });

    const latestByTenant = new Map<string, (typeof snapshots)[number]>();
    snapshots.forEach((snapshot) => {
      if (!latestByTenant.has(snapshot.tenantId)) {
        latestByTenant.set(snapshot.tenantId, snapshot);
      }
    });

    return Array.from(latestByTenant.values()).map((snapshot) => ({
      ...snapshot,
      systemHealth: Number(snapshot.systemHealth),
      revenueHealth: Number(snapshot.revenueHealth),
    }));
  }
}
