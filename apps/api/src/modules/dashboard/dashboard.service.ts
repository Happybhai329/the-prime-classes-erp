import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin dashboard statistics.
   */
  async getAdminDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalStudents,
      activeStudents,
      totalBatches,
      activeBatches,
      totalFaculty,
      todayAttendanceSessions,
      monthlyFeePayments,
      upcomingTests,
      recentAdmissions,
      recentPayments,
    ] = await Promise.all([
      // Total students
      this.prisma.student.count({
        where: { tenantId, deletedAt: null },
      }),
      // Active students
      this.prisma.student.count({
        where: { tenantId, status: 'ACTIVE', deletedAt: null },
      }),
      // Total batches
      this.prisma.batch.count({
        where: { tenantId },
      }),
      // Active batches
      this.prisma.batch.count({
        where: { tenantId, isActive: true },
      }),
      // Faculty count
      this.prisma.faculty.count({
        where: { tenantId },
      }),
      // Today's attendance sessions
      this.prisma.attendanceSession.findMany({
        where: {
          tenantId,
          sessionDate: today,
          isFinalized: true,
        },
        include: {
          records: { select: { status: true } },
        },
      }),
      // Fee payments this month
      this.prisma.feePayment.findMany({
        where: {
          paymentDate: { gte: monthStart },
          invoice: { tenantId },
        },
        select: { amountPaid: true },
      }),
      // Upcoming tests
      this.prisma.test.findMany({
        where: {
          tenantId,
          testDate: { gte: today },
          status: { in: ['SCHEDULED', 'DRAFT'] },
        },
        include: {
          batch: { select: { name: true, code: true } },
        },
        orderBy: { testDate: 'asc' },
        take: 5,
      }),
      // Recent admissions
      this.prisma.student.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          classStudying: true,
          targetExam: true,
          admissionDate: true,
          status: true,
        },
      }),
      // Recent payments
      this.prisma.feePayment.findMany({
        where: {
          invoice: { tenantId },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              amount: true,
              student: {
                select: { firstName: true, lastName: true, rollNumber: true },
              },
            },
          },
        },
      }),
    ]);

    // Calculate today's attendance percentage
    const allRecords = todayAttendanceSessions.flatMap((s) => s.records);
    const presentCount = allRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE',
    ).length;
    const todayAttendancePercentage =
      allRecords.length > 0
        ? Math.round((presentCount / allRecords.length) * 10000) / 100
        : 0;

    // Calculate monthly fee collection
    const feesCollectedThisMonth = monthlyFeePayments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0,
    );

    return {
      stats: {
        totalStudents,
        activeStudents,
        totalBatches,
        activeBatches,
        totalFaculty,
        todayAttendancePercentage,
        feesCollectedThisMonth,
      },
      upcomingTests: upcomingTests.map((t) => ({
        id: t.id,
        name: t.name,
        testType: t.testType,
        testDate: t.testDate,
        totalMarks: Number(t.totalMarks),
        status: t.status,
        batchName: t.batch.name,
        batchCode: t.batch.code,
      })),
      recentAdmissions,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amountPaid: Number(p.amountPaid),
        paymentDate: p.paymentDate,
        paymentMode: p.paymentMode,
        receiptNumber: p.receiptNumber,
        invoiceNumber: p.invoice.invoiceNumber,
        invoiceAmount: Number(p.invoice.amount),
        studentName: `${p.invoice.student.firstName} ${p.invoice.student.lastName}`,
        rollNumber: p.invoice.student.rollNumber,
      })),
    };
  }

  /**
   * Monthly student growth over the last 12 months.
   */
  async getStudentGrowthChart(tenantId: string) {
    const months: { month: string; count: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const count = await this.prisma.student.count({
        where: {
          tenantId,
          createdAt: { lte: endDate },
          deletedAt: null,
        },
      });

      const monthLabel = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      months.push({ month: monthLabel, count });
    }

    return months;
  }

  /**
   * Daily attendance trends over the last 30 days.
   */
  async getAttendanceTrendsChart(tenantId: string) {
    const days: { date: string; percentage: number; total: number; present: number }[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const sessions = await this.prisma.attendanceSession.findMany({
        where: {
          tenantId,
          sessionDate: date,
        },
        include: {
          records: { select: { status: true } },
        },
      });

      const allRecords = sessions.flatMap((s) => s.records);
      const present = allRecords.filter(
        (r) => r.status === 'PRESENT' || r.status === 'LATE',
      ).length;
      const total = allRecords.length;

      days.push({
        date: date.toISOString().split('T')[0],
        percentage: total > 0 ? Math.round((present / total) * 10000) / 100 : 0,
        total,
        present,
      });
    }

    return days;
  }

  /**
   * Monthly fee collection trends over the last 12 months.
   */
  async getFeeCollectionChart(tenantId: string) {
    const months: { month: string; collected: number; pending: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [payments, invoices] = await Promise.all([
        this.prisma.feePayment.aggregate({
          where: {
            paymentDate: { gte: monthStart, lte: monthEnd },
            invoice: { tenantId },
          },
          _sum: { amountPaid: true },
        }),
        this.prisma.feeInvoice.aggregate({
          where: {
            tenantId,
            dueDate: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      const collected = Number(payments._sum.amountPaid || 0);
      const totalDue = Number(invoices._sum.amount || 0);

      months.push({
        month: monthStart.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        collected,
        pending: Math.max(0, totalDue - collected),
      });
    }

    return months;
  }
}
