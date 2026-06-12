import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FeeReportQueryDto } from '../dto';

@Injectable()
export class FeeReportsService {
  private readonly logger = new Logger(FeeReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDailyCollection(tenantId: string, query: FeeReportQueryDto) {
    const date = query.date ? new Date(query.date) : new Date();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const payments = await this.prisma.feePayment.findMany({
      where: { tenantId, deletedAt: null, paymentDate: { gte: startOfDay, lt: endOfDay } },
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
      orderBy: { createdAt: 'desc' },
    });

    const byPaymentMode = this.aggregateByPaymentMode(payments);

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCollected: payments.reduce((sum, p) => sum + Number(p.amountPaid), 0),
      totalTransactions: payments.length,
      byPaymentMode,
      transactions: payments.map((p) => this.formatPaymentForReport(p)),
    };
  }

  async getMonthlyCollection(tenantId: string, query: FeeReportQueryDto) {
    const now = new Date();
    const month = query.month ? parseInt(query.month, 10) - 1 : now.getMonth();
    const year = query.year ? parseInt(query.year, 10) : now.getFullYear();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    const payments = await this.prisma.feePayment.findMany({
      where: { tenantId, deletedAt: null, paymentDate: { gte: startOfMonth, lt: endOfMonth } },
      include: {
        studentFee: {
          include: {
            student: { select: { firstName: true, lastName: true, rollNumber: true } },
            feeStructure: { select: { name: true } },
          },
        },
        collector: { select: { email: true } },
      },
      orderBy: { paymentDate: 'asc' },
    });

    // Daily breakdown
    const dailyMap = new Map<string, number>();
    payments.forEach((p) => {
      const dateStr = p.paymentDate.toISOString().split('T')[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + Number(p.amountPaid));
    });

    return {
      month: startOfMonth.toLocaleDateString('en-US', { month: 'long' }),
      year,
      totalCollected: payments.reduce((sum, p) => sum + Number(p.amountPaid), 0),
      totalTransactions: payments.length,
      dailyBreakdown: Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount })),
      byPaymentMode: this.aggregateByPaymentMode(payments),
    };
  }

  async getStudentLedger(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, rollNumber: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Get batch name
    const batchEnrollment = await this.prisma.batchStudent.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: { batch: { select: { name: true } } },
    });

    const studentFees = await this.prisma.studentFee.findMany({
      where: { tenantId, studentId, deletedAt: null },
      include: {
        feeStructure: { select: { name: true } },
        payments: { where: { deletedAt: null }, orderBy: { paymentDate: 'asc' } },
        discounts: true,
        refunds: { where: { status: 'PROCESSED' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalFee = 0, totalDiscount = 0, totalPaid = 0, totalRefund = 0;
    const entries: any[] = [];
    let runningBalance = 0;

    for (const sf of studentFees) {
      const fee = Number(sf.totalAmount);
      totalFee += fee;
      runningBalance += fee;

      entries.push({
        date: sf.createdAt.toISOString().split('T')[0],
        description: `Fee Plan: ${sf.feeStructure?.name || 'Unknown'} (${sf.academicYear})`,
        type: 'FEE',
        debit: fee,
        credit: 0,
        balance: runningBalance,
      });

      for (const d of sf.discounts) {
        const amt = Number(d.amount);
        totalDiscount += amt;
        runningBalance -= amt;
        entries.push({
          date: d.createdAt.toISOString().split('T')[0],
          description: `Discount: ${d.discountType.replace(/_/g, ' ')}`,
          type: 'DISCOUNT',
          debit: 0,
          credit: amt,
          balance: runningBalance,
        });
      }

      for (const p of sf.payments) {
        const amt = Number(p.amountPaid);
        totalPaid += amt;
        runningBalance -= amt;
        entries.push({
          date: p.paymentDate.toISOString().split('T')[0],
          description: `Payment via ${p.paymentMode} (${p.receiptNumber})`,
          type: 'PAYMENT',
          debit: 0,
          credit: amt,
          balance: runningBalance,
        });
      }

      for (const r of sf.refunds) {
        const amt = Number(r.amount);
        totalRefund += amt;
        runningBalance += amt;
        entries.push({
          date: r.processedAt?.toISOString().split('T')[0] || r.createdAt.toISOString().split('T')[0],
          description: `Refund: ${r.reason}`,
          type: 'REFUND',
          debit: amt,
          credit: 0,
          balance: runningBalance,
        });
      }
    }

    // Sort entries by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        batchName: batchEnrollment?.batch?.name || '',
      },
      totalFee,
      totalDiscount,
      netFee: totalFee - totalDiscount,
      totalPaid,
      totalRefund,
      balance: totalFee - totalDiscount - totalPaid + totalRefund,
      entries,
    };
  }

  async getBatchRevenueReport(tenantId: string, batchId: string, academicYear?: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, tenantId },
      select: { id: true, name: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const batchStudents = await this.prisma.batchStudent.findMany({
      where: { batchId, status: 'ACTIVE' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            studentFees: {
              where: { deletedAt: null, ...(academicYear && { academicYear }) },
            },
          },
        },
      },
    });

    let totalFees = 0, totalCollected = 0;
    const students = batchStudents.map((bs) => {
      const studentFees = bs.student.studentFees || [];
      const totalFee = studentFees.reduce((sum, sf) => sum + Number(sf.netAmount), 0);
      const paid = studentFees.reduce((sum, sf) => sum + Number(sf.paidAmount), 0);

      totalFees += totalFee;
      totalCollected += paid;

      const worstStatus = studentFees.length > 0
        ? studentFees.some((sf) => sf.status === 'OVERDUE') ? 'OVERDUE'
          : studentFees.some((sf) => sf.status === 'PENDING') ? 'PENDING'
          : studentFees.some((sf) => sf.status === 'PARTIAL') ? 'PARTIAL'
          : 'PAID'
        : 'PENDING';

      return {
        studentId: bs.student.id,
        studentName: `${bs.student.firstName} ${bs.student.lastName}`,
        rollNumber: bs.student.rollNumber,
        totalFee,
        paid,
        outstanding: totalFee - paid,
        status: worstStatus,
      };
    });

    return {
      batchId: batch.id,
      batchName: batch.name,
      totalStudents: students.length,
      totalFees,
      totalCollected,
      totalOutstanding: totalFees - totalCollected,
      collectionRate: totalFees > 0 ? Math.round((totalCollected / totalFees) * 100 * 100) / 100 : 0,
      students,
    };
  }

  async getOutstandingReport(tenantId: string, query: FeeReportQueryDto) {
    const now = new Date();

    const studentFees = await this.prisma.studentFee.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        ...(query.academicYear && { academicYear: query.academicYear }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            batchEnrollments: {
              where: { status: 'ACTIVE' },
              include: { batch: { select: { id: true, name: true } } },
              take: 1,
            },
          },
        },
        installments: {
          orderBy: { dueDate: 'asc' },
          where: { status: { in: ['PENDING', 'PARTIAL'] } },
          take: 1,
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' },
          take: 1,
        },
      },
    });

    let totalOutstanding = 0, overdueAmount = 0, upcomingDues = 0;
    const batchMap = new Map<string, { batchId: string; batchName: string; outstanding: number; studentCount: number }>();

    const students = studentFees.map((sf) => {
      const outstanding = Number(sf.netAmount) - Number(sf.paidAmount);
      totalOutstanding += outstanding;

      const nextInstallment = sf.installments[0];
      const isOverdue = nextInstallment && new Date(nextInstallment.dueDate) < now;
      if (isOverdue) overdueAmount += outstanding;
      else upcomingDues += outstanding;

      const batchName = sf.student?.batchEnrollments?.[0]?.batch?.name || 'No Batch';
      const batchId = sf.student?.batchEnrollments?.[0]?.batch?.id || 'none';

      const batchData = batchMap.get(batchId) || { batchId, batchName, outstanding: 0, studentCount: 0 };
      batchData.outstanding += outstanding;
      batchData.studentCount += 1;
      batchMap.set(batchId, batchData);

      return {
        studentId: sf.student.id,
        studentName: `${sf.student.firstName} ${sf.student.lastName}`,
        rollNumber: sf.student.rollNumber,
        batchName,
        outstanding,
        lastPaymentDate: sf.payments[0]?.paymentDate.toISOString().split('T')[0] || null,
        nextDueDate: nextInstallment?.dueDate.toISOString().split('T')[0] || null,
      };
    });

    return {
      totalOutstanding,
      overdueAmount,
      upcomingDues,
      byBatch: Array.from(batchMap.values()),
      students: students.sort((a, b) => b.outstanding - a.outstanding),
    };
  }

  async getParentFeeLedger(tenantId: string, parentId: string) {
    // Get parent's children
    const parentMappings = await this.prisma.studentParentMap.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            studentFees: {
              where: { tenantId, deletedAt: null },
              include: {
                feeStructure: { select: { name: true } },
                installments: { orderBy: { dueDate: 'asc' } },
                payments: {
                  where: { deletedAt: null },
                  include: { collector: { select: { email: true } } },
                  orderBy: { paymentDate: 'desc' },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    return parentMappings.map((pm) => {
      const student = pm.student;
      const studentFees = student.studentFees || [];

      const totalFee = studentFees.reduce((sum, sf) => sum + Number(sf.netAmount), 0);
      const paidAmount = studentFees.reduce((sum, sf) => sum + Number(sf.paidAmount), 0);
      const dueAmount = totalFee - paidAmount;

      // Find next due date
      const now = new Date();
      let nextDueDate: string | null = null;
      let nextDueAmount = 0;

      for (const sf of studentFees) {
        for (const inst of sf.installments) {
          if (inst.status !== 'PAID' && new Date(inst.dueDate) >= now) {
            if (!nextDueDate || new Date(inst.dueDate) < new Date(nextDueDate)) {
              nextDueDate = inst.dueDate.toISOString().split('T')[0];
              nextDueAmount = Number(inst.amount) - Number(inst.paidAmount);
            }
          }
        }
      }

      const recentPayments = studentFees
        .flatMap((sf) => sf.payments.map((p) => ({
          id: p.id,
          studentName: `${student.firstName} ${student.lastName}`,
          rollNumber: student.rollNumber,
          amountPaid: Number(p.amountPaid),
          paymentDate: p.paymentDate.toISOString().split('T')[0],
          paymentMode: p.paymentMode,
          transactionId: p.transactionId,
          receiptNumber: p.receiptNumber,
          collectedByName: (p as any).collector?.email || '',
          notes: p.notes,
          isAdvance: p.isAdvance,
          installmentLabel: null,
          feePlanName: sf.feeStructure?.name || null,
          createdAt: p.createdAt.toISOString(),
        })))
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 10);

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        overview: { totalFee, paidAmount, dueAmount, nextDueDate, nextDueAmount },
        feePlans: studentFees.map((sf) => ({
          feePlanName: sf.feeStructure?.name || '',
          totalAmount: Number(sf.netAmount),
          paidAmount: Number(sf.paidAmount),
          status: sf.status,
          installments: sf.installments.map((inst) => ({
            id: inst.id,
            installmentNo: inst.installmentNo,
            label: inst.label,
            amount: Number(inst.amount),
            dueDate: inst.dueDate.toISOString().split('T')[0],
            paidAmount: Number(inst.paidAmount),
            status: inst.status,
            outstandingAmount: Number(inst.amount) - Number(inst.paidAmount),
          })),
        })),
        recentPayments,
      };
    });
  }

  private aggregateByPaymentMode(payments: any[]) {
    const modeMap = new Map<string, { amount: number; count: number }>();
    payments.forEach((p) => {
      const mode = p.paymentMode;
      const existing = modeMap.get(mode) || { amount: 0, count: 0 };
      existing.amount += Number(p.amountPaid);
      existing.count += 1;
      modeMap.set(mode, existing);
    });

    return Array.from(modeMap.entries()).map(([mode, data]) => ({
      mode,
      amount: data.amount,
      count: data.count,
    }));
  }

  private formatPaymentForReport(p: any) {
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
      collectedByName: p.collector?.email || '',
      notes: p.notes,
      isAdvance: p.isAdvance,
      installmentLabel: p.installment?.label || null,
      feePlanName: p.studentFee?.feeStructure?.name || null,
      createdAt: p.createdAt.toISOString(),
    };
  }
}
