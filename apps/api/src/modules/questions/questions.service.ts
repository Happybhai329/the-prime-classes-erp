import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto, BulkImportQuestionsDto, CreateQuestionBankDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // QUESTIONS CRUD
  // ──────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        tenantId,
        subjectId: dto.subjectId,
        topic: dto.topic,
        difficulty: dto.difficulty,
        marks: dto.marks,
        questionType: dto.questionType,
        questionText: dto.questionText,
        options: dto.options ? (dto.options as Prisma.InputJsonValue) : Prisma.DbNull,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation || null,
        tags: dto.tags || [],
        examTypes: dto.examTypes || [],
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.question.update({
      where: { id },
      data: {
        ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
        ...(dto.topic !== undefined && { topic: dto.topic }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.marks !== undefined && { marks: dto.marks }),
        ...(dto.questionType !== undefined && { questionType: dto.questionType }),
        ...(dto.questionText !== undefined && { questionText: dto.questionText }),
        ...(dto.options !== undefined && { options: dto.options ? (dto.options as Prisma.InputJsonValue) : Prisma.DbNull }),
        ...(dto.correctAnswer !== undefined && { correctAnswer: dto.correctAnswer }),
        ...(dto.explanation !== undefined && { explanation: dto.explanation }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.examTypes !== undefined && { examTypes: dto.examTypes }),
      },
    });
  }

  async findAll(tenantId: string, query: QueryQuestionDto) {
    const where: Prisma.QuestionWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.questionType && { questionType: query.questionType }),
      ...(query.tag && { tags: { has: query.tag } }),
      ...(query.questionBankId && {
        questionBankQuestions: {
          some: { questionBankId: query.questionBankId },
        },
      }),
      ...(query.search && {
        OR: [
          { questionText: { contains: query.search, mode: 'insensitive' } },
          { topic: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          subject: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        subject: true,
      },
    });

    if (!question) throw new NotFoundException('Question not found');

    return question;
  }

  async remove(tenantId: string, id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!question) throw new NotFoundException('Question not found');

    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // BULK IMPORT
  // ──────────────────────────────────────────────────

  async bulkImport(tenantId: string, dto: BulkImportQuestionsDto) {
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('No questions provided for import');
    }

    const data = dto.questions.map(q => ({
      tenantId,
      subjectId: q.subjectId,
      topic: q.topic,
      difficulty: q.difficulty,
      marks: q.marks,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options ? JSON.stringify(q.options) : null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      tags: q.tags || [],
      examTypes: q.examTypes || [],
    }));

    // Perform transaction batch insert
    const result = await this.prisma.$transaction(
      data.map(q => this.prisma.question.create({
        data: {
          ...q,
          options: q.options ? JSON.parse(q.options) : undefined,
        },
      }))
    );

    this.logger.log(`Bulk imported ${result.length} questions for tenant ${tenantId}`);
    return { count: result.length, questions: result };
  }

  // ──────────────────────────────────────────────────
  // QUESTION BANKS
  // ──────────────────────────────────────────────────

  async createQuestionBank(tenantId: string, dto: CreateQuestionBankDto) {
    return this.prisma.questionBank.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description || null,
        subjectId: dto.subjectId,
      },
    });
  }

  async findQuestionBanks(tenantId: string, subjectId?: string) {
    return this.prisma.questionBank.findMany({
      where: {
        tenantId,
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: { select: { name: true, code: true } },
        _count: { select: { questionBankQuestions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findQuestionBankDetails(tenantId: string, id: string) {
    const bank = await this.prisma.questionBank.findFirst({
      where: { id, tenantId },
      include: {
        subject: true,
        questionBankQuestions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!bank) throw new NotFoundException('Question Bank not found');

    return bank;
  }

  async addQuestionsToBank(tenantId: string, id: string, questionIds: string[]) {
    const bank = await this.prisma.questionBank.findFirst({
      where: { id, tenantId },
    });
    if (!bank) throw new NotFoundException('Question Bank not found');

    // Filter valid questions
    const validQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, tenantId, deletedAt: null },
      select: { id: true },
    });
    const validIds = validQuestions.map(q => q.id);

    if (validIds.length === 0) return { count: 0 };

    const records = validIds.map(qId => ({
      questionBankId: id,
      questionId: qId,
    }));

    await this.prisma.questionBankQuestion.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { count: records.length };
  }

  async removeQuestionsFromBank(tenantId: string, id: string, questionIds: string[]) {
    const result = await this.prisma.questionBankQuestion.deleteMany({
      where: {
        questionBankId: id,
        questionId: { in: questionIds },
      },
    });

    return { count: result.count };
  }
}
