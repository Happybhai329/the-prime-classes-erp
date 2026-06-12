import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AssignFeeDto, BulkAssignFeeDto, QueryStudentFeesDto } from '../dto';
import { buildPaginationMeta } from '../../../common/utils/helpers';

@Injectable()
export class StudentFeesService {
  private readonly logger = new Logger(StudentFeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async assign(tenantId: string, userId: string, dto: AssignFeeDto) {
    const feePlan = await this.prisma.feeStructure.findFirst({
      where: { id: dto.feeStructureId, tenantId, isActive: true },
    });
    if (!feePlan) throw new NotFoundException('Fee plan not found or inactive');

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Check duplicate
    const existing = await this.prisma.studentFee.findUnique({
      where: {
        studentId_feeStructureId_academicYear: {
          studentId: dto.studentId,
          feeStructureId: dto.feeStructureId,
          academicYear: dto.academicYear,
        },
      },
    });
    if (existing) throw new BadRequestException('Fee plan already assigned to this student for this academic year');

    const totalAmount = Number(feePlan.totalFee);

    const studentFee = await this.prisma.$transaction(async (tx) => {
      const sf = await tx.studentFee.create({
        data: {
          tenantId,
          studentId: dto.studentId,
          feeStructureId: dto.feeStructureId,
          academicYear: dto.academicYear,
          totalAmount,
          netAmount: totalAmount,
        },
      });

      // Generate installments based on installment type
      const installments = this.generateInstallments(feePlan, sf.id, dto.academicYear);
      if (installments.length > 0) {
        await tx.feeInstallment.createMany({ data: installments });
      }

      return sf;
    });

    await this.auditService.logAction(tenantId, userId, 'ASSIGN_FEE', 'student_fees', studentFee.id);
    return this.findOneById(tenantId, studentFee.id);
  }

  async bulkAssign(tenantId: string, userId: string, dto: BulkAssignFeeDto) {
    const feePlan = await this.prisma.feeStructure.findFirst({
      where: { id: dto.feeStructureId, tenantId, isActive: true },
    });
    if (!feePlan) throw new NotFoundException('Fee plan not found or inactive');

    let studentIds = dto.studentIds || [];

    if (dto.batchId) {
      const batchStudents = await this.prisma.batchStudent.findMany({
        where: { batchId: dto.batchId, status: 'ACTIVE' },
        select: { studentId: true },
      });
      studentIds = batchStudents.map((bs) => bs.studentId);
    }

    if (studentIds.length === 0) throw new BadRequestException('No students found for assignment');

    // Filter out already assigned students
    const existing = await this.prisma.studentFee.findMany({
      where: {
        feeStructureId: dto.feeStructureId,
        academicYear: dto.academicYear,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });
    const existingIds = new Set(existing.map((e) => e.studentId));
    const newStudentIds = studentIds.filter((id) => !existingIds.has(id));

    if (newStudentIds.length === 0) {
      return { assigned: 0, skipped: studentIds.length, message: 'All students already have this fee plan assigned' };
    }

    const totalAmount = Number(feePlan.totalFee);

    await this.prisma.$transaction(async (tx) => {
      for (const studentId of newStudentIds) {
        const sf = await tx.studentFee.create({
          data: {
            tenantId,
            studentId,
            feeStructureId: dto.feeStructureId,
            academicYear: dto.academicYear,
            totalAmount,
            netAmount: totalAmount,
          },
        });

        const installments = this.generateInstallments(feePlan, sf.id, dto.academicYear);
        if (installments.length > 0) {
          await tx.feeInstallment.createMany({ data: installments });
        }
      }
    });

    await this.auditService.logAction(tenantId, userId, 'BULK_ASSIGN_FEE', 'student_fees', dto.feeStructureId);

    return {
      assigned: newStudentIds.length,
      skipped: existingIds.size,
      message: `Fee plan assigned to ${newStudentIds.length} students`,
    };
  }

  async findAll(tenantId: string, query: QueryStudentFeesDto) {
    const where: Prisma.StudentFeeWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.academicYear && { academicYear: query.academicYear }),
      ...(query.studentId && { studentId: query.studentId }),
      ...(query.feeStructureId && { feeStructureId: query.feeStructureId }),
      ...(query.batchId && {
        student: {
          batchEnrollments: { some: { batchId: query.batchId, status: 'ACTIVE' } },
        },
      }),
      ...(query.search && {
        student: {
          OR: [
            { firstName: { contains: query.search, mode: 'insensitive' as const } },
            { lastName: { contains: query.search, mode: 'insensitive' as const } },
            { rollNumber: { contains: query.search, mode: 'insensitive' as const } },
          ],
        },
      }),
    };

    const [fees, total] = await Promise.all([
      this.prisma.studentFee.findMany({
        where,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              rollNumber: true,
              batchEnrollments: {
                where: { status: 'ACTIVE' },
                include: { batch: { select: { name: true } } },
                take: 1,
              },
            },
          },
          feeStructure: { select: { name: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.studentFee.count({ where }),
    ]);

    return {
      data: fees.map((sf) => this.formatStudentFee(sf)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.findOneById(tenantId, id);
  }

  async findOneById(tenantId: string, id: string) {
    const sf = await this.prisma.studentFee.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            rollNumber: true,
            batchEnrollments: {
              where: { status: 'ACTIVE' },
              include: { batch: { select: { name: true } } },
              take: 1,
            },
          },
        },
        feeStructure: { select: { name: true } },
        installments: { orderBy: { installmentNo: 'asc' } },
        payments: {
          where: { deletedAt: null },
          include: {
            collector: { select: { email: true } },
            installment: { select: { label: true } },
          },
          orderBy: { paymentDate: 'desc' },
        },
        discounts: true,
        refunds: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!sf) throw new NotFoundException('Student fee record not found');

    return {
      ...this.formatStudentFee(sf),
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
      payments: sf.payments.map((p) => ({
        id: p.id,
        amountPaid: Number(p.amountPaid),
        paymentDate: p.paymentDate.toISOString().split('T')[0],
        paymentMode: p.paymentMode,
        transactionId: p.transactionId,
        receiptNumber: p.receiptNumber,
        collectedByName: (p as any).collector?.email || 'Unknown',
        notes: p.notes,
        isAdvance: p.isAdvance,
        installmentLabel: (p as any).installment?.label || null,
        feePlanName: sf.feeStructure?.name || null,
        createdAt: p.createdAt.toISOString(),
      })),
      discounts: sf.discounts.map((d) => ({
        id: d.id,
        discountType: d.discountType,
        discountMode: d.discountMode,
        value: Number(d.value),
        amount: Number(d.amount),
        reason: d.reason,
        approvedByName: null,
        createdAt: d.createdAt.toISOString(),
      })),
      refunds: sf.refunds.map((r) => ({
        id: r.id,
        studentFeeId: r.studentFeeId,
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status,
        requestedByName: '',
        approvedByName: null,
        processedAt: r.processedAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async getStudentFeesByStudentId(tenantId: string, studentId: string) {
    const fees = await this.prisma.studentFee.findMany({
      where: { tenantId, studentId, deletedAt: null },
      include: {
        feeStructure: { select: { name: true } },
        installments: { orderBy: { installmentNo: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return fees.map((sf) => ({
      id: sf.id,
      feePlanName: sf.feeStructure?.name || '',
      academicYear: sf.academicYear,
      totalAmount: Number(sf.totalAmount),
      discountAmount: Number(sf.discountAmount),
      netAmount: Number(sf.netAmount),
      paidAmount: Number(sf.paidAmount),
      outstandingAmount: Number(sf.netAmount) - Number(sf.paidAmount),
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
    }));
  }

  private generateInstallments(feePlan: any, studentFeeId: string, academicYear: string) {
    const totalFee = Number(feePlan.totalFee);
    const installments: any[] = [];
    const yearStart = parseInt(academicYear.split('-')[0], 10);

    switch (feePlan.installmentType) {
      case 'ONE_TIME':
        installments.push({
          studentFeeId,
          installmentNo: 1,
          label: `Full Payment - ${academicYear}`,
          amount: totalFee,
          dueDate: new Date(yearStart, 3, feePlan.dueDay || 15), // April
        });
        break;

      case 'MONTHLY': {
        const monthlyAmount = Math.floor((totalFee / 12) * 100) / 100;
        const lastMonthAmount = totalFee - monthlyAmount * 11;
        const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

        for (let i = 0; i < 12; i++) {
          const monthIdx = (3 + i) % 12; // Start from April
          const year = monthIdx < 3 ? yearStart + 1 : yearStart;
          installments.push({
            studentFeeId,
            installmentNo: i + 1,
            label: `${monthNames[i]} ${year}`,
            amount: i === 11 ? lastMonthAmount : monthlyAmount,
            dueDate: new Date(year, monthIdx, feePlan.dueDay || 5),
          });
        }
        break;
      }

      case 'QUARTERLY': {
        const quarterlyAmount = Math.floor((totalFee / 4) * 100) / 100;
        const lastQuarterAmount = totalFee - quarterlyAmount * 3;
        const quarters = [
          { label: 'Q1 (Apr-Jun)', month: 3, year: yearStart },
          { label: 'Q2 (Jul-Sep)', month: 6, year: yearStart },
          { label: 'Q3 (Oct-Dec)', month: 9, year: yearStart },
          { label: 'Q4 (Jan-Mar)', month: 0, year: yearStart + 1 },
        ];

        quarters.forEach((q, i) => {
          installments.push({
            studentFeeId,
            installmentNo: i + 1,
            label: `${q.label} ${q.year}`,
            amount: i === 3 ? lastQuarterAmount : quarterlyAmount,
            dueDate: new Date(q.year, q.month, feePlan.dueDay || 5),
          });
        });
        break;
      }

      case 'CUSTOM':
        // Custom installments would be created separately via fee plan configuration
        // For now, create a single installment
        installments.push({
          studentFeeId,
          installmentNo: 1,
          label: `Payment - ${academicYear}`,
          amount: totalFee,
          dueDate: new Date(yearStart, 3, feePlan.dueDay || 15),
        });
        break;
    }

    return installments;
  }

  private formatStudentFee(sf: any) {
    const student = sf.student;
    const batchName = student?.batchEnrollments?.[0]?.batch?.name || '';

    return {
      id: sf.id,
      studentId: sf.studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      rollNumber: student?.rollNumber || '',
      batchName,
      feePlanName: sf.feeStructure?.name || '',
      academicYear: sf.academicYear,
      totalAmount: Number(sf.totalAmount),
      discountAmount: Number(sf.discountAmount),
      netAmount: Number(sf.netAmount),
      paidAmount: Number(sf.paidAmount),
      outstandingAmount: Number(sf.netAmount) - Number(sf.paidAmount),
      status: sf.status,
      assignedAt: sf.assignedAt.toISOString(),
    };
  }
}
