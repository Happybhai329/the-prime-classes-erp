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
          tenantId,
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
          tenantId,
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
          studentFee: {
            select: {
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
      recentPayments: recentPayments.map((p) => {
        const student = p.invoice?.student || p.studentFee?.student;
        return {
          id: p.id,
          amountPaid: Number(p.amountPaid),
          paymentDate: p.paymentDate,
          paymentMode: p.paymentMode,
          receiptNumber: p.receiptNumber,
          invoiceNumber: p.invoice?.invoiceNumber || p.receiptNumber,
          invoiceAmount: p.invoice ? Number(p.invoice.amount) : Number(p.amountPaid),
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          rollNumber: student?.rollNumber || '',
        };
      }),
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
            tenantId,
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

  /**
   * Parent Dashboard
   */
  async getParentDashboard(tenantId: string, parentUserId: string) {
    // 1. Get parent's linked students
    const parent = await this.prisma.parent.findFirst({
      where: { userId: parentUserId, tenantId },
      include: {
        studentMappings: {
          include: {
            student: {
              include: {
                batchEnrollments: { include: { batch: true } },
              },
            },
          },
        },
      },
    });

    if (!parent) return { children: [], upcomingTests: [], recentNotices: [], unreadNotifications: 0 };

    const studentIds = parent.studentMappings.map((ps: any) => ps.studentId);
    if (studentIds.length === 0) return { children: [], upcomingTests: [], recentNotices: [], unreadNotifications: 0 };

    // We fetch detailed data for each child. Since Phase 2 ReportsService has some of this logic,
    // we would ideally reuse it. Here we construct a summary for the dashboard.
    
    const childrenData = await Promise.all(
      parent.studentMappings.map(async (ps: any) => {
        const student = ps.student;
        const batchIds = student.batchEnrollments.map((b: any) => b.batchId);
        
        // Attendance
        const sessions = await this.prisma.attendanceSession.findMany({
          where: { tenantId, isFinalized: true, batchId: { in: batchIds } },
          include: { records: { where: { studentId: student.id } } },
        });
        
        let present = 0, total = 0;
        for (const session of sessions) {
          const rec = session.records[0];
          if (rec) {
            total++;
            if (rec.status === 'PRESENT' || rec.status === 'LATE') present++;
          }
        }
        const attendancePercentage = total > 0 ? Math.round((present / total) * 10000) / 100 : 0;

        // Pending Fees
        const pendingFeesObj = await this.prisma.feeInvoice.aggregate({
          where: { tenantId, studentId: student.id, status: { not: 'PAID' } },
          _sum: { amount: true },
        });
        const pendingFees = Number((pendingFeesObj._sum.amount || 0));

        // Latest Test
        const latestRank = await this.prisma.testRanking.findFirst({
          where: { studentId: student.id },
          orderBy: { test: { testDate: 'desc' } },
          include: { test: true },
        });
        const latestMarks = latestRank ? await this.prisma.testMarks.findFirst({ where: { testId: latestRank.testId, studentId: student.id } }) : null;
        const latestPercentage = latestMarks && latestRank ? (Number(latestMarks.marksObtained) / Number(latestRank.test.totalMarks)) * 100 : 0;

        // Determine performance category
        let performanceCategory = 'GOOD';
        if (attendancePercentage < 75 || (latestRank && latestPercentage < 40)) {
          performanceCategory = 'CRITICAL';
        } else if (attendancePercentage < 85 || (latestRank && latestPercentage < 60)) {
          performanceCategory = 'NEEDS_IMPROVEMENT';
        } else if (attendancePercentage >= 90 && (!latestRank || latestPercentage >= 80)) {
          performanceCategory = 'EXCELLENT';
        }

        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          batchName: student.batchEnrollments[0]?.batch?.name || 'N/A',
          attendancePercentage,
          pendingFees,
          lastTestRank: latestRank ? latestRank.batchRank : null,
          performanceCategory,
          recentTests: latestRank && latestMarks ? [{
            testName: latestRank.test.name,
            testDate: latestRank.test.testDate.toISOString().split('T')[0],
            marksObtained: Number(latestMarks.marksObtained),
            totalMarks: Number(latestRank.test.totalMarks),
            percentage: latestPercentage,
            batchRank: latestRank.batchRank,
          }] : [],
          rankTrend: [],
          attendanceTrend: [],
        };
      })
    );

    // Get unread notifications
    const unreadNotifications = await this.prisma.notificationLog.count({
      where: { userId: parentUserId, status: { not: 'READ' } }
    });

    // Get upcoming tests for all children's batches
    const allBatchIds = parent.studentMappings.flatMap((ps: any) => ps.student.batchEnrollments.map((b: any) => b.batchId));
    const upcomingTests = await this.prisma.test.findMany({
      where: {
        tenantId,
        testDate: { gte: new Date() },
        batchId: { in: allBatchIds },
        status: { in: ['SCHEDULED', 'PUBLISHED'] }
      },
      take: 5,
      orderBy: { testDate: 'asc' },
      include: { batch: { select: { name: true } } }
    });

    // Get recent notices
    const recentNotices = await this.prisma.notice.findMany({
      where: {
        tenantId,
        isPublished: true,
        OR: [
          { targetAudience: 'ALL' },
          { targetAudience: 'ALL_STUDENTS' },
          { targetAudience: 'SPECIFIC_PARENT_GROUP' },
          { targetAudience: 'SPECIFIC_BATCH', batchIds: { hasSome: allBatchIds } }
        ]
      },
      take: 3,
      orderBy: { publishDate: 'desc' }
    });

    return {
      children: childrenData,
      unreadNotifications,
      upcomingTests: upcomingTests.map(t => ({
        id: t.id,
        name: t.name,
        testType: t.testType,
        testDate: t.testDate.toISOString().split('T')[0],
        totalMarks: Number(t.totalMarks),
        status: t.status,
        batchName: t.batch.name
      })),
      recentNotices: recentNotices.map(n => ({
        id: n.id,
        title: n.title,
        body: n.description,
        type: 'NOTICE_PUBLISHED' as any,
        data: { priority: n.priority },
        sentAt: n.publishDate.toISOString(),
        isRead: false
      }))
    };
  }

  async getChildAnalytics(tenantId: string, studentId: string) {
    // Basic verification that child belongs to tenant
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: { batchEnrollments: { include: { batch: true } } }
    });

    if (!student) return null;

    // This would typically call ReportsService.getStudentPerformanceProfile
    // For now we'll return a stub that the frontend can use
    return {
       student: { id: student.id, name: `${student.firstName} ${student.lastName}` },
       attendance: { percentage: 85, totalDays: 100, present: 85 },
       tests: { totalTests: 5, averagePercentage: 75 }
    };
  }
}
