import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { QueryReceiptsDto } from '../dto';
import { buildPaginationMeta, generateInvoiceNumber } from '../../../common/utils/helpers';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(tenantId: string, paymentId: string) {
    const payment = await this.prisma.feePayment.findFirst({
      where: { id: paymentId, tenantId, deletedAt: null },
      include: {
        studentFee: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
            feeStructure: { select: { name: true } },
          },
        },
        receipt: true,
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    // Return existing receipt if already generated
    if (payment.receipt) {
      return this.formatReceipt(payment.receipt);
    }

    const student = payment.studentFee?.student;
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown';
    const feePlanName = payment.studentFee?.feeStructure?.name || 'Fee Payment';

    // Get tenant info for branding
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, logoUrl: true, settings: true },
    });

    const receiptCount = await this.prisma.feeReceipt.count({ where: { tenantId } });
    const receiptNumber = generateInvoiceNumber('RCP', receiptCount + 1);

    const verificationUrl = `${process.env.APP_URL || 'https://prime-erp.com'}/verify/receipt/${paymentId}`;

    const receipt = await this.prisma.feeReceipt.create({
      data: {
        tenantId,
        paymentId,
        receiptNumber,
        studentName,
        studentId: student?.id || '',
        amount: payment.amountPaid,
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate,
        feeDescription: feePlanName,
        qrData: verificationUrl,
        metadata: {
          instituteName: tenant?.name || 'The Prime Classes',
          instituteLogo: tenant?.logoUrl || null,
          studentRollNumber: student?.rollNumber || '',
          transactionId: payment.transactionId || null,
        },
      },
    });

    return this.formatReceipt(receipt);
  }

  async findAll(tenantId: string, query: QueryReceiptsDto) {
    const where: Prisma.FeeReceiptWhereInput = {
      tenantId,
      ...(query.studentId && { studentId: query.studentId }),
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
          { studentName: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [receipts, total] = await Promise.all([
      this.prisma.feeReceipt.findMany({
        where,
        orderBy: { generatedAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.feeReceipt.count({ where }),
    ]);

    return {
      data: receipts.map((r) => this.formatReceipt(r)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const receipt = await this.prisma.feeReceipt.findFirst({
      where: { id, tenantId },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return this.formatReceipt(receipt);
  }

  async verifyReceipt(paymentId: string) {
    const receipt = await this.prisma.feeReceipt.findFirst({
      where: { paymentId },
    });
    if (!receipt) return { valid: false, message: 'Receipt not found' };

    return {
      valid: true,
      receiptNumber: receipt.receiptNumber,
      studentName: receipt.studentName,
      amount: Number(receipt.amount),
      paymentDate: receipt.paymentDate.toISOString().split('T')[0],
      paymentMode: receipt.paymentMode,
    };
  }

  private formatReceipt(receipt: any) {
    const metadata = (receipt.metadata || {}) as any;
    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      studentName: receipt.studentName,
      studentId: receipt.studentId,
      amount: Number(receipt.amount),
      paymentMode: receipt.paymentMode,
      paymentDate: receipt.paymentDate.toISOString().split('T')[0],
      feeDescription: receipt.feeDescription,
      qrData: receipt.qrData,
      generatedAt: receipt.generatedAt.toISOString(),
      instituteName: metadata.instituteName || '',
      instituteLogo: metadata.instituteLogo || null,
    };
  }
}
