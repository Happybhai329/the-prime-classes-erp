import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, AdminResetPasswordDto } from './dto';
import { UserRole } from '@prime/shared-types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List users with pagination, search, and role filter.
   */
  async findAll(tenantId: string, query: QueryUserDto) {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
          faculty: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
          parent: { select: { id: true, fatherName: true, fatherPhone: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.user.count({ where }),
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
   * Get single user with related profiles.
   */
  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        faculty: true,
        parent: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Create a new user with hashed password.
   */
  async create(tenantId: string, dto: CreateUserDto) {
    // Check for duplicate email within tenant
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        phone: dto.phone || null,
        passwordHash,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    this.logger.log(`User created: ${user.email} (${user.role}) in tenant ${tenantId}`);
    return user;
  }

  /**
   * Update user details (email, phone, role, isActive).
   */
  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If email is changing, check for duplicates
    if (dto.email && dto.email !== user.email) {
      const duplicate = await this.prisma.user.findFirst({
        where: { tenantId, email: dto.email, deletedAt: null, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${updated.email} (${updated.role})`);
    return updated;
  }

  /**
   * Soft-delete a user.
   */
  async remove(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting your own SUPER_ADMIN account
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ConflictException('Cannot delete a Super Admin account');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        refreshTokenHash: null,
      },
    });

    this.logger.log(`User soft-deleted: ${user.email}`);
    return { message: 'User deleted successfully' };
  }

  /**
   * Toggle user active/inactive status.
   */
  async toggleActive(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
        // If deactivating, invalidate session
        ...(!user.isActive ? {} : { refreshTokenHash: null }),
      },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    this.logger.log(`User ${updated.isActive ? 'activated' : 'deactivated'}: ${updated.email}`);
    return updated;
  }

  /**
   * Admin-initiated password reset (no old password required).
   */
  async adminResetPassword(tenantId: string, id: string, dto: AdminResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        refreshTokenHash: null, // Force re-login
      },
    });

    // Revoke all sessions
    await this.prisma.userSession.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Password reset by admin for user: ${user.email}`);
    return { message: 'Password reset successfully' };
  }

  /**
   * Assign a new role to a user.
   */
  async assignRole(tenantId: string, id: string, role: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    this.logger.log(`Role assigned: ${updated.email} → ${role}`);
    return updated;
  }
}
