import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  QueryBatchDto,
  AddStudentsDto,
  TransferStudentDto,
} from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginated batch list with search and filters.
   */
  async findAll(tenantId: string, query: QueryBatchDto) {
    const where: Prisma.BatchWhereInput = {
      tenantId,
      ...(query.targetExam && { targetExam: query.targetExam }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [batches, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          classTeacher: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: {
              students: { where: { status: 'ACTIVE' } },
            },
          },
        },
      }),
      this.prisma.batch.count({ where }),
    ]);

    return {
      data: batches.map((b) => ({
        ...b,
        studentCount: b._count.students,
        _count: undefined,
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  /**
   * Single batch detail with enrolled students, subjects, and teacher.
   */
  async findOne(tenantId: string, id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, tenantId },
      include: {
        classTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            specialization: true,
          },
        },
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                status: true,
                classStudying: true,
                photoUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            faculty: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            students: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return {
      ...batch,
      studentCount: batch._count.students,
      _count: undefined,
    };
  }

  /**
   * Create a new batch.
   */
  async create(tenantId: string, dto: CreateBatchDto) {
    // Check code uniqueness within tenant
    const existing = await this.prisma.batch.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Batch code "${dto.code}" already exists`);
    }

    const batch = await this.prisma.batch.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        targetExam: dto.targetExam,
        academicYear: dto.academicYear,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        maxStrength: dto.maxStrength || 50,
        timing: (dto.timing || {}) as unknown as Prisma.InputJsonValue,
        classTeacherId: dto.classTeacherId || null,
      },
      include: {
        classTeacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    this.logger.log(`Batch created: ${batch.name} (${batch.code})`);
    return batch;
  }

  /**
   * Update batch details.
   */
  async update(tenantId: string, id: string, dto: UpdateBatchDto) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, tenantId },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // Check code uniqueness if changing code
    if (dto.code && dto.code !== batch.code) {
      const existing = await this.prisma.batch.findUnique({
        where: { tenantId_code: { tenantId, code: dto.code } },
      });
      if (existing) {
        throw new ConflictException(`Batch code "${dto.code}" already exists`);
      }
    }

    const updateData: Prisma.BatchUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.targetExam !== undefined) updateData.targetExam = dto.targetExam;
    if (dto.academicYear !== undefined) updateData.academicYear = dto.academicYear;
    if (dto.startDate !== undefined) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.maxStrength !== undefined) updateData.maxStrength = dto.maxStrength;
    if (dto.timing !== undefined) updateData.timing = dto.timing as unknown as Prisma.InputJsonValue;
    if (dto.classTeacherId !== undefined) {
      updateData.classTeacher = dto.classTeacherId
        ? { connect: { id: dto.classTeacherId } }
        : { disconnect: true };
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.batch.update({
      where: { id },
      data: updateData,
      include: {
        classTeacher: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * Deactivate a batch (soft-delete equivalent).
   */
  async remove(tenantId: string, id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, tenantId },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    await this.prisma.batch.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Batch deactivated: ${id}`);
    return { message: 'Batch deactivated successfully' };
  }

  /**
   * Add students to a batch.
   */
  async addStudents(tenantId: string, batchId: string, dto: AddStudentsDto) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, tenantId, isActive: true },
      include: { _count: { select: { students: { where: { status: 'ACTIVE' } } } } },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // Check capacity
    const currentCount = batch._count.students;
    if (currentCount + dto.studentIds.length > batch.maxStrength) {
      throw new BadRequestException(
        `Batch capacity exceeded. Current: ${currentCount}, Max: ${batch.maxStrength}, Requested: ${dto.studentIds.length}`,
      );
    }

    // Verify all students belong to tenant
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: dto.studentIds },
        tenantId,
        deletedAt: null,
      },
    });

    if (students.length !== dto.studentIds.length) {
      throw new BadRequestException('One or more student IDs are invalid');
    }

    // Create enrollments, skip duplicates
    const results = await Promise.allSettled(
      dto.studentIds.map((studentId) =>
        this.prisma.batchStudent.create({
          data: { batchId, studentId },
        }),
      ),
    );

    const enrolled = results.filter((r) => r.status === 'fulfilled').length;
    const skipped = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`Added ${enrolled} students to batch ${batchId} (${skipped} skipped)`);
    return { enrolled, skipped, message: `${enrolled} students added to batch` };
  }

  /**
   * Remove a student from a batch.
   */
  async removeStudent(tenantId: string, batchId: string, studentId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, tenantId },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const enrollment = await this.prisma.batchStudent.findUnique({
      where: { batchId_studentId: { batchId, studentId } },
    });
    if (!enrollment) throw new NotFoundException('Student not enrolled in this batch');

    await this.prisma.batchStudent.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED' },
    });

    return { message: 'Student removed from batch' };
  }

  /**
   * Transfer a student from this batch to another.
   */
  async transferStudent(tenantId: string, sourceBatchId: string, dto: TransferStudentDto) {
    // Validate source batch
    const sourceBatch = await this.prisma.batch.findFirst({
      where: { id: sourceBatchId, tenantId },
    });
    if (!sourceBatch) throw new NotFoundException('Source batch not found');

    // Validate target batch
    const targetBatch = await this.prisma.batch.findFirst({
      where: { id: dto.targetBatchId, tenantId, isActive: true },
      include: { _count: { select: { students: { where: { status: 'ACTIVE' } } } } },
    });
    if (!targetBatch) throw new NotFoundException('Target batch not found');

    // Check target capacity
    if (targetBatch._count.students >= targetBatch.maxStrength) {
      throw new BadRequestException('Target batch is at full capacity');
    }

    // Validate enrollment
    const enrollment = await this.prisma.batchStudent.findUnique({
      where: { batchId_studentId: { batchId: sourceBatchId, studentId: dto.studentId } },
    });
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new BadRequestException('Student is not actively enrolled in source batch');
    }

    await this.prisma.$transaction([
      // Mark old enrollment as transferred
      this.prisma.batchStudent.update({
        where: { id: enrollment.id },
        data: { status: 'TRANSFERRED' },
      }),
      // Create new enrollment
      this.prisma.batchStudent.create({
        data: {
          batchId: dto.targetBatchId,
          studentId: dto.studentId,
          transferredFrom: sourceBatchId,
        },
      }),
    ]);

    this.logger.log(
      `Student ${dto.studentId} transferred from ${sourceBatchId} to ${dto.targetBatchId}`,
    );
    return { message: 'Student transferred successfully' };
  }
}
