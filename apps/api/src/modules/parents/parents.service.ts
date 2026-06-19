import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateParentDto, UpdateParentDto, QueryParentDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { UserRole } from '@prime/shared-types';

@Injectable()
export class ParentsService {
  private readonly logger = new Logger(ParentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginated parent list with search.
   */
  async findAll(tenantId: string, query: QueryParentDto) {
    const where: Prisma.ParentWhereInput = {
      tenantId,
      ...(query.search && {
        OR: [
          { fatherName: { contains: query.search, mode: 'insensitive' } },
          { motherName: { contains: query.search, mode: 'insensitive' } },
          { fatherPhone: { contains: query.search } },
          { motherPhone: { contains: query.search } },
        ],
      }),
      ...(query.studentId && {
        studentMappings: {
          some: { studentId: query.studentId },
        },
      }),
    };

    const [parents, total] = await Promise.all([
      this.prisma.parent.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        include: {
          user: {
            select: { email: true, phone: true, isActive: true },
          },
          studentMappings: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  rollNumber: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.parent.count({ where }),
    ]);

    return {
      data: parents,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  /**
   * Single parent detail with linked students.
   */
  async findOne(tenantId: string, id: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { email: true, phone: true, isActive: true, lastLogin: true },
        },
        studentMappings: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                status: true,
                classStudying: true,
                targetExam: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent;
  }

  /**
   * Create a new parent profile along with their User account.
   */
  async create(tenantId: string, dto: CreateParentDto) {
    // Check if email already in use
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password || 'Prime@123', 12);

    const result = await this.prisma.$transaction(async (tx) => {
      // Create User account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          phone: dto.fatherPhone,
          passwordHash,
          role: UserRole.PARENT,
        },
      });

      // Create Parent profile
      const parent = await tx.parent.create({
        data: {
          tenantId,
          userId: user.id,
          fatherName: dto.fatherName,
          motherName: dto.motherName || null,
          fatherPhone: dto.fatherPhone,
          motherPhone: dto.motherPhone || null,
          fatherOccupation: dto.fatherOccupation || null,
          motherOccupation: dto.motherOccupation || null,
          emergencyContact: dto.emergencyContact || null,
          address: {},
        },
        include: {
          user: { select: { id: true, email: true, phone: true, isActive: true } },
        },
      });

      return parent;
    });

    this.logger.log(`Parent profile created: ${result.fatherName} (User ID: ${result.userId})`);
    return result;
  }

  /**
   * Update parent contact information.
   */
  async update(tenantId: string, id: string, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, tenantId },
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    const updated = await this.prisma.parent.update({
      where: { id },
      data: {
        ...(dto.fatherName !== undefined && { fatherName: dto.fatherName }),
        ...(dto.motherName !== undefined && { motherName: dto.motherName }),
        ...(dto.fatherPhone !== undefined && { fatherPhone: dto.fatherPhone }),
        ...(dto.motherPhone !== undefined && { motherPhone: dto.motherPhone }),
        ...(dto.fatherOccupation !== undefined && { fatherOccupation: dto.fatherOccupation }),
        ...(dto.motherOccupation !== undefined && { motherOccupation: dto.motherOccupation }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact }),
      },
      include: {
        user: { select: { email: true, phone: true } },
      },
    });

    this.logger.log(`Parent updated: ${id}`);
    return updated;
  }

  /**
   * Search parents by name, email, or phone.
   */
  async search(tenantId: string, query: string) {
    if (!query) return [];
    return this.prisma.parent.findMany({
      where: {
        tenantId,
        OR: [
          { fatherName: { contains: query, mode: 'insensitive' } },
          { motherName: { contains: query, mode: 'insensitive' } },
          { fatherPhone: { contains: query } },
          { motherPhone: { contains: query } },
          {
            user: {
              email: { contains: query, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        user: {
          select: { email: true, phone: true },
        },
      },
      take: 10,
    });
  }
}

