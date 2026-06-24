import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TargetExam } from '@prime/shared-types';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // ATTENDANCE SUMMARY
  // ──────────────────────────────────────────────────

  async getAttendanceSummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get today's attendance across all batches
    const todaySessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: today },
      },
      include: {
        records: { select: { status: true } },
      },
    });

    let todayTotal = 0;
    let todayPresent = 0;

    todaySessions.forEach(s => {
      todayTotal += s.records.length;
      todayPresent += s.records.filter(r => r.status === 'PRESENT').length;
    });

    // Get this month's attendance
    const monthSessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: firstDayOfMonth },
      },
      include: {
        records: { select: { status: true } },
      },
    });

    let monthTotal = 0;
    let monthPresent = 0;

    monthSessions.forEach(s => {
      monthTotal += s.records.length;
      monthPresent += s.records.filter(r => r.status === 'PRESENT').length;
    });

    return {
      today: {
        totalStudents: todayTotal,
        present: todayPresent,
        percentage: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 10000) / 100 : 0,
      },
      thisMonth: {
        totalDays: monthSessions.length,
        percentage: monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 10000) / 100 : 0,
      },
    };
  }

  // ──────────────────────────────────────────────────
  // TESTS SUMMARY
  // ──────────────────────────────────────────────────

  async getTestsSummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTests = await this.prisma.test.count({
      where: {
        tenantId,
        status: { in: ['SCHEDULED', 'ONGOING'] },
      },
    });

    const recentPublishedTests = await this.prisma.test.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      include: {
        batch: { select: { name: true } },
      },
    });

    return {
      activeUpcomingTests: activeTests,
      recentResults: recentPublishedTests.map(t => ({
        id: t.id,
        name: t.name,
        batchName: t.batch.name,
        testDate: t.testDate.toISOString().split('T')[0],
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // MERIT LISTS
  // ──────────────────────────────────────────────────

  async getInstituteMeritList(tenantId: string) {
    return this.generateOverallMeritList(tenantId);
  }

  async getBatchMeritList(tenantId: string, batchId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, tenantId },
      select: { name: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const list: any = await this.generateOverallMeritList(tenantId, { batchId });
    list.batchName = batch.name;
    return list;
  }

  async getExamMeritList(tenantId: string, examType: TargetExam) {
    const list: any = await this.generateOverallMeritList(tenantId, { targetExam: examType });
    list.examType = examType;
    return list;
  }

  private async generateOverallMeritList(tenantId: string, filter?: { batchId?: string; targetExam?: TargetExam }) {
    // Generate an overall merit list based on average percentage across all PUBLISHED tests

    const whereBatch: Prisma.BatchWhereInput = {
      tenantId,
      isActive: true,
      ...(filter?.batchId && { id: filter.batchId }),
      ...(filter?.targetExam && { targetExam: filter.targetExam }),
    };

    const batches = await this.prisma.batch.findMany({
      where: whereBatch,
      select: { id: true, name: true },
    });

    const batchIds = batches.map(b => b.id);
    const batchNameMap = new Map(batches.map(b => [b.id, b.name]));

    const tests = await this.prisma.test.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
        batchId: { in: batchIds },
      },
      include: {
        marks: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
          },
        },
      },
    });

    // Aggregate marks by student
    const studentStats = new Map<string, {
      studentId: string;
      studentName: string;
      rollNumber: string;
      batchName: string;
      totalMarksObtained: number;
      totalMaxMarks: number;
      testCount: number;
    }>();

    for (const test of tests) {
      for (const mark of test.marks) {
        if (!studentStats.has(mark.studentId)) {
          studentStats.set(mark.studentId, {
            studentId: mark.studentId,
            studentName: `${mark.student.firstName} ${mark.student.lastName}`,
            rollNumber: mark.student.rollNumber,
            batchName: batchNameMap.get(test.batchId) || 'Unknown',
            totalMarksObtained: 0,
            totalMaxMarks: 0,
            testCount: 0,
          });
        }

        const entry = studentStats.get(mark.studentId)!;
        entry.totalMarksObtained += Number(mark.marksObtained);
        entry.totalMaxMarks += Number(test.totalMarks);
        entry.testCount++;
      }
    }

    // Calculate percentage and rank
    const rankedStudents = Array.from(studentStats.values())
      .map(s => ({
        ...s,
        percentage: s.totalMaxMarks > 0 ? Math.round((s.totalMarksObtained / s.totalMaxMarks) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const items = rankedStudents.map((s, index) => ({
      rank: index + 1,
      studentId: s.studentId,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
      batchName: s.batchName,
      totalMarks: s.totalMaxMarks,
      marksObtained: s.totalMarksObtained,
      percentage: s.percentage,
      percentile: rankedStudents.length > 1 ? Math.round(((rankedStudents.length - (index + 1)) / (rankedStudents.length - 1)) * 10000) / 100 : 100,
      grade: this.calculateGrade(s.percentage),
    }));

    return {
      generatedAt: new Date().toISOString(),
      totalStudents: items.length,
      items,
    };
  }

  // ──────────────────────────────────────────────────
  // STUDENT PERFORMANCE PROFILE
  // ──────────────────────────────────────────────────

  async getStudentPerformanceProfile(tenantId: string, studentId: string, userContext?: { role: string; userId: string }) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        batchEnrollments: {
          where: { status: 'ACTIVE' },
          include: { batch: { select: { name: true } } },
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    if (userContext && userContext.role === 'STUDENT') {
      if (student.userId !== userContext.userId) {
        throw new ForbiddenException('You can only view your own performance profile');
      }
    }

    const batchName = student.batchEnrollments[0]?.batch.name || 'Unknown';

    // 1. Attendance Data
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: { tenantId },
      },
      include: {
        session: { select: { sessionDate: true } },
      },
    });

    const totalDays = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const absent = attendanceRecords.filter(r => r.status === 'ABSENT').length;
    const late = attendanceRecords.filter(r => r.status === 'LATE').length;
    const leave = attendanceRecords.filter(r => r.status === 'LEAVE').length;

    // Monthly attendance trend
    const monthlyAttendanceMap = new Map<string, { total: number; present: number }>();
    attendanceRecords.forEach(r => {
      const d = r.session.sessionDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyAttendanceMap.has(key)) monthlyAttendanceMap.set(key, { total: 0, present: 0 });
      const entry = monthlyAttendanceMap.get(key)!;
      entry.total++;
      if (r.status === 'PRESENT') entry.present++;
    });

    const monthlyTrend = Array.from(monthlyAttendanceMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      }));

    // 2. Test Data
    const marks = await this.prisma.testMarks.findMany({
      where: {
        studentId,
        test: { tenantId, status: 'PUBLISHED' },
      },
      include: {
        test: { select: { name: true, testDate: true, totalMarks: true } },
      },
      orderBy: { test: { testDate: 'asc' } },
    });

    const rankings = await this.prisma.testRanking.findMany({
      where: {
        studentId,
        test: { tenantId, status: 'PUBLISHED' },
      },
      include: {
        test: { select: { name: true, testDate: true } },
      },
      orderBy: { test: { testDate: 'asc' } },
    });

    const totalTests = marks.length;
    let totalPerc = 0;
    marks.forEach(m => {
      if (Number(m.test.totalMarks) > 0) {
        totalPerc += (Number(m.marksObtained) / Number(m.test.totalMarks)) * 100;
      }
    });

    const bestRank = rankings.length > 0 ? Math.min(...rankings.map(r => r.batchRank)) : null;

    const marksProgress = marks.map(m => ({
      testName: m.test.name,
      testDate: m.test.testDate.toISOString().split('T')[0],
      percentage: Number(m.test.totalMarks) > 0 ? Math.round((Number(m.marksObtained) / Number(m.test.totalMarks)) * 100) : 0,
    }));

    const rankTrend = rankings.map(r => ({
      testName: r.test.name,
      testDate: r.test.testDate.toISOString().split('T')[0],
      rank: r.batchRank,
    }));

    // Generate some mock subject strengths until we have enough real subject marks data across many tests
    // In production, we would aggregate the `subjectMarks` JSON from all tests
    const subjectStrengths = [
      { subject: 'Mathematics', avgPercentage: 85 },
      { subject: 'Science', avgPercentage: 80 },
    ];
    const weakAreas = [
      { subject: 'English', avgPercentage: 65 },
      { subject: 'General Knowledge', avgPercentage: 60 },
    ];

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        batchName,
      },
      attendance: {
        totalDays,
        present,
        absent,
        late,
        leave,
        percentage: totalDays > 0 ? Math.round((present / totalDays) * 10000) / 100 : 0,
        monthlyTrend,
      },
      tests: {
        totalTests,
        averagePercentage: totalTests > 0 ? Math.round((totalPerc / totalTests) * 100) / 100 : 0,
        bestRank,
        recentTests: marks.slice(-5).map(m => ({ // map last 5 tests to StudentPerformanceTrend shape
          testName: m.test.name,
          date: m.test.testDate.toISOString().split('T')[0],
          percentage: Number(m.test.totalMarks) > 0 ? Math.round((Number(m.marksObtained) / Number(m.test.totalMarks)) * 100) : 0,
          rank: rankings.find(r => r.testId === m.testId)?.batchRank || 0,
        })),
        rankTrend,
        subjectStrengths,
        weakAreas,
      },
      marksProgress,
    };
  }

  // ──────────────────────────────────────────────────
  // PARENT DASHBOARD DATA
  // ──────────────────────────────────────────────────

  async getParentChildrenData(tenantId: string, userId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { userId, tenantId },
      include: {
        studentMappings: {
          include: {
            student: {
              include: {
                batchEnrollments: {
                  where: { status: 'ACTIVE' },
                  include: { batch: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) throw new NotFoundException('Parent profile not found');

    const childrenData = await Promise.all(
      parent.studentMappings.map(async (mapping: any) => {
        const child = mapping.student;
        const perf = await this.getStudentPerformanceProfile(tenantId, child.id);

        const recentTests = await this.prisma.testMarks.findMany({
          where: { studentId: child.id, test: { tenantId, status: 'PUBLISHED' } },
          include: {
            test: { select: { name: true, testDate: true, totalMarks: true, rankings: { where: { studentId: child.id } } } },
          },
          orderBy: { test: { testDate: 'desc' } },
          take: 3,
        });

        // Count child's pending assignments & homeworks
        const childBatchEnrollments = await this.prisma.batchStudent.findMany({
          where: { studentId: child.id, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const childBatchIds = childBatchEnrollments.map(e => e.batchId);

        const pendingHw = await this.prisma.assignment.count({
          where: {
            tenantId,
            batchId: { in: childBatchIds },
            type: 'HOMEWORK',
            isPublished: true,
            deletedAt: null,
            submissions: {
              none: { studentId: child.id }
            }
          }
        });

        const pendingAsg = await this.prisma.assignment.count({
          where: {
            tenantId,
            batchId: { in: childBatchIds },
            type: 'ASSIGNMENT',
            isPublished: true,
            deletedAt: null,
            submissions: {
              none: { studentId: child.id }
            }
          }
        });

        return {
          studentId: child.id,
          studentName: `${child.firstName} ${child.lastName}`,
          rollNumber: child.rollNumber,
          batchName: child.batchEnrollments[0]?.batch.name || 'Unknown',
          attendancePercentage: perf.attendance.percentage,
          recentTests: recentTests.map(m => ({
            testName: m.test.name,
            testDate: m.test.testDate.toISOString().split('T')[0],
            marksObtained: Number(m.marksObtained),
            totalMarks: Number(m.test.totalMarks),
            percentage: Number(m.test.totalMarks) > 0 ? Math.round((Number(m.marksObtained) / Number(m.test.totalMarks)) * 100) : 0,
            batchRank: m.test.rankings[0]?.batchRank || null,
          })),
          rankTrend: perf.tests.rankTrend.map(r => ({ testName: r.testName, rank: r.rank })),
          attendanceTrend: await this.getRecentAttendance(tenantId, child.id),
          pendingHomeworkCount: pendingHw,
          pendingAssignmentCount: pendingAsg,
          pendingFees: 0, // Placeholder for future fees module
        };
      })
    );

    const upcomingTests = await this.prisma.test.findMany({
      where: {
        tenantId,
        status: 'SCHEDULED',
        batchId: { in: parent.studentMappings.flatMap((m: any) => m.student.batchEnrollments.map((e: any) => e.batchId)) },
      },
      select: { id: true, name: true, testDate: true, batch: { select: { name: true } } },
      orderBy: { testDate: 'asc' },
      take: 5,
    });

    const unreadNotifications = await this.prisma.notificationLog.count({
      where: { userId, readAt: null, notification: { tenantId } },
    });

    const recentNotices = await this.prisma.notificationLog.findMany({
      where: { userId, notification: { tenantId } },
      include: { notification: true },
      orderBy: { notification: { sentAt: 'desc' } },
      take: 5,
    });

    return {
      children: childrenData,
      unreadNotifications,
      upcomingTests: upcomingTests.map(t => ({
        id: t.id,
        name: t.name,
        date: t.testDate.toISOString().split('T')[0],
        batchName: t.batch.name,
      })),
      recentNotices: recentNotices.map((n: any) => ({
        id: n.notification.id,
        title: n.notification.title,
        body: n.notification.body,
        type: n.notification.type,
        date: n.notification.sentAt.toISOString(),
        isRead: !!n.readAt,
      })),
    };
  }

  private async getRecentAttendance(tenantId: string, studentId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId, session: { tenantId } },
      include: { session: { select: { sessionDate: true } } },
      orderBy: { session: { sessionDate: 'desc' } },
      take: 10,
    });

    return records.map(r => ({
      date: r.session.sessionDate.toISOString().split('T')[0],
      status: r.status,
    })).reverse();
  }

  async getAcademicOverviewReport(tenantId: string) {
    // 1. Homework completion rate
    const homeworks = await this.prisma.assignment.findMany({
      where: { tenantId, type: 'HOMEWORK', deletedAt: null },
      include: {
        batch: {
          include: {
            students: { where: { status: 'ACTIVE' } },
          },
        },
        submissions: true,
      },
    });

    let totalHomeworkExpected = 0;
    let totalHomeworkSubmitted = 0;

    homeworks.forEach(hw => {
      const studentCount = hw.batch.students.length;
      totalHomeworkExpected += studentCount;
      totalHomeworkSubmitted += hw.submissions.length;
    });

    const homeworkCompletionRate = totalHomeworkExpected > 0
      ? Math.round((totalHomeworkSubmitted / totalHomeworkExpected) * 100)
      : 0;

    // 2. Assignment completion rate
    const assignments = await this.prisma.assignment.findMany({
      where: { tenantId, type: 'ASSIGNMENT', deletedAt: null },
      include: {
        batch: {
          include: {
            students: { where: { status: 'ACTIVE' } },
          },
        },
        submissions: true,
      },
    });

    let totalAssignmentExpected = 0;
    let totalAssignmentSubmitted = 0;
    let lateAssignmentSubmissions = 0;

    assignments.forEach(asg => {
      const studentCount = asg.batch.students.length;
      totalAssignmentExpected += studentCount;
      totalAssignmentSubmitted += asg.submissions.length;
      lateAssignmentSubmissions += asg.submissions.filter(s => s.status === 'LATE').length;
    });

    const assignmentCompletionRate = totalAssignmentExpected > 0
      ? Math.round((totalAssignmentSubmitted / totalAssignmentExpected) * 100)
      : 0;

    const onTimeSubmissions = totalAssignmentSubmitted - lateAssignmentSubmissions;
    const assignmentOnTimeRate = totalAssignmentSubmitted > 0
      ? Math.round((onTimeSubmissions / totalAssignmentSubmitted) * 100)
      : 0;

    // 3. Student Engagement metrics
    const students = await this.prisma.student.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        batchEnrollments: {
          where: { status: 'ACTIVE' },
          select: { batch: { select: { name: true } } },
        },
        attendanceRecords: {
          select: { status: true },
        },
        assignmentSubmissions: {
          select: { status: true, score: true },
        },
        testMarks: {
          select: { marksObtained: true, test: { select: { totalMarks: true } } },
        },
      },
      take: 20,
    });

    const studentEngagement = students.map(s => {
      const totalAttendance = s.attendanceRecords.length;
      const presentAttendance = s.attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const attendancePct = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

      const totalSubmissions = s.assignmentSubmissions.length;
      const onTimeSubmissions = s.assignmentSubmissions.filter((sub: any) => sub.status !== 'LATE').length;
      const submissionPct = totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 100;

      let totalTestMarks = 0;
      let totalTestExpected = 0;
      s.testMarks.forEach((tm: any) => {
        totalTestMarks += Number(tm.marksObtained);
        totalTestExpected += Number(tm.test.totalMarks);
      });
      const testPct = totalTestExpected > 0 ? Math.round((totalTestMarks / totalTestExpected) * 100) : 0;

      const overallEngagement = Math.round((attendancePct + submissionPct + (testPct || 70)) / 3);

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        rollNumber: s.rollNumber,
        batchName: s.batchEnrollments[0]?.batch.name || 'N/A',
        attendancePercentage: attendancePct,
        submissionsCount: totalSubmissions,
        testAverage: testPct,
        engagementScore: overallEngagement,
      };
    });

    return {
      homework: {
        completionRate: homeworkCompletionRate,
        totalExpected: totalHomeworkExpected,
        totalSubmitted: totalHomeworkSubmitted,
      },
      assignment: {
        completionRate: assignmentCompletionRate,
        onTimeRate: assignmentOnTimeRate,
        totalExpected: totalAssignmentExpected,
        totalSubmitted: totalAssignmentSubmitted,
        lateSubmitted: lateAssignmentSubmissions,
      },
      studentEngagement: studentEngagement.sort((a, b) => b.engagementScore - a.engagementScore),
    };
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }
}
