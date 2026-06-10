import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from './dto';
import { buildPaginationMeta, generateRollNumber } from '../../common/utils/helpers';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginated student list with search and filters.
   * Scoped to tenant. Excludes soft-deleted records.
   */
  async findAll(tenantId: string, query: QueryStudentDto) {
    const where: Prisma.StudentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.targetExam && {
        targetExam: { has: query.targetExam },
      }),
      ...(query.batchId && {
        batchEnrollments: {
          some: {
            batchId: query.batchId,
            status: 'ACTIVE',
          },
        },
      }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { rollNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const allowedSortFields = ['createdAt', 'firstName', 'lastName', 'rollNumber', 'admissionDate'];
    const sortBy = allowedSortFields.includes(query.sortBy || '')
      ? query.sortBy!
      : 'createdAt';

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [sortBy]: query.sortOrder || 'desc' },
        include: {
          user: {
            select: { email: true, phone: true, isActive: true, lastLogin: true },
          },
          batchEnrollments: {
            where: { status: 'ACTIVE' },
            include: {
              batch: { select: { id: true, name: true, code: true, targetExam: true } },
            },
          },
          parentMappings: {
            include: {
              parent: {
                select: { id: true, fatherName: true, fatherPhone: true },
              },
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  /**
   * Single student detail with all relations.
   */
  async findOne(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        user: {
          select: { email: true, phone: true, isActive: true, lastLogin: true },
        },
        batchEnrollments: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                code: true,
                targetExam: true,
                academicYear: true,
                isActive: true,
              },
            },
          },
        },
        parentMappings: {
          include: {
            parent: {
              select: {
                id: true,
                fatherName: true,
                motherName: true,
                fatherPhone: true,
                motherPhone: true,
                fatherOccupation: true,
                motherOccupation: true,
                emergencyContact: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  /**
   * Create student with auto-generated roll number and linked User account.
   * Optionally links to a batch and creates/links a parent.
   */
  async create(tenantId: string, dto: CreateStudentDto) {
    // Generate roll number
    const currentYear = new Date().getFullYear();
    const studentCount = await this.prisma.student.count({
      where: { tenantId },
    });
    const rollNumber = generateRollNumber('PRM', currentYear, studentCount + 1);

    // Check roll number uniqueness
    const existing = await this.prisma.student.findUnique({
      where: { tenantId_rollNumber: { tenantId, rollNumber } },
    });
    if (existing) {
      throw new ConflictException(`Roll number ${rollNumber} already exists`);
    }

    // Create user account for student
    const email = `${dto.firstName.toLowerCase()}.${dto.lastName.toLowerCase()}.${Date.now()}@student.primeclasses.in`;
    const defaultPassword = await bcrypt.hash('Prime@123', 12);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          tenantId,
          email,
          phone: dto.parentPhone || null,
          passwordHash: defaultPassword,
          role: 'STUDENT',
        },
      });

      // 2. Create Student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          tenantId,
          rollNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dob: new Date(dto.dob),
          gender: dto.gender,
          schoolName: dto.schoolName,
          classStudying: dto.classStudying,
          address: dto.address as unknown as Prisma.InputJsonValue,
          admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
          targetExam: dto.targetExam,
          aadharNumber: dto.aadharNumber || null,
        },
        include: {
          user: {
            select: { email: true, phone: true, isActive: true },
          },
        },
      });

      // 3. Enroll in batch if specified
      if (dto.batchId) {
        const batch = await tx.batch.findFirst({
          where: { id: dto.batchId, tenantId, isActive: true },
        });
        if (batch) {
          await tx.batchStudent.create({
            data: {
              batchId: dto.batchId,
              studentId: student.id,
            },
          });
        }
      }

      // 4. Link parent if specified
      if (dto.parentPhone && dto.parentName) {
        let parentUser = await tx.user.findFirst({
          where: { tenantId, phone: dto.parentPhone, role: 'PARENT', deletedAt: null },
        });

        if (!parentUser) {
          const parentEmail = `${dto.parentName.replace(/\s+/g, '.').toLowerCase()}.${Date.now()}@parent.primeclasses.in`;
          parentUser = await tx.user.create({
            data: {
              tenantId,
              email: parentEmail,
              phone: dto.parentPhone,
              passwordHash: defaultPassword,
              role: 'PARENT',
            },
          });

          await tx.parent.create({
            data: {
              userId: parentUser.id,
              tenantId,
              fatherName: dto.parentName,
              fatherPhone: dto.parentPhone,
            },
          });
        }

        const parent = await tx.parent.findUnique({
          where: { userId: parentUser.id },
        });

        if (parent) {
          await tx.studentParentMap.create({
            data: {
              studentId: student.id,
              parentId: parent.id,
              relationship: 'FATHER',
              isPrimary: true,
            },
          });
        }
      }

      this.logger.log(`Student created: ${student.firstName} ${student.lastName} (${rollNumber})`);
      return student;
    });
  }

  /**
   * Update student details. Does not modify the linked User account.
   */
  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const updateData: Prisma.StudentUpdateInput = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.dob !== undefined) updateData.dob = new Date(dto.dob);
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.schoolName !== undefined) updateData.schoolName = dto.schoolName;
    if (dto.classStudying !== undefined) updateData.classStudying = dto.classStudying;
    if (dto.address !== undefined) updateData.address = dto.address as unknown as Prisma.InputJsonValue;
    if (dto.targetExam !== undefined) updateData.targetExam = dto.targetExam;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.aadharNumber !== undefined) updateData.aadharNumber = dto.aadharNumber;

    return this.prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true, phone: true, isActive: true },
        },
      },
    });
  }

  /**
   * Soft-delete a student and deactivate their user account.
   */
  async remove(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.$transaction([
      this.prisma.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: student.userId },
        data: { isActive: false, deletedAt: new Date() },
      }),
    ]);

    this.logger.log(`Student soft-deleted: ${id}`);
    return { message: 'Student deleted successfully' };
  }

  /**
   * Attendance summary for a student.
   */
  async getAttendanceSummary(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');

    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
      select: { status: true },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const leave = records.filter((r) => r.status === 'LEAVE').length;

    return {
      totalDays: total,
      present,
      absent,
      late,
      leave,
      percentage: total > 0 ? Math.round((present / total) * 10000) / 100 : 0,
    };
  }

  /**
   * Test performance summary for a student.
   */
  async getTestSummary(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');

    const marks = await this.prisma.testMarks.findMany({
      where: { studentId },
      include: {
        test: {
          select: { name: true, testType: true, testDate: true, totalMarks: true, status: true },
        },
      },
      orderBy: { test: { testDate: 'desc' } },
      take: 20,
    });

    const rankings = await this.prisma.testRanking.findMany({
      where: { studentId },
      orderBy: { computedAt: 'desc' },
      take: 20,
    });

    const rankingsMap = new Map(rankings.map((r) => [r.testId, r]));

    return marks.map((m) => {
      const ranking = rankingsMap.get(m.testId);
      return {
        testId: m.testId,
        testName: m.test.name,
        testType: m.test.testType,
        testDate: m.test.testDate,
        totalMarks: m.test.totalMarks,
        marksObtained: m.marksObtained,
        isAbsent: m.isAbsent,
        percentage: Number(m.test.totalMarks) > 0
          ? Math.round((Number(m.marksObtained) / Number(m.test.totalMarks)) * 10000) / 100
          : 0,
        batchRank: ranking?.batchRank || null,
        grade: ranking?.grade || null,
      };
    });
  }

  /**
   * Fee summary for a student.
   */
  async getFeeSummary(tenantId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');

    const invoices = await this.prisma.feeInvoice.findMany({
      where: { studentId },
      include: {
        feeStructure: { select: { name: true, feeType: true } },
        payments: {
          select: { amountPaid: true, paymentDate: true, paymentMode: true },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    const totalDue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalPaid = invoices.reduce(
      (sum, inv) => sum + inv.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
      0,
    );

    return {
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        feeName: inv.feeStructure.name,
        feeType: inv.feeStructure.feeType,
        amount: Number(inv.amount),
        dueDate: inv.dueDate,
        status: inv.status,
        paidAmount: inv.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
      })),
    };
  }

  /**
   * Export students as CSV-formatted string.
   */
  async exportCsv(tenantId: string, query: QueryStudentDto): Promise<string> {
    const where: Prisma.StudentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.targetExam && { targetExam: { has: query.targetExam } }),
    };

    const students = await this.prisma.student.findMany({
      where,
      orderBy: { rollNumber: 'asc' },
      include: {
        user: { select: { email: true, phone: true } },
        batchEnrollments: {
          where: { status: 'ACTIVE' },
          include: { batch: { select: { name: true } } },
        },
      },
    });

    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'DOB',
      'Gender',
      'School',
      'Class',
      'Target Exams',
      'Status',
      'Admission Date',
      'Email',
      'Phone',
      'Batches',
    ];

    const rows = students.map((s) => [
      s.rollNumber,
      s.firstName,
      s.lastName,
      s.dob.toISOString().split('T')[0],
      s.gender,
      `"${s.schoolName}"`,
      s.classStudying,
      s.targetExam.join('; '),
      s.status,
      s.admissionDate.toISOString().split('T')[0],
      s.user.email,
      s.user.phone || '',
      s.batchEnrollments.map((be) => be.batch.name).join('; '),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
