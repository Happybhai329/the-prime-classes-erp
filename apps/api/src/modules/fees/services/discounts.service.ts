import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { ApplyDiscountDto } from '../dto';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async applyDiscount(tenantId: string, userId: string, dto: ApplyDiscountDto) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, tenantId, deletedAt: null },
    });
    if (!studentFee) throw new NotFoundException('Student fee record not found');

    // Calculate discount amount
    let discountAmount: number;
    if (dto.discountMode === 'PERCENTAGE') {
      if (dto.value > 100) throw new BadRequestException('Percentage cannot exceed 100');
      discountAmount = Math.floor((Number(studentFee.totalAmount) * dto.value) / 100 * 100) / 100;
    } else {
      discountAmount = dto.value;
    }

    if (discountAmount > Number(studentFee.totalAmount)) {
      throw new BadRequestException('Discount amount cannot exceed total fee');
    }

    const discount = await this.prisma.$transaction(async (tx) => {
      const d = await tx.feeDiscount.create({
        data: {
          tenantId,
          studentFeeId: dto.studentFeeId,
          discountType: dto.discountType,
          discountMode: dto.discountMode,
          value: dto.value,
          amount: discountAmount,
          reason: dto.reason || null,
          approvedBy: userId,
        },
      });

      // Recalculate net amount
      const allDiscounts = await tx.feeDiscount.findMany({
        where: { studentFeeId: dto.studentFeeId },
      });
      const totalDiscount = allDiscounts.reduce((sum, disc) => sum + Number(disc.amount), 0);
      const newNetAmount = Math.max(0, Number(studentFee.totalAmount) - totalDiscount);

      await tx.studentFee.update({
        where: { id: dto.studentFeeId },
        data: {
          discountAmount: totalDiscount,
          netAmount: newNetAmount,
          status: Number(studentFee.paidAmount) >= newNetAmount ? 'PAID' : studentFee.status as any,
        },
      });

      return d;
    });

    await this.auditService.logAction(tenantId, userId, 'APPLY_DISCOUNT', 'fee_discounts', discount.id);

    return {
      id: discount.id,
      discountType: discount.discountType,
      discountMode: discount.discountMode,
      value: Number(discount.value),
      amount: Number(discount.amount),
      reason: discount.reason,
      createdAt: discount.createdAt.toISOString(),
      message: `Discount of ₹${discountAmount} applied successfully`,
    };
  }

  async removeDiscount(tenantId: string, userId: string, discountId: string) {
    const discount = await this.prisma.feeDiscount.findFirst({
      where: { id: discountId, tenantId },
    });
    if (!discount) throw new NotFoundException('Discount not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.feeDiscount.delete({ where: { id: discountId } });

      // Recalculate net amount
      const studentFee = await tx.studentFee.findUnique({ where: { id: discount.studentFeeId } });
      if (studentFee) {
        const remainingDiscounts = await tx.feeDiscount.findMany({
          where: { studentFeeId: discount.studentFeeId },
        });
        const totalDiscount = remainingDiscounts.reduce((sum, d) => sum + Number(d.amount), 0);
        const newNetAmount = Number(studentFee.totalAmount) - totalDiscount;

        await tx.studentFee.update({
          where: { id: discount.studentFeeId },
          data: {
            discountAmount: totalDiscount,
            netAmount: newNetAmount,
            status: Number(studentFee.paidAmount) >= newNetAmount ? 'PAID' : Number(studentFee.paidAmount) > 0 ? 'PARTIAL' : 'PENDING',
          },
        });
      }
    });

    await this.auditService.logAction(tenantId, userId, 'REMOVE_DISCOUNT', 'fee_discounts', discountId);
    return { message: 'Discount removed successfully' };
  }

  async detectSiblings(tenantId: string, studentId: string) {
    // Find all parents linked to this student
    const parentMappings = await this.prisma.studentParentMap.findMany({
      where: { studentId },
      select: { parentId: true },
    });

    if (parentMappings.length === 0) return [];

    const parentIds = parentMappings.map((pm) => pm.parentId);

    // Find all siblings via shared parents
    const siblingMappings = await this.prisma.studentParentMap.findMany({
      where: {
        parentId: { in: parentIds },
        studentId: { not: studentId },
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, rollNumber: true, status: true },
        },
      },
    });

    // Unique siblings
    const siblings = new Map();
    siblingMappings.forEach((sm) => {
      if (sm.student.status === 'ACTIVE' && !siblings.has(sm.student.id)) {
        siblings.set(sm.student.id, sm.student);
      }
    });

    return Array.from(siblings.values());
  }
}
