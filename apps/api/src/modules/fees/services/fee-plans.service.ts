import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { CreateFeePlanDto, UpdateFeePlanDto, QueryFeePlansDto } from '../dto';
import { buildPaginationMeta } from '../../../common/utils/helpers';

@Injectable()
export class FeePlansService {
  private readonly logger = new Logger(FeePlansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateFeePlanDto) {
    const amount = dto.amount || dto.totalFee;

    const feePlan = await this.prisma.feeStructure.create({
      data: {
        tenantId,
        name: dto.name,
        course: dto.course || null,
        academicYear: dto.academicYear,
        feeType: dto.feeType,
        installmentType: dto.installmentType,
        batchId: dto.batchId || null,
        description: dto.description || null,
        registrationFee: dto.registrationFee || 0,
        admissionFee: dto.admissionFee || 0,
        monthlyFee: dto.monthlyFee || 0,
        materialFee: dto.materialFee || 0,
        examFee: dto.examFee || 0,
        totalFee: dto.totalFee,
        amount,
        dueDay: dto.dueDay || null,
      },
      include: { batch: { select: { name: true } } },
    });

    await this.auditService.logAction(tenantId, userId, 'CREATE_FEE_PLAN', 'fee_structures', feePlan.id);

    return this.formatFeePlan(feePlan);
  }

  async findAll(tenantId: string, query: QueryFeePlansDto) {
    const where: Prisma.FeeStructureWhereInput = {
      tenantId,
      ...(query.feeType && { feeType: query.feeType }),
      ...(query.installmentType && { installmentType: query.installmentType }),
      ...(query.academicYear && { academicYear: query.academicYear }),
      ...(query.batchId && { batchId: query.batchId }),
      ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { course: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [plans, total] = await Promise.all([
      this.prisma.feeStructure.findMany({
        where,
        include: {
          batch: { select: { name: true } },
          _count: { select: { studentFees: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.feeStructure.count({ where }),
    ]);

    return {
      data: plans.map((p) => this.formatFeePlanSummary(p)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const plan = await this.prisma.feeStructure.findFirst({
      where: { id, tenantId },
      include: {
        batch: { select: { name: true } },
        _count: { select: { studentFees: true } },
      },
    });

    if (!plan) throw new NotFoundException('Fee plan not found');
    return this.formatFeePlan(plan);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateFeePlanDto) {
    const existing = await this.prisma.feeStructure.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Fee plan not found');

    const amount = dto.amount !== undefined ? dto.amount : dto.totalFee !== undefined ? dto.totalFee : undefined;

    const updated = await this.prisma.feeStructure.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.course !== undefined && { course: dto.course }),
        ...(dto.academicYear !== undefined && { academicYear: dto.academicYear }),
        ...(dto.feeType !== undefined && { feeType: dto.feeType }),
        ...(dto.installmentType !== undefined && { installmentType: dto.installmentType }),
        ...(dto.batchId !== undefined && { batchId: dto.batchId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.registrationFee !== undefined && { registrationFee: dto.registrationFee }),
        ...(dto.admissionFee !== undefined && { admissionFee: dto.admissionFee }),
        ...(dto.monthlyFee !== undefined && { monthlyFee: dto.monthlyFee }),
        ...(dto.materialFee !== undefined && { materialFee: dto.materialFee }),
        ...(dto.examFee !== undefined && { examFee: dto.examFee }),
        ...(dto.totalFee !== undefined && { totalFee: dto.totalFee }),
        ...(amount !== undefined && { amount }),
        ...(dto.dueDay !== undefined && { dueDay: dto.dueDay }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { batch: { select: { name: true } } },
    });

    await this.auditService.logAction(tenantId, userId, 'UPDATE_FEE_PLAN', 'fee_structures', id);
    return this.formatFeePlan(updated);
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.feeStructure.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { studentFees: true } } },
    });
    if (!existing) throw new NotFoundException('Fee plan not found');

    if (existing._count.studentFees > 0) {
      // Soft deactivate instead of delete
      await this.prisma.feeStructure.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await this.prisma.feeStructure.delete({ where: { id } });
    }

    await this.auditService.logAction(tenantId, userId, 'DELETE_FEE_PLAN', 'fee_structures', id);
    return { message: 'Fee plan deleted successfully' };
  }

  private formatFeePlanSummary(plan: any) {
    return {
      id: plan.id,
      name: plan.name,
      course: plan.course,
      academicYear: plan.academicYear,
      feeType: plan.feeType,
      totalFee: Number(plan.totalFee),
      installmentType: plan.installmentType,
      batchName: plan.batch?.name || null,
      isActive: plan.isActive,
      assignedStudents: plan._count?.studentFees || 0,
    };
  }

  private formatFeePlan(plan: any) {
    return {
      ...this.formatFeePlanSummary(plan),
      description: plan.description,
      registrationFee: Number(plan.registrationFee),
      admissionFee: Number(plan.admissionFee),
      monthlyFee: Number(plan.monthlyFee),
      materialFee: Number(plan.materialFee),
      examFee: Number(plan.examFee),
      amount: Number(plan.amount),
      dueDay: plan.dueDay,
      batchId: plan.batchId,
      createdAt: plan.createdAt.toISOString(),
    };
  }
}
