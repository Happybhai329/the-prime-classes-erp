import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOnlineTestDto, AutoGenerateTestDto, UpdateOnlineTestDto, QueryOnlineTestDto, SubmitAttemptDto, SaveAttemptStateDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { OnlineTestMode, AttemptStatus, AchievementType, NotificationType } from '@prime/shared-types';

@Injectable()
export class OnlineTestsService {
  private readonly logger = new Logger(OnlineTestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ──────────────────────────────────────────────────
  // TEST CRUD
  // ──────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateOnlineTestDto) {
    const test = await this.prisma.onlineTest.create({
      data: {
        tenantId,
        batchId: dto.batchId,
        subjectId: dto.subjectId || null,
        title: dto.title,
        description: dto.description || null,
        testMode: dto.testMode,
        durationMinutes: dto.durationMinutes,
        totalMarks: dto.totalMarks,
        passingMarks: dto.passingMarks,
        negativeMarking: dto.negativeMarking || 0,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
        sectionalSettings: dto.sectionalSettings || null,
        isPublished: dto.isPublished || false,
      },
    });

    if (dto.questionIds && dto.questionIds.length > 0) {
      // Fetch question marks
      const questions = await this.prisma.question.findMany({
        where: { id: { in: dto.questionIds }, tenantId },
        select: { id: true, marks: true },
      });

      // Insert junction table with order
      const records = questions.map((q, idx) => ({
        onlineTestId: test.id,
        questionId: q.id,
        sortOrder: idx + 1,
        marks: q.marks,
      }));

      await this.prisma.onlineTestQuestion.createMany({
        data: records,
      });
    }

    if (test.isPublished) {
      await this.triggerNewTestNotification(tenantId, test);
    }

    return test;
  }

  // ──────────────────────────────────────────────────
  // AUTOMATED TEST GENERATION (PART 6)
  // ──────────────────────────────────────────────────

  async autoGenerate(tenantId: string, dto: AutoGenerateTestDto) {
    const { EASY, MEDIUM, HARD } = dto.difficultyMix;
    const totalQuestions = EASY + MEDIUM + HARD;

    if (totalQuestions <= 0) {
      throw new BadRequestException('Total questions must be greater than zero');
    }

    // 1. Fetch available questions for subject
    const questions = await this.prisma.question.findMany({
      where: { subjectId: dto.subjectId, tenantId, deletedAt: null },
      select: { id: true, difficulty: true },
    });

    const easyPool = questions.filter(q => q.difficulty === 'EASY');
    const mediumPool = questions.filter(q => q.difficulty === 'MEDIUM');
    const hardPool = questions.filter(q => q.difficulty === 'HARD');

    if (easyPool.length < EASY || mediumPool.length < MEDIUM || hardPool.length < HARD) {
      throw new BadRequestException(
        `Insufficient questions in repository. Required: Easy(${EASY}), Medium(${MEDIUM}), Hard(${HARD}). ` +
        `Available: Easy(${easyPool.length}), Medium(${mediumPool.length}), Hard(${hardPool.length})`
      );
    }

    // 2. Random selection function
    const sample = (pool: any[], size: number) => {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, size);
    };

    const selectedEasy = sample(easyPool, EASY);
    const selectedMedium = sample(mediumPool, MEDIUM);
    const selectedHard = sample(hardPool, HARD);

    const allSelected = [...selectedEasy, ...selectedMedium, ...selectedHard];

    // 3. Weight-based mark calculation to sum up to exactly totalMarks
    // Weightage formula: Easy=1x, Medium=2x, Hard=3x
    const totalWeight = (EASY * 1) + (MEDIUM * 2) + (HARD * 3);
    const unitMark = Number(dto.totalMarks) / totalWeight;

    // Create the Online Test
    const test = await this.prisma.onlineTest.create({
      data: {
        tenantId,
        batchId: dto.batchId,
        subjectId: dto.subjectId,
        title: dto.title,
        description: `Automated test generated from Question Repository. Difficulty mix: Easy(${EASY}), Medium(${MEDIUM}), Hard(${HARD})`,
        testMode: dto.testMode,
        durationMinutes: dto.durationMinutes,
        totalMarks: dto.totalMarks,
        passingMarks: dto.passingMarks,
        negativeMarking: dto.negativeMarking || 0,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
        isPublished: true, // Auto-published by default
      },
    });

    // 4. Save test questions with computed marks
    const records = allSelected.map((q, idx) => {
      let qMarks = unitMark; // Easy
      if (q.difficulty === 'MEDIUM') qMarks = unitMark * 2;
      if (q.difficulty === 'HARD') qMarks = unitMark * 3;

      return {
        onlineTestId: test.id,
        questionId: q.id,
        sortOrder: idx + 1,
        marks: new Prisma.Decimal(Math.round(qMarks * 100) / 100),
      };
    });

