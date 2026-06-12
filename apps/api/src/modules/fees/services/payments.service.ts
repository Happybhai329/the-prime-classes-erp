import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RecordPaymentDto, PaymentAdjustmentDto, QueryPaymentsDto } from '../dto';
import { buildPaginationMeta, generateInvoiceNumber } from '../../../common/utils/helpers';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async recordPayment(tenantId: string, userId: string, dto: RecordPaymentDto) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, tenantId, deletedAt: null },
      include: {
        feeStructure: { select: { name: true } },
        student: { select: { firstName: true, lastName: true, rollNumber: true } },
      },
    });
    if (!studentFee) throw new NotFoundException('Student fee record not found');

    // Validate installment if specified
    let installment: any = null;
    if (dto.installmentId) {
      installment = await this.prisma.feeInstallment.findFirst({
        where: { id: dto.installmentId, studentFeeId: dto.studentFeeId },
      });
      if (!installment) throw new NotFoundException('Installment not found');
    }

    // Generate receipt number
    const paymentCount = await this.prisma.feePayment.count({ where: { tenantId } });
    const receiptNumber = generateInvoiceNumber('RCP', paymentCount + 1);

    const payment = await this.prisma.$transaction(async (tx) => {
      const p = await tx.feePayment.create({
        data: {
          tenantId,
          studentFeeId: dto.studentFeeId,
          installmentId: dto.installmentId || null,
          amountPaid: dto.amountPaid,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMode: dto.paymentMode,
          transactionId: dto.transactionId || null,
          receiptNumber,
          collectedBy: userId,
          notes: dto.notes || null,
          isAdvance: dto.isAdvance || false,
        },
      });

      // Update installment paid amount if applicable
      if (installment) {
        const newPaidAmount = Number(installment.paidAmount) + dto.amountPaid;
        const installmentAmount = Number(installment.amount);
        const newStatus = newPaidAmount >= installmentAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

        await tx.feeInstallment.update({
          where: { id: installment.id },
          data: { paidAmount: newPaidAmount, status: newStatus },
        });
      }

      // Update student fee paid amount and status
      const newPaidAmount = Number(studentFee.paidAmount) + dto.amountPaid;
      const netAmount = Number(studentFee.netAmount);
      const newStatus = newPaidAmount >= netAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

      await tx.studentFee.update({
        where: { id: dto.studentFeeId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });

      return p;
    });

    await this.auditService.logAction(tenantId, userId, 'RECORD_PAYMENT', 'fee_payments', payment.id);

    return {
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      amountPaid: Number(payment.amountPaid),
      paymentMode: payment.paymentMode,
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
      studentName: `${studentFee.student.firstName} ${studentFee.student.lastName}`,
      feePlanName: studentFee.feeStructure?.name || '',
      message: 'Payment recorded successfully',
    };
  }

  async findAll(tenantId: string, query: QueryPaymentsDto) {
    const where: Prisma.FeePaymentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.paymentMode && { paymentMode: query.paymentMode }),
      ...(query.studentId && {
        studentFee: { studentId: query.studentId },
      }),
      ...(query.dateFrom || query.dateTo
        ? {
            paymentDate: {
              ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { receiptNumber: { contains: query.search, mode: 'insensitive' as const } },
          { transactionId: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.feePayment.findMany({
        where,
        include: {
          studentFee: {
            include: {
              student: { select: { firstName: true, lastName: true, rollNumber: true } },
              feeStructure: { select: { name: true } },
            },
          },
          installment: { select: { label: true } },
          collector: { select: { email: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.feePayment.count({ where }),
    ]);

    return {
      data: payments.map((p) => this.formatPayment(p)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const payment = await this.prisma.feePayment.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        studentFee: {
          include: {
            student: { select: { firstName: true, lastName: true, rollNumber: true } },
            feeStructure: { select: { name: true } },
          },
        },
        installment: { select: { label: true } },
        collector: { select: { email: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return this.formatPayment(payment);
  }

  async adjustPayment(tenantId: string, userId: string, dto: PaymentAdjustmentDto) {
    const payment = await this.prisma.feePayment.findFirst({
      where: { id: dto.paymentId, tenantId, deletedAt: null },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const originalAmount = Number(payment.amountPaid);
    const difference = dto.adjustedAmount - originalAmount;

    await this.prisma.$transaction(async (tx) => {
      await tx.feePayment.update({
        where: { id: dto.paymentId },
        data: {
          adjustedAmount: dto.adjustedAmount,
          notes: `${payment.notes || ''}\n[ADJUSTMENT] ${dto.reason} (Original: ₹${originalAmount}, Adjusted: ₹${dto.adjustedAmount})`.trim(),
        },
      });

      // Update student fee paid amount
      if (payment.studentFeeId) {
        const studentFee = await tx.studentFee.findUnique({ where: { id: payment.studentFeeId } });
        if (studentFee) {
          const newPaidAmount = Number(studentFee.paidAmount) + difference;
          const netAmount = Number(studentFee.netAmount);
          const newStatus = newPaidAmount >= netAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

          await tx.studentFee.update({
            where: { id: payment.studentFeeId },
            data: { paidAmount: Math.max(0, newPaidAmount), status: newStatus },
          });
        }
      }

      // Update installment if applicable
      if (payment.installmentId) {
        const installment = await tx.feeInstallment.findUnique({ where: { id: payment.installmentId } });
        if (installment) {
          const newPaidAmount = Number(installment.paidAmount) + difference;
          const instAmount = Number(installment.amount);
          const newStatus = newPaidAmount >= instAmount ? 'PAID' : newPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

          await tx.feeInstallment.update({
            where: { id: payment.installmentId },
            data: { paidAmount: Math.max(0, newPaidAmount), status: newStatus },
          });
        }
      }
    });

    await this.auditService.logAction(tenantId, userId, 'ADJUST_PAYMENT', 'fee_payments', dto.paymentId);
    return { message: 'Payment adjusted successfully' };
  }

  private formatPayment(p: any) {
    const student = p.studentFee?.student;
    return {
      id: p.id,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      rollNumber: student?.rollNumber || '',
      amountPaid: Number(p.amountPaid),
      paymentDate: p.paymentDate.toISOString().split('T')[0],
      paymentMode: p.paymentMode,
      transactionId: p.transactionId,
      receiptNumber: p.receiptNumber,
      collectedByName: p.collector?.email || 'Unknown',
      notes: p.notes,
      isAdvance: p.isAdvance,
      installmentLabel: p.installment?.label || null,
      feePlanName: p.studentFee?.feeStructure?.name || null,
      createdAt: p.createdAt.toISOString(),
    };
  }
}
