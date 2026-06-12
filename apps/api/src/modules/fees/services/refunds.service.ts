import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { CreateRefundDto, UpdateRefundStatusDto, QueryRefundsDto } from '../dto';
import { buildPaginationMeta } from '../../../common/utils/helpers';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateRefundDto) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, tenantId, deletedAt: null },
    });
    if (!studentFee) throw new NotFoundException('Student fee record not found');

    if (dto.amount > Number(studentFee.paidAmount)) {
      throw new BadRequestException('Refund amount cannot exceed paid amount');
    }

    const refund = await this.prisma.feeRefund.create({
      data: {
        tenantId,
        studentFeeId: dto.studentFeeId,
        paymentId: dto.paymentId || null,
        amount: dto.amount,
        reason: dto.reason,
        requestedBy: userId,
      },
    });

    await this.auditService.logAction(tenantId, userId, 'CREATE_REFUND', 'fee_refunds', refund.id);

    return {
      id: refund.id,
      amount: Number(refund.amount),
      status: refund.status,
      message: 'Refund request created successfully',
    };
  }

  async updateStatus(tenantId: string, userId: string, id: string, dto: UpdateRefundStatusDto) {
    const refund = await this.prisma.feeRefund.findFirst({
      where: { id, tenantId },
    });
    if (!refund) throw new NotFoundException('Refund not found');

    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === 'APPROVED' || dto.status === 'REJECTED') {
      updateData.approvedBy = userId;
    }

    if (dto.status === 'PROCESSED') {
      updateData.processedAt = new Date();

      // Deduct from student fee paid amount
      await this.prisma.$transaction(async (tx) => {
        await tx.feeRefund.update({ where: { id }, data: updateData });

        const studentFee = await tx.studentFee.findUnique({
          where: { id: refund.studentFeeId },
        });
        if (studentFee) {
          const newPaidAmount = Math.max(0, Number(studentFee.paidAmount) - Number(refund.amount));
          const netAmount = Number(studentFee.netAmount);
          const newStatus = newPaidAmount >= netAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

          await tx.studentFee.update({
            where: { id: refund.studentFeeId },
            data: { paidAmount: newPaidAmount, status: newStatus },
          });
        }
      });

      await this.auditService.logAction(tenantId, userId, 'PROCESS_REFUND', 'fee_refunds', id);
    } else {
      await this.prisma.feeRefund.update({ where: { id }, data: updateData });
      const action = dto.status === 'APPROVED' ? 'APPROVE_REFUND' : 'REJECT_REFUND';
      await this.auditService.logAction(tenantId, userId, action, 'fee_refunds', id);
    }

    return { message: `Refund ${dto.status.toLowerCase()} successfully` };
  }

  async findAll(tenantId: string, query: QueryRefundsDto) {
    const where: Prisma.FeeRefundWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        studentFee: {
          student: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { rollNumber: { contains: query.search, mode: 'insensitive' as const } },
            ],
          },
        },
      }),
    };

    const [refunds, total] = await Promise.all([
      this.prisma.feeRefund.findMany({
        where,
        include: {
          studentFee: {
            include: {
              student: { select: { firstName: true, lastName: true, rollNumber: true } },
            },
          },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.feeRefund.count({ where }),
    ]);

    return {
      data: refunds.map((r) => ({
        id: r.id,
        studentFeeId: r.studentFeeId,
        studentName: r.studentFee?.student
          ? `${r.studentFee.student.firstName} ${r.studentFee.student.lastName}`
          : '',
        rollNumber: r.studentFee?.student?.rollNumber || '',
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status,
        requestedByName: '',
        approvedByName: null,
        processedAt: r.processedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }
}
