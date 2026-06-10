import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateSessionDto,
  BulkAttendanceDto,
  UpdateSessionDto,
  QuerySessionDto,
  QueryReportDto,
} from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // CREATE SESSION + MARK ATTENDANCE
  // ──────────────────────────────────────────────────

  async createSession(tenantId: string, userId: string, dto: CreateSessionDto) {
    // Validate batch belongs to tenant
    const batch = await this.prisma.batch.findFirst({
      where: { id: dto.batchId, tenantId, isActive: true },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found or inactive');
    }

    // Validate subject if session type is SUBJECT
    if (dto.sessionType === 'SUBJECT') {
      if (!dto.subjectId) {
        throw new BadRequestException('Subject is required for subject-wise attendance');
      }
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, tenantId },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
    }

    // Check for duplicate session
    const existing = await this.prisma.attendanceSession.findFirst({
      where: {
        batchId: dto.batchId,
        sessionDate: new Date(dto.sessionDate),
        sessionType: dto.sessionType,
        subjectId: dto.subjectId || null,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Attendance session already exists for this batch, date, and type',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create session
      const session = await tx.attendanceSession.create({
        data: {
          tenantId,
          batchId: dto.batchId,
          subjectId: dto.subjectId || null,
          sessionDate: new Date(dto.sessionDate),
          sessionType: dto.sessionType,
          takenBy: userId,
        },
      });

      // Create attendance records
      const recordData = dto.records.map((r) => ({
        sessionId: session.id,
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks || null,
      }));

      await tx.attendanceRecord.createMany({ data: recordData });

      this.logger.log(
        `Attendance session created for batch ${batch.name} on ${dto.sessionDate} (${dto.records.length} students)`,
      );

      return this.getSessionById(tenantId, session.id, tx);
    });
  }

  // ──────────────────────────────────────────────────
  // BULK ATTENDANCE
  // ──────────────────────────────────────────────────

  async createBulkSessions(tenantId: string, userId: string, dto: BulkAttendanceDto) {
    const results = [];
    for (const sessionDto of dto.sessions) {
      const result = await this.createSession(tenantId, userId, sessionDto);
      results.push(result);
    }
    return { sessions: results, count: results.length };
  }

  // ──────────────────────────────────────────────────
  // LIST SESSIONS
  // ──────────────────────────────────────────────────

  async findAll(tenantId: string, query: QuerySessionDto) {
    const where: Prisma.AttendanceSessionWhereInput = {
      tenantId,
      ...(query.batchId && { batchId: query.batchId }),
      ...(query.takenBy && { takenBy: query.takenBy }),
      ...(query.sessionType && { sessionType: query.sessionType }),
      ...((query.dateFrom || query.dateTo) && {
        sessionDate: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(query.dateTo) }),
        },
      }),
    };

    const [sessions, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { sessionDate: 'desc' },
        include: {
          batch: { select: { id: true, name: true, code: true } },
          subject: { select: { id: true, name: true } },
          faculty: { select: { id: true, student: { select: { firstName: true, lastName: true } }, faculty: { select: { firstName: true, lastName: true } } } },
          records: { select: { status: true } },
        },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    const data = sessions.map((s) => {
      const facultyName = s.faculty.faculty
        ? `${s.faculty.faculty.firstName} ${s.faculty.faculty.lastName}`
        : s.faculty.student
        ? `${s.faculty.student.firstName} ${s.faculty.student.lastName}`
        : 'Unknown';

      return {
        id: s.id,
        batchId: s.batchId,
        batchName: s.batch.name,
        sessionDate: s.sessionDate.toISOString().split('T')[0],
        sessionType: s.sessionType,
        subjectName: s.subject?.name || null,
        takenByName: facultyName,
        totalStudents: s.records.length,
        presentCount: s.records.filter((r) => r.status === 'PRESENT').length,
        absentCount: s.records.filter((r) => r.status === 'ABSENT').length,
        lateCount: s.records.filter((r) => r.status === 'LATE').length,
        leaveCount: s.records.filter((r) => r.status === 'LEAVE').length,
        isFinalized: s.isFinalized,
      };
    });

    return {
      data,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // SESSION DETAIL
  // ──────────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    return this.getSessionById(tenantId, id);
  }

  private async getSessionById(
    tenantId: string,
    id: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;

    const session = await (client as PrismaService).attendanceSession.findFirst({
      where: { id, tenantId },
      include: {
        batch: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true } },
        faculty: { select: { faculty: { select: { firstName: true, lastName: true } } } },
        records: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
          orderBy: { student: { rollNumber: 'asc' } },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    const facultyName = session.faculty.faculty
      ? `${session.faculty.faculty.firstName} ${session.faculty.faculty.lastName}`
      : 'Unknown';

    return {
      id: session.id,
      batchId: session.batchId,
      batchName: session.batch.name,
      sessionDate: session.sessionDate.toISOString().split('T')[0],
      sessionType: session.sessionType,
      subjectName: session.subject?.name || null,
      takenByName: facultyName,
      totalStudents: session.records.length,
      presentCount: session.records.filter((r) => r.status === 'PRESENT').length,
      absentCount: session.records.filter((r) => r.status === 'ABSENT').length,
      lateCount: session.records.filter((r) => r.status === 'LATE').length,
      leaveCount: session.records.filter((r) => r.status === 'LEAVE').length,
      isFinalized: session.isFinalized,
      records: session.records.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        rollNumber: r.student.rollNumber,
        status: r.status,
        remarks: r.remarks,
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // UPDATE SESSION
  // ──────────────────────────────────────────────────

  async updateSession(tenantId: string, id: string, dto: UpdateSessionDto) {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id, tenantId },
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    if (session.isFinalized) {
      throw new BadRequestException('Cannot update a finalized attendance session');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const record of dto.records) {
        await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId: id,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
            remarks: record.remarks || null,
          },
          create: {
            sessionId: id,
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks || null,
          },
        });
      }
    });

    this.logger.log(`Attendance session ${id} updated (${dto.records.length} records)`);
    return this.getSessionById(tenantId, id);
  }

  // ──────────────────────────────────────────────────
  // FINALIZE SESSION
  // ──────────────────────────────────────────────────

  async finalizeSession(tenantId: string, id: string) {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { id, tenantId },
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    if (session.isFinalized) {
      throw new BadRequestException('Session is already finalized');
    }

    await this.prisma.attendanceSession.update({
      where: { id },
      data: { isFinalized: true },
    });

    this.logger.log(`Attendance session ${id} finalized`);
    return { message: 'Session finalized successfully' };
  }

  // ──────────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────────

  async getDashboard(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sessions
    const todaySessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: today, lt: tomorrow },
      },
      include: {
        batch: { select: { id: true, name: true } },
        records: { select: { status: true } },
      },
    });

    const todayBatchIds = new Set(todaySessions.map((s) => s.batchId));
    const allRecords = todaySessions.flatMap((s) => s.records);
    const todayPresentCount = allRecords.filter((r) => r.status === 'PRESENT').length;

    // Weekly trend (7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: weekAgo, lt: tomorrow },
      },
      include: {
        records: { select: { status: true } },
      },
    });

    const dayMap = new Map<string, { total: number; present: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().split('T')[0], { total: 0, present: 0 });
    }
    for (const s of weekSessions) {
      const dateKey = s.sessionDate.toISOString().split('T')[0];
      const entry = dayMap.get(dateKey);
      if (entry) {
        entry.total += s.records.length;
        entry.present += s.records.filter((r) => r.status === 'PRESENT').length;
      }
    }
    const weeklyTrend = Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 10000) / 100 : 0,
    }));

    // Batch-wise today summary
    const allBatches = await this.prisma.batch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const batchWiseSummary = allBatches.map((batch) => {
      const batchSessions = todaySessions.filter((s) => s.batchId === batch.id);
      const batchRecords = batchSessions.flatMap((s) => s.records);
      const presentCount = batchRecords.filter((r) => r.status === 'PRESENT').length;
      return {
        batchId: batch.id,
        batchName: batch.name,
        todayPercentage:
          batchRecords.length > 0
            ? Math.round((presentCount / batchRecords.length) * 10000) / 100
            : 0,
        markedToday: batchSessions.length > 0,
      };
    });

    return {
      todaySessions: todaySessions.length,
      todayBatchesCovered: todayBatchIds.size,
      todayTotalStudents: allRecords.length,
      todayPresentCount,
      todayPercentage:
        allRecords.length > 0
          ? Math.round((todayPresentCount / allRecords.length) * 10000) / 100
          : 0,
      weeklyTrend,
      batchWiseSummary,
    };
  }

  // ──────────────────────────────────────────────────
  // REPORTS
  // ──────────────────────────────────────────────────

  async getDailyReport(tenantId: string, query: QueryReportDto) {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date();
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    const where: Prisma.AttendanceSessionWhereInput = {
      tenantId,
      sessionDate: { gte: dateFrom, lte: dateTo },
      ...(query.batchId && { batchId: query.batchId }),
    };

    const sessions = await this.prisma.attendanceSession.findMany({
      where,
      include: {
        batch: { select: { name: true } },
        records: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    return sessions.map((s) => ({
      sessionId: s.id,
      batchName: s.batch.name,
      date: s.sessionDate.toISOString().split('T')[0],
      sessionType: s.sessionType,
      totalStudents: s.records.length,
      present: s.records.filter((r) => r.status === 'PRESENT').length,
      absent: s.records.filter((r) => r.status === 'ABSENT').length,
      late: s.records.filter((r) => r.status === 'LATE').length,
      leave: s.records.filter((r) => r.status === 'LEAVE').length,
      percentage:
        s.records.length > 0
          ? Math.round(
              (s.records.filter((r) => r.status === 'PRESENT').length / s.records.length) * 10000,
            ) / 100
          : 0,
      students: s.records.map((r) => ({
        studentId: r.student.id,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        rollNumber: r.student.rollNumber,
        status: r.status,
        remarks: r.remarks,
      })),
    }));
  }

  async getMonthlyReport(tenantId: string, query: QueryReportDto) {
    const now = new Date();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: dateFrom, lte: dateTo },
        ...(query.batchId && { batchId: query.batchId }),
      },
      include: {
        records: { select: { status: true } },
      },
      orderBy: { sessionDate: 'asc' },
    });

    // Group by date
    const dateMap = new Map<string, { total: number; present: number; absent: number; late: number; leave: number }>();
    for (const s of sessions) {
      const dateKey = s.sessionDate.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { total: 0, present: 0, absent: 0, late: 0, leave: 0 });
      }
      const entry = dateMap.get(dateKey)!;
      for (const r of s.records) {
        entry.total++;
        if (r.status === 'PRESENT') entry.present++;
        else if (r.status === 'ABSENT') entry.absent++;
        else if (r.status === 'LATE') entry.late++;
        else if (r.status === 'LEAVE') entry.leave++;
      }
    }

    return Array.from(dateMap.entries()).map(([date, v]) => ({
      date,
      total: v.total,
      present: v.present,
      absent: v.absent,
      late: v.late,
      leave: v.leave,
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 10000) / 100 : 0,
    }));
  }

  async getStudentReport(tenantId: string, studentId: string, query: QueryReportDto) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, rollNumber: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const where: Prisma.AttendanceRecordWhereInput = {
      studentId,
      session: {
        tenantId,
        ...(query.dateFrom || query.dateTo
          ? {
              sessionDate: {
                ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
                ...(query.dateTo && { lte: new Date(query.dateTo) }),
              },
            }
          : {}),
        ...(query.batchId && { batchId: query.batchId }),
      },
    };

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        session: {
          select: {
            sessionDate: true,
            sessionType: true,
            batch: { select: { name: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { session: { sessionDate: 'desc' } },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const leave = records.filter((r) => r.status === 'LEAVE').length;

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
      },
      summary: {
        totalDays: total,
        present,
        absent,
        late,
        leave,
        percentage: total > 0 ? Math.round((present / total) * 10000) / 100 : 0,
      },
      records: records.map((r) => ({
        date: r.session.sessionDate.toISOString().split('T')[0],
        sessionType: r.session.sessionType,
        batchName: r.session.batch.name,
        subjectName: r.session.subject?.name || null,
        status: r.status,
        remarks: r.remarks,
      })),
    };
  }

  async getBatchReport(tenantId: string, batchId: string, query: QueryReportDto) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, tenantId },
      select: { id: true, name: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const where: Prisma.AttendanceSessionWhereInput = {
      tenantId,
      batchId,
      ...((query.dateFrom || query.dateTo) && {
        sessionDate: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(query.dateTo) }),
        },
      }),
    };

    const sessions = await this.prisma.attendanceSession.findMany({
      where,
      include: {
        records: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
        },
      },
    });

    // Aggregate by student
    const studentMap = new Map<
      string,
      { name: string; rollNumber: string; total: number; present: number; absent: number; late: number; leave: number }
    >();

    for (const s of sessions) {
      for (const r of s.records) {
        if (!studentMap.has(r.studentId)) {
          studentMap.set(r.studentId, {
            name: `${r.student.firstName} ${r.student.lastName}`,
            rollNumber: r.student.rollNumber,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
          });
        }
        const entry = studentMap.get(r.studentId)!;
        entry.total++;
        if (r.status === 'PRESENT') entry.present++;
        else if (r.status === 'ABSENT') entry.absent++;
        else if (r.status === 'LATE') entry.late++;
        else if (r.status === 'LEAVE') entry.leave++;
      }
    }

    const students = Array.from(studentMap.entries())
      .map(([studentId, v]) => ({
        studentId,
        studentName: v.name,
        rollNumber: v.rollNumber,
        totalDays: v.total,
        present: v.present,
        absent: v.absent,
        late: v.late,
        leave: v.leave,
        percentage: v.total > 0 ? Math.round((v.present / v.total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

    return {
      batchId: batch.id,
      batchName: batch.name,
      totalSessions: sessions.length,
      students,
    };
  }

  // ──────────────────────────────────────────────────
  // ANALYTICS
  // ──────────────────────────────────────────────────

  async getAnalytics(tenantId: string, query: QueryReportDto) {
    const now = new Date();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
    const dateTo = query.dateTo ? new Date(query.dateTo) : now;

    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        sessionDate: { gte: dateFrom, lte: dateTo },
        ...(query.batchId && { batchId: query.batchId }),
      },
      include: {
        batch: { select: { name: true } },
        records: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
              },
          },
        },
      },
    });

    const allRecords = sessions.flatMap((s) =>
      s.records.map((r) => ({ ...r, batchName: s.batch.name, sessionDate: s.sessionDate })),
    );
    const totalRecords = allRecords.length;
    const presentRecords = allRecords.filter((r) => r.status === 'PRESENT').length;

    // Absence trend (day-by-day)
    const absenceDayMap = new Map<string, number>();
    for (const r of allRecords) {
      if (r.status === 'ABSENT') {
        const key = r.sessionDate.toISOString().split('T')[0];
        absenceDayMap.set(key, (absenceDayMap.get(key) || 0) + 1);
      }
    }
    const absenceTrend = Array.from(absenceDayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, absentCount]) => ({ date, absentCount }));

    // Top defaulters
    const studentAbsences = new Map<
      string,
      { name: string; rollNumber: string; batchName: string; absent: number; total: number }
    >();
    for (const r of allRecords) {
      if (!studentAbsences.has(r.studentId)) {
        studentAbsences.set(r.studentId, {
          name: `${r.student.firstName} ${r.student.lastName}`,
          rollNumber: r.student.rollNumber,
          batchName: r.batchName,
          absent: 0,
          total: 0,
        });
      }
      const entry = studentAbsences.get(r.studentId)!;
      entry.total++;
      if (r.status === 'ABSENT') entry.absent++;
    }

    const topDefaulters = Array.from(studentAbsences.entries())
      .map(([studentId, v]) => ({
        studentId,
        studentName: v.name,
        rollNumber: v.rollNumber,
        batchName: v.batchName,
        absentCount: v.absent,
        percentage: v.total > 0 ? Math.round(((v.total - v.absent) / v.total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.absentCount - a.absentCount)
      .slice(0, 10);

    // Perfect attendance
    const perfectAttendance = Array.from(studentAbsences.entries())
      .filter(([, v]) => v.absent === 0 && v.total > 0)
      .map(([studentId, v]) => ({
        studentId,
        studentName: v.name,
        rollNumber: v.rollNumber,
        batchName: v.batchName,
        totalDays: v.total,
      }))
      .sort((a, b) => b.totalDays - a.totalDays);

    return {
      overallPercentage:
        totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 10000) / 100 : 0,
      absenceTrend,
      topDefaulters,
      perfectAttendance,
    };
  }
}
