import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTestDto, UpdateTestDto, EnterMarksDto, QueryTestDto } from './dto';
import { buildPaginationMeta, calculateGrade } from '../../common/utils/helpers';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // LIST TESTS
  // ──────────────────────────────────────────────────

  async findAll(tenantId: string, query: QueryTestDto) {
    const where: Prisma.TestWhereInput = {
      tenantId,
      ...(query.batchId && { batchId: query.batchId }),
      ...(query.testType && { testType: query.testType }),
      ...(query.status && { status: query.status }),
      ...((query.dateFrom || query.dateTo) && {
        testDate: {
          ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
          ...(query.dateTo && { lte: new Date(query.dateTo) }),
        },
      }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [tests, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { testDate: 'desc' },
        include: {
          batch: { select: { id: true, name: true, code: true } },
          _count: { select: { marks: true, rankings: true } },
        },
      }),
      this.prisma.test.count({ where }),
    ]);

    const data = tests.map((t) => ({
      id: t.id,
      name: t.name,
      testType: t.testType,
      testDate: t.testDate.toISOString().split('T')[0],
      totalMarks: Number(t.totalMarks),
      durationMinutes: t.durationMinutes,
      status: t.status,
      batchId: t.batchId,
      batchName: t.batch.name,
      batchCode: t.batch.code,
      marksCount: t._count.marks,
      rankingsComputed: t._count.rankings > 0,
    }));

    return {
      data,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // TEST DETAIL
  // ──────────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    const test = await this.prisma.test.findFirst({
      where: { id, tenantId },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
            targetExam: true,
            academicYear: true,
            isActive: true,
          },
        },
        creator: {
          select: {
            faculty: { select: { firstName: true, lastName: true } },
          },
        },
        marks: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
          orderBy: { marksObtained: 'desc' },
        },
        rankings: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
          orderBy: { batchRank: 'asc' },
        },
      },
    });

    if (!test) throw new NotFoundException('Test not found');

    // Resolve subject names
    const subjectNames = test.subjectIds.length > 0
      ? await this.prisma.subject.findMany({
          where: { id: { in: test.subjectIds } },
          select: { id: true, name: true },
        })
      : [];

    const creatorName = test.creator.faculty
      ? `${test.creator.faculty.firstName} ${test.creator.faculty.lastName}`
      : 'Admin';

    return {
      id: test.id,
      name: test.name,
      testType: test.testType,
      testDate: test.testDate.toISOString().split('T')[0],
      totalMarks: Number(test.totalMarks),
      durationMinutes: test.durationMinutes,
      status: test.status,
      batch: test.batch,
      subjectIds: test.subjectIds,
      subjectNames: subjectNames.map((s) => s.name),
      createdBy: creatorName,
      createdAt: test.createdAt.toISOString(),
      marksCount: test.marks.length,
      rankingsComputed: test.rankings.length > 0,
      marks: test.marks.map((m) => ({
        id: m.id,
        studentId: m.studentId,
        studentName: `${m.student.firstName} ${m.student.lastName}`,
        rollNumber: m.student.rollNumber,
        marksObtained: Number(m.marksObtained),
        subjectMarks: m.subjectMarks as Record<string, number>,
        isAbsent: m.isAbsent,
        remarks: m.remarks,
        percentage: Number(test.totalMarks) > 0
          ? Math.round((Number(m.marksObtained) / Number(test.totalMarks)) * 10000) / 100
          : 0,
      })),
      rankings: test.rankings.map((r) => ({
        studentId: r.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        rollNumber: r.student.rollNumber,
        batchRank: r.batchRank,
        overallRank: r.overallRank,
        percentile: r.percentile ? Number(r.percentile) : null,
        grade: r.grade,
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // CREATE TEST
  // ──────────────────────────────────────────────────

  async create(tenantId: string, userId: string, dto: CreateTestDto) {
    // Validate batch
    const batch = await this.prisma.batch.findFirst({
      where: { id: dto.batchId, tenantId, isActive: true },
    });
    if (!batch) throw new NotFoundException('Batch not found or inactive');

    // Validate subjects
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: dto.subjectIds }, tenantId },
    });
    if (subjects.length !== dto.subjectIds.length) {
      throw new BadRequestException('One or more subjects not found');
    }

    const test = await this.prisma.test.create({
      data: {
        tenantId,
        batchId: dto.batchId,
        name: dto.name,
        testType: dto.testType,
        testDate: new Date(dto.testDate),
        totalMarks: dto.totalMarks,
        durationMinutes: dto.durationMinutes || null,
        subjectIds: dto.subjectIds,
        status: 'SCHEDULED',
        createdBy: userId,
      },
      include: {
        batch: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Test created: ${test.name} for batch ${batch.name}`);

    return {
      id: test.id,
      name: test.name,
      testType: test.testType,
      testDate: test.testDate.toISOString().split('T')[0],
      totalMarks: Number(test.totalMarks),
      durationMinutes: test.durationMinutes,
      status: test.status,
      batchName: test.batch.name,
    };
  }

  // ──────────────────────────────────────────────────
  // UPDATE TEST
  // ──────────────────────────────────────────────────

  async update(tenantId: string, id: string, dto: UpdateTestDto) {
    const test = await this.prisma.test.findFirst({
      where: { id, tenantId },
    });
    if (!test) throw new NotFoundException('Test not found');
    if (test.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot update a published test');
    }

    const updateData: Prisma.TestUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.testType !== undefined) updateData.testType = dto.testType;
    if (dto.totalMarks !== undefined) updateData.totalMarks = dto.totalMarks;
    if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;
    if (dto.testDate !== undefined) updateData.testDate = new Date(dto.testDate);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.subjectIds !== undefined) updateData.subjectIds = dto.subjectIds;

    return this.prisma.test.update({
      where: { id },
      data: updateData,
      include: {
        batch: { select: { id: true, name: true } },
      },
    });
  }

  // ──────────────────────────────────────────────────
  // DELETE TEST
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const test = await this.prisma.test.findFirst({
      where: { id, tenantId },
    });
    if (!test) throw new NotFoundException('Test not found');
    if (test.status !== 'DRAFT' && test.status !== 'SCHEDULED') {
      throw new BadRequestException('Can only delete tests in DRAFT or SCHEDULED status');
    }

    await this.prisma.test.delete({ where: { id } });
    this.logger.log(`Test deleted: ${id}`);
    return { message: 'Test deleted successfully' };
  }

  // ──────────────────────────────────────────────────
  // ENTER / UPDATE MARKS
  // ──────────────────────────────────────────────────

  async enterMarks(tenantId: string, testId: string, userId: string, dto: EnterMarksDto) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
    });
    if (!test) throw new NotFoundException('Test not found');
    if (test.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot modify marks for a published test');
    }

    // Update test status to COMPLETED if it was SCHEDULED
    if (test.status === 'SCHEDULED' || test.status === 'ONGOING') {
      await this.prisma.test.update({
        where: { id: testId },
        data: { status: 'COMPLETED' },
      });
    }

    await this.prisma.$transaction(async (tx) => {
      for (const mark of dto.marks) {
        await tx.testMarks.upsert({
          where: {
            testId_studentId: {
              testId,
              studentId: mark.studentId,
            },
          },
          update: {
            marksObtained: mark.marksObtained,
            subjectMarks: (mark.subjectMarks || {}) as Prisma.InputJsonValue,
            isAbsent: mark.isAbsent || false,
            remarks: mark.remarks || null,
            enteredBy: userId,
          },
          create: {
            testId,
            studentId: mark.studentId,
            marksObtained: mark.marksObtained,
            subjectMarks: (mark.subjectMarks || {}) as Prisma.InputJsonValue,
            isAbsent: mark.isAbsent || false,
            remarks: mark.remarks || null,
            enteredBy: userId,
          },
        });
      }
    });

    this.logger.log(`Marks entered for test ${testId}: ${dto.marks.length} students`);
    return { message: `Marks entered for ${dto.marks.length} students` };
  }

  // ──────────────────────────────────────────────────
  // COMPUTE RANKINGS
  // ──────────────────────────────────────────────────

  async computeRankings(tenantId: string, testId: string) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      include: {
        marks: {
          where: { isAbsent: false },
          orderBy: { marksObtained: 'desc' },
          include: {
            student: { select: { id: true } },
          },
        },
      },
    });
    if (!test) throw new NotFoundException('Test not found');
    if (test.marks.length === 0) {
      throw new BadRequestException('No marks entered yet');
    }

    // Delete existing rankings
    await this.prisma.testRanking.deleteMany({ where: { testId } });

    // Compute rankings with tie handling
    const totalStudents = test.marks.length;
    const rankings: {
      testId: string;
      studentId: string;
      batchRank: number;
      overallRank: number;
      percentile: number;
      grade: string;
    }[] = [];

    let currentRank = 1;
    let previousMarks: number | null = null;
    let sameRankCount = 0;

    for (let i = 0; i < test.marks.length; i++) {
      const mark = test.marks[i];
      const marksObtained = Number(mark.marksObtained);

      if (previousMarks !== null && marksObtained < previousMarks) {
        currentRank += sameRankCount;
        sameRankCount = 1;
      } else if (previousMarks !== null && marksObtained === previousMarks) {
        sameRankCount++;
      } else {
        sameRankCount = 1;
      }

      const percentage = Number(test.totalMarks) > 0
        ? (marksObtained / Number(test.totalMarks)) * 100
        : 0;
      const percentile = totalStudents > 1
        ? Math.round(((totalStudents - currentRank) / (totalStudents - 1)) * 10000) / 100
        : 100;

      rankings.push({
        testId,
        studentId: mark.studentId,
        batchRank: currentRank,
        overallRank: currentRank, // Same as batch rank for single-batch tests
        percentile,
        grade: calculateGrade(percentage),
      });

      previousMarks = marksObtained;
    }

    await this.prisma.testRanking.createMany({ data: rankings });

    this.logger.log(`Rankings computed for test ${testId}: ${rankings.length} students`);
    return { message: `Rankings computed for ${rankings.length} students`, totalRanked: rankings.length };
  }

  // ──────────────────────────────────────────────────
  // PUBLISH TEST
  // ──────────────────────────────────────────────────

  async publish(tenantId: string, testId: string) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      include: { _count: { select: { rankings: true } } },
    });
    if (!test) throw new NotFoundException('Test not found');
    if (test.status === 'PUBLISHED') {
      throw new BadRequestException('Test is already published');
    }
    if (test._count.rankings === 0) {
      throw new BadRequestException('Compute rankings before publishing');
    }

    await this.prisma.test.update({
      where: { id: testId },
      data: { status: 'PUBLISHED' },
    });

    this.logger.log(`Test published: ${testId}`);
    return { message: 'Test published successfully' };
  }

  // ──────────────────────────────────────────────────
  // MERIT LIST
  // ──────────────────────────────────────────────────

  async getMeritList(tenantId: string, testId: string) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      include: {
        batch: { select: { name: true } },
        rankings: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, rollNumber: true },
            },
          },
          orderBy: { batchRank: 'asc' },
        },
        marks: {
          select: { studentId: true, marksObtained: true },
        },
      },
    });

    if (!test) throw new NotFoundException('Test not found');

    const marksMap = new Map(test.marks.map((m) => [m.studentId, Number(m.marksObtained)]));

    return {
      testName: test.name,
      batchName: test.batch.name,
      generatedAt: new Date().toISOString(),
      totalStudents: test.rankings.length,
      items: test.rankings.map((r) => ({
        rank: r.batchRank,
        studentId: r.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        rollNumber: r.student.rollNumber,
        batchName: test.batch.name,
        totalMarks: Number(test.totalMarks),
        marksObtained: marksMap.get(r.studentId) || 0,
        percentage: Number(test.totalMarks) > 0
          ? Math.round(((marksMap.get(r.studentId) || 0) / Number(test.totalMarks)) * 10000) / 100
          : 0,
        percentile: r.percentile ? Number(r.percentile) : 0,
        grade: r.grade || '',
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // SUBJECT ANALYSIS
  // ──────────────────────────────────────────────────

  async getSubjectAnalysis(tenantId: string, testId: string) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, tenantId },
      include: {
        marks: {
          select: { subjectMarks: true, isAbsent: true },
        },
      },
    });
    if (!test) throw new NotFoundException('Test not found');

    // Resolve subjects
    const subjects = test.subjectIds.length > 0
      ? await this.prisma.subject.findMany({
          where: { id: { in: test.subjectIds } },
          select: { id: true, name: true },
        })
      : [];

    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    // Aggregate per subject
    const subjectStats = new Map<
      string,
      { scores: number[]; absentCount: number }
    >();

    for (const mark of test.marks) {
      const sm = mark.subjectMarks as Record<string, number> | null;
      if (!sm) continue;

      for (const [subjectKey, score] of Object.entries(sm)) {
        if (!subjectStats.has(subjectKey)) {
          subjectStats.set(subjectKey, { scores: [], absentCount: 0 });
        }
        const entry = subjectStats.get(subjectKey)!;
        if (mark.isAbsent) {
          entry.absentCount++;
        } else {
          entry.scores.push(Number(score));
        }
      }
    }

    return Array.from(subjectStats.entries()).map(([subjectKey, data]) => ({
      subjectId: subjectKey,
      subjectName: subjectMap.get(subjectKey) || subjectKey,
      average: data.scores.length > 0
        ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100) / 100
        : 0,
      highest: data.scores.length > 0 ? Math.max(...data.scores) : 0,
      lowest: data.scores.length > 0 ? Math.min(...data.scores) : 0,
      totalStudents: data.scores.length,
      absentCount: data.absentCount,
    }));
  }
}
