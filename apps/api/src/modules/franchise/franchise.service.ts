import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FranchiseReportSummary } from '@prime/shared-types';

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: PrismaService) {}

  async getFranchiseReport(tenantId: string): Promise<FranchiseReportSummary> {
    // 1. Identify which organization this tenant belongs to
    const branchMapping = await this.prisma.branch.findUnique({
      where: { tenantId },
      include: { organization: true },
    });

    if (!branchMapping) {
      throw new BadRequestException('This institute is not configured as a branch in any franchise organization');
    }

    const orgId = branchMapping.organizationId;
    const orgName = branchMapping.organization.name;

    // 2. Fetch all branches of this organization
    const branches = await this.prisma.branch.findMany({
      where: { organizationId: orgId },
    });

    const branchPerformances = await Promise.all(
      branches.map(async (b) => {
        const studentCount = await this.prisma.student.count({
          where: { tenantId: b.tenantId, deletedAt: null },
        });

        // Consolidate fee payments as revenue
        const revenueAggregate = await this.prisma.feePayment.aggregate({
          where: { tenantId: b.tenantId, deletedAt: null },
          _sum: { amountPaid: true },
        });
        const revenue = Number(revenueAggregate._sum.amountPaid || 0);

        const activeUsers = await this.prisma.user.count({
          where: { tenantId: b.tenantId, isActive: true, deletedAt: null },
        });

        return {
          branchId: b.id,
          branchName: b.name,
          branchCode: b.code,
          studentCount,
          revenue,
          activeUsersCount: activeUsers,
        };
      })
    );

    // 3. Consolidated figures
    const totalStudents = branchPerformances.reduce((sum, bp) => sum + bp.studentCount, 0);
    const totalRevenue = branchPerformances.reduce((sum, bp) => sum + bp.revenue, 0);

    // Consolidated faculty count
    const tenantIds = branches.map((b) => b.tenantId);
    const facultyCount = await this.prisma.faculty.count({
      where: { tenantId: { in: tenantIds } },
    });

    // Consolidated student enrollment trends (mock grouped by months of the academic year for visualization)
    const enrollmentTrends = [
      { month: 'Jan', studentCount: Math.round(totalStudents * 0.7) },
      { month: 'Feb', studentCount: Math.round(totalStudents * 0.75) },
      { month: 'Mar', studentCount: Math.round(totalStudents * 0.8) },
      { month: 'Apr', studentCount: Math.round(totalStudents * 0.9) },
      { month: 'May', studentCount: totalStudents },
    ];

    return {
      organizationId: orgId,
      organizationName: orgName,
      totalStudents,
      totalRevenue,
      branchPerformance: branchPerformances,
      facultyCount,
      enrollmentTrends,
    };
  }
}
