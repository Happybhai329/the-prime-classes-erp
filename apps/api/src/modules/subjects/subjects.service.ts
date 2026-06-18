import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto, QuerySubjectDto } from './dto';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List subjects with pagination, search, and targetExam filter.
   */
  async findAll(tenantId: string, query: QuerySubjectDto) {
    const where: Record<string, any> = { tenantId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.targetExam) {
      where.targetExam = { has: query.targetExam };
    }

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page || 1,
        limit: query.take,
        totalPages: Math.ceil(total / query.take),
      },
    };
  }

  /**
   * Get single subject details.
   */
  async findOne(tenantId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  /**
   * Create a new subject master record.
   */
  async create(tenantId: string, dto: CreateSubjectDto) {
    // Check for duplicate code
    const existing = await this.prisma.subject.findFirst({
      where: { tenantId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException('A subject with this code already exists');
    }

    const subject = await this.prisma.subject.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        targetExam: dto.targetExam,
      },
    });

    this.logger.log(`Subject created: ${subject.name} (${subject.code}) in tenant ${tenantId}`);
    return subject;
  }

  /**
   * Update subject details.
   */
  async update(tenantId: string, id: string, dto: UpdateSubjectDto) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Check duplicate code
    if (dto.code && dto.code !== subject.code) {
      const duplicate = await this.prisma.subject.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('A subject with this code already exists');
      }
    }

    const updated = await this.prisma.subject.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.targetExam !== undefined && { targetExam: dto.targetExam }),
      },
    });

    this.logger.log(`Subject updated: ${updated.name} (${updated.code})`);
    return updated;
  }

  /**
   * Delete a subject master record.
   */
  async remove(tenantId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, tenantId },
      include: {
        batchSubjects: { take: 1 },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.batchSubjects.length > 0) {
      throw new ConflictException('Cannot delete subject that is assigned to batches');
    }

    await this.prisma.subject.delete({
      where: { id },
    });

    this.logger.log(`Subject deleted: ${subject.name} (${subject.code})`);
    return { message: 'Subject deleted successfully' };
  }
}