    await this.prisma.onlineTestQuestion.createMany({
      data: records as any,
    });

    await this.triggerNewTestNotification(tenantId, test);

    return test;
  }

  async update(tenantId: string, id: string, dto: UpdateOnlineTestDto) {
    const test = await this.prisma.onlineTest.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!test) throw new NotFoundException('Online test not found');

    const updated = await this.prisma.onlineTest.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : test.title,
        description: dto.description !== undefined ? dto.description : test.description,
        batchId: dto.batchId !== undefined ? dto.batchId : test.batchId,
        subjectId: dto.subjectId !== undefined ? dto.subjectId : test.subjectId,
        testMode: dto.testMode !== undefined ? dto.testMode : test.testMode,
        durationMinutes: dto.durationMinutes !== undefined ? dto.durationMinutes : test.durationMinutes,
        totalMarks: dto.totalMarks !== undefined ? dto.totalMarks : test.totalMarks,
        passingMarks: dto.passingMarks !== undefined ? dto.passingMarks : test.passingMarks,
        negativeMarking: dto.negativeMarking !== undefined ? dto.negativeMarking : test.negativeMarking,
        scheduledStart: dto.scheduledStart !== undefined ? new Date(dto.scheduledStart) : test.scheduledStart,
        scheduledEnd: dto.scheduledEnd !== undefined ? new Date(dto.scheduledEnd) : test.scheduledEnd,
        sectionalSettings: dto.sectionalSettings !== undefined ? dto.sectionalSettings : test.sectionalSettings,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : test.isPublished,
      },
    });

    if (dto.isPublished && !test.isPublished) {
      await this.triggerNewTestNotification(tenantId, updated);
    }

    return updated;
  }

  async findAll(tenantId: string, query: QueryOnlineTestDto, studentId?: string) {
    const where: Prisma.OnlineTestWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.batchId && { batchId: query.batchId }),
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.testMode && { testMode: query.testMode }),
    };

    if (studentId) {
      // Restrict to student's enrolled batches
      const enrollments = await this.prisma.batchStudent.findMany({
        where: { studentId, status: 'ACTIVE' },
        select: { batchId: true },
      });
      const batchIds = enrollments.map(e => e.batchId);
      where.batchId = { in: batchIds };
      where.isPublished = true;
    } else {
      if (query.isPublished !== undefined) {
        where.isPublished = query.isPublished;
      }
    }

    const [tests, total] = await Promise.all([
      this.prisma.onlineTest.findMany({
        where,
        include: {
          batch: { select: { name: true, code: true } },
          subject: { select: { name: true, code: true } },
          attempts: studentId ? {
            where: { studentId },
            select: { id: true, status: true, scoreObtained: true, submittedAt: true },
          } : {
            select: { id: true, status: true },
          },
        },
        orderBy: { scheduledStart: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.onlineTest.count({ where }),
    ]);

    return {
      data: tests,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const test = await this.prisma.onlineTest.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        batch: { select: { name: true } },
        subject: { select: { name: true } },
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) throw new NotFoundException('Online test not found');

    return test;
  }

  async remove(tenantId: string, id: string) {
    const test = await this.prisma.onlineTest.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!test) throw new NotFoundException('Online test not found');

    await this.prisma.onlineTest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // TEST ENGINE SESSIONS (START, AUTOSAVE, RESUME, SUBMIT)
  // ──────────────────────────────────────────────────

  async startAttempt(tenantId: string, testId: string, studentId: string) {
    const test = await this.prisma.onlineTest.findFirst({
      where: { id: testId, tenantId, deletedAt: null },
    });

    if (!test) throw new NotFoundException('Online test not found');

    const now = new Date();
    if (now < test.scheduledStart || now > test.scheduledEnd) {
      throw new BadRequestException('Test is not currently active');
    }

    // Check or create attempt
    let attempt = await this.prisma.testAttempt.findUnique({
      where: { onlineTestId_studentId: { onlineTestId: testId, studentId } },
    });

    if (attempt) {
      if (attempt.status !== AttemptStatus.IN_PROGRESS) {
        throw new BadRequestException('Test attempt has already been submitted');
      }
      return attempt;
    }

    attempt = await this.prisma.testAttempt.create({
      data: {
        tenantId,
        onlineTestId: testId,
        studentId,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: now,
      },
    });

    return attempt;
  }

  async saveState(tenantId: string, attemptId: string, studentId: string, dto: SaveAttemptStateDto) {
    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, studentId, tenantId },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is no longer in progress');
    }

    return this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: { resumeState: dto.resumeState as Prisma.InputJsonValue },
    });
  }

  async submitAttempt(tenantId: string, attemptId: string, studentId: string, dto: SubmitAttemptDto) {
    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, studentId, tenantId },
      include: {
        onlineTest: {
          include: {
            questions: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is already finalized');
    }

    const test = attempt.onlineTest;
    const testQuestions = test.questions;
    const qMap = new Map(testQuestions.map(tq => [tq.questionId, tq]));

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let totalTimeSpent = 0;

    const responseRecords: any[] = [];

    // Evaluate each response
    dto.responses.forEach(res => {
      const qConfig = qMap.get(res.questionId);
      if (!qConfig) return;

      const marks = Number(qConfig.marks);
      const isCorrect = res.selectedAnswer === qConfig.question.correctAnswer;
      let obtained = 0;

      if (res.selectedAnswer) {
        if (isCorrect) {
          obtained = marks;
          correctCount++;
        } else {
          // Negative marking deduction
          obtained = -marks * Number(test.negativeMarking);
          incorrectCount++;
        }
      }

      score += obtained;
      totalTimeSpent += res.timeSpentSeconds || 0;

      responseRecords.push({
        testAttemptId: attemptId,
        questionId: res.questionId,
        selectedAnswer: res.selectedAnswer || null,
        isCorrect: res.selectedAnswer ? isCorrect : null,
        marksObtained: new Prisma.Decimal(obtained),
        timeSpentSeconds: res.timeSpentSeconds || 0,
      });
    });

    // Calculate accuracy percentage
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    const submittedAt = new Date();
    const isAutoSubmit = submittedAt > new Date(attempt.startedAt.getTime() + (test.durationMinutes * 60 * 1000) + 120000); // 2 mins buffer

    const finalStatus = isAutoSubmit ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.COMPLETED;

    const finalResult = await this.prisma.$transaction(async (tx) => {
      // 1. Save all responses
      await tx.testResponse.createMany({
        data: responseRecords,
      });

      // 2. Finalize attempt
      const att = await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          status: finalStatus,
          submittedAt,
          scoreObtained: new Prisma.Decimal(Math.max(0, score)), // no below 0 marks overall
          accuracy: new Prisma.Decimal(accuracy),
          timeSpentSeconds: totalTimeSpent,
          resumeState: Prisma.DbNull,
        },
      });

      // 3. Gamification Reward: 50 points for completing test
      let pointsGranted = 50;
      let badgeEarned: string | null = null;
      let badgeUrl: string | null = null;

      if (score >= Number(test.passingMarks)) {
        pointsGranted += 30; // bonus passing points
      }

      // If mock test was perfect 100%
      if (accuracy === 100 && attemptedCount === testQuestions.length) {
        pointsGranted += 50;
        badgeEarned = 'Top Performer';
        badgeUrl = '/assets/badges/top_performer.png';
      }

      await tx.student.update({
        where: { id: studentId },
        data: { points: { increment: pointsGranted } },
      });

      await tx.studentAchievement.create({
        data: {
          tenantId,
          studentId,
          achievementType: AchievementType.POINTS,
          points: pointsGranted,
          badgeName: badgeEarned,
          badgeImageUrl: badgeUrl,
          description: `Earned ${pointsGranted} points for taking mock test: "${test.title}"` + (badgeEarned ? ` and Badge: ${badgeEarned}!` : ''),
        },
      });

      return att;
    });

    // Notify parent & student
    try {
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        select: { userId: true, firstName: true },
      });
      if (student?.userId) {
        await this.notifications.create(tenantId, {
          title: 'Test Completed Successfully',
          body: `You scored ${Math.max(0, Math.round(score * 100) / 100)} / ${test.totalMarks} in "${test.title}".`,
          type: NotificationType.TEST_RESULT,
          targetIds: [student.userId],
          data: { testId: test.id },
        });
      }
    } catch {}

    return finalResult;
  }

  // ──────────────────────────────────────────────────
  // PRIVATE NOTIFICATION TRIGGER
  // ──────────────────────────────────────────────────

  private async triggerNewTestNotification(tenantId: string, test: any) {
    const students = await this.prisma.student.findMany({
      where: { tenantId, batchEnrollments: { some: { batchId: test.batchId, status: 'ACTIVE' } } },
      select: { userId: true },
    });

    const targetIds = students.map(s => s.userId).filter(id => id);

    if (targetIds.length > 0) {
      await this.notifications.create(tenantId, {
        title: 'New Online Test Scheduled',
        body: `"${test.title}" has been scheduled. Duration: ${test.durationMinutes} mins. Starts on ${test.scheduledStart.toISOString().split('T')[0]}.`,
        type: NotificationType.TEST_SCHEDULED,
        targetIds,
        data: { testId: test.id },
      });
    }
  }
}
