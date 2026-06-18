import { Injectable, Logger } from '@nestjs/common';
import {
  BranchHealthStatus,
  RollupPeriodType,
} from '@prime/shared-types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EnterpriseRollupService {
  private readonly logger = new Logger(EnterpriseRollupService.name);

  constructor(private readonly prisma: PrismaService) {}

  async refreshOrganization(organizationId: string, at = new Date()) {
    const branches = await this.prisma.branch.findMany({
      where: { organizationId },
      include: { organizationUnit: true, tenant: true },
    });
    const tenantIds = branches.map((branch) => branch.tenantId);

    const periodStart = new Date(
      Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()),
    );
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);
    periodEnd.setUTCMilliseconds(-1);

    if (tenantIds.length === 0) {
      return this.writeOrganizationRollup(organizationId, periodStart, periodEnd, {
        totalInstitutes: 0,
        totalBranches: 0,
        totalStudents: 0,
        activeUsers: 0,
        totalRevenue: 0,
      });
    }

    const [students, activeUsers, revenue, openTickets, faculty] =
      await Promise.all([
        this.prisma.student.groupBy({
          by: ['tenantId'],
          where: { tenantId: { in: tenantIds }, deletedAt: null },
          _count: { _all: true },
        }),
        this.prisma.user.groupBy({
          by: ['tenantId'],
          where: {
            tenantId: { in: tenantIds },
            isActive: true,
            deletedAt: null,
          },
          _count: { _all: true },
        }),
        this.prisma.feePayment.groupBy({
          by: ['tenantId'],
          where: {
            tenantId: { in: tenantIds },
            paymentDate: { gte: periodStart, lte: periodEnd },
            deletedAt: null,
          },
          _sum: { amountPaid: true },
        }),
        this.prisma.supportTicket.groupBy({
          by: ['tenantId'],
          where: {
            tenantId: { in: tenantIds },
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
          _count: { _all: true },
        }),
        this.prisma.faculty.groupBy({
          by: ['tenantId'],
          where: { tenantId: { in: tenantIds } },
          _count: { _all: true },
        }),
      ]);

    const studentByTenant = this.countMap(students);
    const usersByTenant = this.countMap(activeUsers);
    const ticketsByTenant = this.countMap(openTickets);
    const facultyByTenant = this.countMap(faculty);
    const revenueByTenant = new Map(
      revenue.map((item) => [
        item.tenantId,
        Number(item._sum.amountPaid || 0),
      ]),
    );

    let totalStudents = 0;
    let totalActiveUsers = 0;
    let totalRevenue = 0;

    for (const branch of branches) {
      const studentCount = studentByTenant.get(branch.tenantId) || 0;
      const activeUserCount = usersByTenant.get(branch.tenantId) || 0;
      const branchRevenue = revenueByTenant.get(branch.tenantId) || 0;
      const ticketCount = ticketsByTenant.get(branch.tenantId) || 0;
      const facultyCount = facultyByTenant.get(branch.tenantId) || 0;

      totalStudents += studentCount;
      totalActiveUsers += activeUserCount;
      totalRevenue += branchRevenue;

      const status = this.calculateHealth(
        branch.tenant.isActive,
        ticketCount,
        activeUserCount,
      );
      const systemHealth =
        status === BranchHealthStatus.HEALTHY
          ? 100
          : status === BranchHealthStatus.DEGRADED
            ? 70
            : status === BranchHealthStatus.CRITICAL
              ? 30
              : 0;

      await this.prisma.branchHealthSnapshot.create({
        data: {
          organizationId,
          organizationUnitId: branch.organizationUnit?.id || null,
          branchId: branch.id,
          tenantId: branch.tenantId,
          status: status as any,
          systemHealth,
          revenueHealth: branchRevenue > 0 ? 100 : 50,
          activeUsers: activeUserCount,
          studentCount,
          openTickets: ticketCount,
          metrics: { facultyCount, branchRevenue },
          recordedAt: at,
        },
      });

      await this.writeRollup({
        organizationId,
        organizationUnitId: branch.organizationUnit?.id || null,
        branchId: branch.id,
        tenantId: branch.tenantId,
        periodStart,
        periodEnd,
        totalInstitutes: 1,
        totalBranches: 1,
        totalStudents: studentCount,
        activeUsers: activeUserCount,
        totalRevenue: branchRevenue,
        facultyEffectiveness: facultyCount > 0 ? 100 : 0,
      });
    }

    await this.refreshParentUnitRollups(
      organizationId,
      periodStart,
      periodEnd,
    );

    const result = await this.writeOrganizationRollup(
      organizationId,
      periodStart,
      periodEnd,
      {
        totalInstitutes: branches.length,
        totalBranches: branches.length,
        totalStudents,
        activeUsers: totalActiveUsers,
        totalRevenue,
      },
    );

    this.logger.log(
      `Enterprise rollup refreshed for organization ${organizationId}`,
    );
    return result;
  }

  private async refreshParentUnitRollups(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const units = await this.prisma.organizationUnit.findMany({
      where: {
        organizationId,
        type: { notIn: ['ORGANIZATION', 'BRANCH'] },
      },
    });

    for (const unit of units) {
      const descendants = await this.prisma.organizationUnitClosure.findMany({
        where: { ancestorId: unit.id, depth: { gt: 0 } },
        select: { descendantId: true },
      });
      const descendantIds = descendants.map((item) => item.descendantId);

      const branchRollups = await this.prisma.enterpriseRollup.findMany({
        where: {
          organizationId,
          organizationUnitId: { in: descendantIds },
          branchId: { not: null },
          periodType: 'DAILY',
          periodStart,
        },
      });

      await this.writeRollup({
        organizationId,
        organizationUnitId: unit.id,
        branchId: null,
        tenantId: null,
        periodStart,
        periodEnd,
        totalInstitutes: branchRollups.length,
        totalBranches: branchRollups.length,
        totalStudents: branchRollups.reduce(
          (sum, item) => sum + item.totalStudents,
          0,
        ),
        activeUsers: branchRollups.reduce(
          (sum, item) => sum + item.activeUsers,
          0,
        ),
        totalRevenue: branchRollups.reduce(
          (sum, item) => sum + Number(item.totalRevenue),
          0,
        ),
      });
    }
  }

  private writeOrganizationRollup(
    organizationId: string,
    periodStart: Date,
    periodEnd: Date,
    metrics: {
      totalInstitutes: number;
      totalBranches: number;
      totalStudents: number;
      activeUsers: number;
      totalRevenue: number;
    },
  ) {
    return this.writeRollup({
      organizationId,
      organizationUnitId: null,
      branchId: null,
      tenantId: null,
      periodStart,
      periodEnd,
      ...metrics,
    });
  }

  private async writeRollup(input: {
    organizationId: string;
    organizationUnitId: string | null;
    branchId: string | null;
    tenantId: string | null;
    periodStart: Date;
    periodEnd: Date;
    totalInstitutes: number;
    totalBranches: number;
    totalStudents: number;
    activeUsers: number;
    totalRevenue: number;
    facultyEffectiveness?: number;
  }) {
    const existing = await this.prisma.enterpriseRollup.findFirst({
      where: {
        organizationId: input.organizationId,
        organizationUnitId: input.organizationUnitId,
        branchId: input.branchId,
        tenantId: input.tenantId,
        periodType: RollupPeriodType.DAILY as any,
        periodStart: input.periodStart,
      },
    });

    const data = {
      periodEnd: input.periodEnd,
      totalInstitutes: input.totalInstitutes,
      totalBranches: input.totalBranches,
      totalStudents: input.totalStudents,
      activeUsers: input.activeUsers,
      totalRevenue: input.totalRevenue,
      facultyEffectiveness: input.facultyEffectiveness || 0,
      computedAt: new Date(),
    };

    if (existing) {
      return this.prisma.enterpriseRollup.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.enterpriseRollup.create({
      data: {
        organizationId: input.organizationId,
        organizationUnitId: input.organizationUnitId,
        branchId: input.branchId,
        tenantId: input.tenantId,
        periodType: RollupPeriodType.DAILY as any,
        periodStart: input.periodStart,
        ...data,
      },
    });
  }

  private countMap(
    rows: Array<{ tenantId: string; _count: { _all: number } }>,
  ) {
    return new Map(rows.map((item) => [item.tenantId, item._count._all]));
  }

  private calculateHealth(
    isActive: boolean,
    openTickets: number,
    activeUsers: number,
  ) {
    if (!isActive) return BranchHealthStatus.SUSPENDED;
    if (openTickets >= 10 || activeUsers === 0) return BranchHealthStatus.CRITICAL;
    if (openTickets >= 5) return BranchHealthStatus.DEGRADED;
    return BranchHealthStatus.HEALTHY;
  }
}
