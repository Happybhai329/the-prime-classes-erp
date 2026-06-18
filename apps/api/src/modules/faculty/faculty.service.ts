import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateFacultyDto, UpdateFacultyDto, QueryFacultyDto } from './dto';
import { UserRole } from '@prime/shared-types';

@Injectable()
export class FacultyService {
  private readonly logger = new Logger(FacultyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List faculty with pagination, search, and specialization filter.
   */
  async findAll(tenantId: string, query: QueryFacultyDto) {
    const where: Record<string, unknown> = { tenantId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { employeeId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.specialization) {
      where.specialization = { has: query.specialization };
    }

    const [data, total] = await Promise.all([
      this.prisma.faculty.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, phone: true, isActive: true, lastLogin: true },
          },
          batchSubjects: {
            include: {
              batch: { select: { id: true, name: true, code: true } },
              subject: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.faculty.count({ where }),
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
   * Get single faculty detail.
   */
  async findOne(tenantId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, email: true, phone: true, isActive: true, lastLogin: true },
        },
        classBatches: {
          select: { id: true, name: true, code: true, isActive: true },
        },
        batchSubjects: {
          include: {
            batch: { select: { id: true, name: true, code: true } },
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    return faculty;
  }

  /**
   * Create faculty along with their User account.
   */
  async create(tenantId: string, dto: CreateFacultyDto) {
    // Check if email already in use
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generate employee ID
    const lastFaculty = await this.prisma.faculty.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true },
    });
    const nextNum = lastFaculty
      ? parseInt(lastFaculty.employeeId.replace(/\D/g, ''), 10) + 1
      : 1;
    const employeeId = `FAC${String(nextNum).padStart(4, '0')}`;

    const result = await this.prisma.$transaction(async (tx) => {
      // Create User account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          phone: dto.phone || null,
          passwordHash,
          role: UserRole.FACULTY,
        },
      });

      // Create Faculty profile
      const faculty = await tx.faculty.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          specialization: dto.specialization || [],
          qualification: dto.qualification || null,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
          salary: dto.salary || null,
        },
        include: {
          user: { select: { id: true, email: true, phone: true, isActive: true } },
        },
      });

      return faculty;
    });

    this.logger.log(`Faculty created: ${result.firstName} ${result.lastName} (${result.employeeId})`);
    return result;
  }

  /**
   * Update faculty profile details.
   */
  async update(tenantId: string, id: string, dto: UpdateFacultyDto) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, tenantId },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const updated = await this.prisma.faculty.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.specialization !== undefined && { specialization: dto.specialization }),
        ...(dto.qualification !== undefined && { qualification: dto.qualification }),
        ...(dto.salary !== undefined && { salary: dto.salary }),
      },
      include: {
        user: { select: { id: true, email: true, phone: true, isActive: true } },
      },
    });

    this.logger.log(`Faculty updated: ${updated.firstName} ${updated.lastName}`);
    return updated;
  }

  /**
   * Remove faculty (deactivates the user account).
   */
  async remove(tenantId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, tenantId },
      include: { user: true },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    await this.prisma.user.update({
      where: { id: faculty.userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        refreshTokenHash: null,
      },
    });

    this.logger.log(`Faculty removed: ${faculty.firstName} ${faculty.lastName}`);
    return { message: 'Faculty removed successfully' };
  }

  /**
   * Assign a faculty member to teach a subject in a batch.
   */
  async assignToBatch(tenantId: string, facultyId: string, batchId: string, subjectId: string) {
    // Verify faculty exists
    const faculty = await this.prisma.faculty.findFirst({ where: { id: facultyId, tenantId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    // Verify batch exists
    const batch = await this.prisma.batch.findFirst({ where: { id: batchId, tenantId } });
    if (!batch) throw new NotFoundException('Batch not found');

    // Verify subject exists
    const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, tenantId } });
    if (!subject) throw new NotFoundException('Subject not found');

    // Upsert batch-subject mapping with this faculty
    const batchSubject = await this.prisma.batchSubject.upsert({
      where: { batchId_subjectId: { batchId, subjectId } },
      create: { batchId, subjectId, facultyId },
      update: { facultyId },
      include: {
        batch: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        faculty: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    this.logger.log(`Faculty ${faculty.firstName} assigned to ${batch.name} — ${subject.name}`);
    return batchSubject;
  }

  /**
   * Remove faculty from a batch-subject assignment.
   */
  async removeFromBatch(tenantId: string, facultyId: string, batchSubjectId: string) {
    const batchSubject = await this.prisma.batchSubject.findFirst({
      where: { id: batchSubjectId, facultyId },
      include: { batch: { select: { tenantId: true } } },
    });

    if (!batchSubject || batchSubject.batch.tenantId !== tenantId) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.batchSubject.update({
      where: { id: batchSubjectId },
      data: { facultyId: null },
    });

    return { message: 'Faculty removed from batch-subject assignment' };
  }
}
