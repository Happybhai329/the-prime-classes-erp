import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCounsellorDto, UpdateCounsellorDto, QueryCounsellorDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class CounsellorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryCounsellorDto) {
    const where: Prisma.CounsellorWhereInput = {
      tenantId,
      ...(query.active !== undefined && { active: query.active === 'true' }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { mobile: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [counsellors, total] = await Promise.all([
      this.prisma.counsellor.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.counsellor.count({ where }),
    ]);

    return {
      data: counsellors,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const counsellor = await this.prisma.counsellor.findFirst({
      where: { id, tenantId },
    });

    if (!counsellor) {
      throw new NotFoundException('Counsellor not found');
    }

    return counsellor;
  }

  async create(tenantId: string, dto: CreateCounsellorDto) {
    return this.prisma.counsellor.create({
      data: {
        tenantId,
        name: dto.name,
        mobile: dto.mobile,
        email: dto.email,
        targetAdmissions: dto.targetAdmissions || 0,
        targetRevenue: new Prisma.Decimal(dto.targetRevenue || 0),
        active: dto.active !== undefined ? dto.active : true,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCounsellorDto) {
    await this.findOne(tenantId, id);

    return this.prisma.counsellor.update({
      where: { id },
      data: {
        name: dto.name,
        mobile: dto.mobile,
        email: dto.email,
        targetAdmissions: dto.targetAdmissions,
        targetRevenue: dto.targetRevenue !== undefined ? new Prisma.Decimal(dto.targetRevenue) : undefined,
        active: dto.active,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Hard-delete or soft-delete? The schema doesn't have deletedAt for Counsellor. We do hard delete.
    return this.prisma.counsellor.delete({
      where: { id },
    });
  }
}
