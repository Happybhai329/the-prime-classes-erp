import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FeeDashboardService {
  private readonly logger = new Logger(FeeDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      revenueThisMonth,
      revenueThisYear,
      totalStudentFees,
      paidStudentFees,
      overdueInstallments,
      refundTotal,
    ] = await Promise.all([
      // Revenue this month
      this.prisma.feePayment.aggregate({
        where: { tenantId, deletedAt: null, paymentDate: { gte: startOfMonth } },
        _sum: { amountPaid: true },
      }),
      // Revenue this year
      this.prisma.feePayment.aggregate({
        where: { tenantId, deletedAt: null, paymentDate: { gte: startOfYear } },
        _sum: { amountPaid: true },
      }),
      // Total student fees
      this.prisma.studentFee.aggregate({
        where: { tenantId, deletedAt: null },
        _sum: { netAmount: true, paidAmount: true },
        _count: true,
      }),
      // Fully paid students
      this.prisma.studentFee.count({
        where: { tenantId, deletedAt: null, status: 'PAID' },
      }),
      // Overdue installments
      this.prisma.feeInstallment.aggregate({
        where: {
          studentFee: { tenantId, deletedAt: null },
          dueDate: { lt: now },
          status: { in: ['PENDING', 'PARTIAL'] },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      // Total refunds
      this.prisma.feeRefund.aggregate({
        where: { tenantId, status: 'PROCESSED' },
        _sum: { amount: true },
      }),
    ]);

    const totalNet = Number(totalStudentFees._sum.netAmount || 0);
    const totalPaid = Number(totalStudentFees._sum.paidAmount || 0);
    const pendingFees = totalNet - totalPaid;
    const overdueTotal = Number(overdueInstallments._sum.amount || 0) - Number(overdueInstallments._sum.paidAmount || 0);
    const collectionRate = totalNet > 0 ? Math.round((totalPaid / totalNet) * 100 * 100) / 100 : 0;

    return {
      revenueThisMonth: Number(revenueThisMonth._sum.amountPaid || 0),
      revenueThisYear: Number(revenueThisYear._sum.amountPaid || 0),
      pendingFees,
      overdueAmount: overdueTotal,
      collectionRate,
      refundAmount: Number(refundTotal._sum.amount || 0),
      totalStudentsWithFees: totalStudentFees._count,
      studentsFullyPaid: paidStudentFees,
    };
  }

  async getMonthlyRevenue(tenantId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const months = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(targetYear, month, 1);
      const endDate = new Date(targetYear, month + 1, 1);

      const revenue = await this.prisma.feePayment.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          paymentDate: { gte: startDate, lt: endDate },
        },
        _sum: { amountPaid: true },
        _count: true,
      });

      months.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Number(revenue._sum.amountPaid || 0),
        collections: revenue._count,
      });
    }

    return months;
  }

  async getBatchRevenue(tenantId: string, academicYear?: string) {
    const batches = await this.prisma.batch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const result = [];

    for (const batch of batches) {
      const batchStudents = await this.prisma.batchStudent.findMany({
        where: { batchId: batch.id, status: 'ACTIVE' },
        select: { studentId: true },
      });
      const studentIds = batchStudents.map((bs) => bs.studentId);

      if (studentIds.length === 0) continue;

      const feeAgg = await this.prisma.studentFee.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          studentId: { in: studentIds },
          ...(academicYear && { academicYear }),
        },
        _sum: { netAmount: true, paidAmount: true },
      });

      const totalFee = Number(feeAgg._sum.netAmount || 0);
      const collected = Number(feeAgg._sum.paidAmount || 0);

      result.push({
        batchName: batch.name,
        totalFee,
        collected,
        outstanding: totalFee - collected,
      });
    }

    return result;
  }

  async getCollectionTrend(tenantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await this.prisma.feePayment.findMany({
      where: { tenantId, deletedAt: null, paymentDate: { gte: startDate } },
      select: { paymentDate: true, amountPaid: true },
      orderBy: { paymentDate: 'asc' },
    });

    const dailyMap = new Map<string, { amount: number; count: number }>();
    payments.forEach((p) => {
      const dateStr = p.paymentDate.toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr) || { amount: 0, count: 0 };
      existing.amount += Number(p.amountPaid);
      existing.count += 1;
      dailyMap.set(dateStr, existing);
    });

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }));
  }

  async getOutstandingTrend(tenantId: string) {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const outstanding = await this.prisma.studentFee.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { lte: new Date(now.getFullYear(), now.getMonth() - i + 1, 1) },
        },
        _sum: { netAmount: true, paidAmount: true },
      });

      months.push({
        month: label,
        outstanding: Number(outstanding._sum.netAmount || 0) - Number(outstanding._sum.paidAmount || 0),
      });
    }

    return months;
  }
}
