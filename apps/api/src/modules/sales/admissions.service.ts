import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma, UserRole, Gender, StudentStatus, ParentRelationship } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdmissionDto, UpdateAdmissionDto, QueryAdmissionDto, EnrollStudentDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

function parseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryAdmissionDto) {
    const where: Prisma.AdmissionWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(query.enquiryId && { enquiryId: query.enquiryId }),
      ...(query.search && {
        OR: [
          { admissionNumber: { contains: query.search, mode: 'insensitive' } },
          { enquiry: { studentName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [admissions, total] = await Promise.all([
      this.prisma.admission.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        include: {
          enquiry: {
            select: {
              studentName: true,
              mobile: true,
              email: true,
              class: true,
              fatherName: true,
              motherName: true,
              counsellor: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.admission.count({ where }),
    ]);

    return {
      data: admissions,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const admission = await this.prisma.admission.findFirst({
      where: { id, tenantId },
      include: {
        enquiry: {
          include: {
            counsellor: true,
          },
        },
        academicStudent: true,
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission record not found');
    }

    return admission;
  }

  async create(tenantId: string, dto: CreateAdmissionDto, userId?: string) {
    // Check if enquiry exists
    const enquiry = await this.prisma.enquiry.findFirst({
      where: { id: dto.enquiryId, tenantId },
    });
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    // Check if already converted
    const existing = await this.prisma.admission.findFirst({
      where: { enquiryId: dto.enquiryId, tenantId },
    });
    if (existing) {
      throw new ConflictException('An admission record already exists for this enquiry');
    }

    const currentYear = new Date().getFullYear();
    const count = await this.prisma.admission.count({ where: { tenantId } });
    const admissionNumber = `ADM-${currentYear}-${(count + 1).toString().padStart(5, '0')}`;

    const admission = await this.prisma.admission.create({
      data: {
        tenantId,
        admissionNumber,
        enquiryId: dto.enquiryId,
        studentPhoto: dto.studentPhoto,
        documents: dto.documents || {},
        admissionDate: new Date(dto.admissionDate),
        program: dto.program || enquiry.targetExam,
        course: dto.course || enquiry.class,
        feeStructure: dto.feeStructure || {},
        discount: dto.discount ? new Prisma.Decimal(dto.discount) : 0,
        registrationFee: dto.registrationFee ? new Prisma.Decimal(dto.registrationFee) : 0,
        scholarship: dto.scholarship ? new Prisma.Decimal(dto.scholarship) : 0,
        status: dto.status || 'PENDING',
        paymentStatus: dto.paymentStatus || 'PENDING',
        createdBy: userId,
      },
    });

    // Update enquiry status to "ADMISSION_CONFIRMED" or "ADMISSION_PENDING"
    await this.prisma.enquiry.update({
      where: { id: dto.enquiryId },
      data: { status: 'ADMISSION_PENDING' },
    });

    return admission;
  }

  async convertFromEnquiry(tenantId: string, enquiryId: string, userId?: string) {
    const enquiry = await this.prisma.enquiry.findFirst({
      where: { id: enquiryId, tenantId },
    });
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    // Check if already converted
    const existing = await this.prisma.admission.findFirst({
      where: { enquiryId, tenantId },
    });
    if (existing) {
      return existing; // idempotency
    }

    return this.create(tenantId, {
      enquiryId,
      admissionDate: new Date().toISOString().split('T')[0],
      program: enquiry.targetExam || undefined,
      course: enquiry.class || undefined,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    }, userId);
  }

  async update(tenantId: string, id: string, dto: UpdateAdmissionDto) {
    await this.findOne(tenantId, id);

    return this.prisma.admission.update({
      where: { id },
      data: {
        studentPhoto: dto.studentPhoto,
        documents: dto.documents || undefined,
        admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : undefined,
        program: dto.program,
        course: dto.course,
        feeStructure: dto.feeStructure || undefined,
        discount: dto.discount !== undefined ? new Prisma.Decimal(dto.discount) : undefined,
        registrationFee: dto.registrationFee !== undefined ? new Prisma.Decimal(dto.registrationFee) : undefined,
        scholarship: dto.scholarship !== undefined ? new Prisma.Decimal(dto.scholarship) : undefined,
        status: dto.status,
        paymentStatus: dto.paymentStatus,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.admission.delete({
      where: { id },
    });
  }

  async enrollIntoAcademic(tenantId: string, id: string, dto: EnrollStudentDto, createdById?: string) {
    const admission = await this.prisma.admission.findFirst({
      where: { id, tenantId },
      include: { enquiry: true },
    });

    if (!admission) {
      throw new NotFoundException('Admission record not found');
    }

    if (admission.convertedToAcademic) {
      throw new ConflictException('This admission is already enrolled into Academic module');
    }

    // Validate email
    const email = admission.enquiry.email || `s.${admission.enquiry.studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now()}@student.primeclasses.in`;
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email },
    });
    if (existingUser) {
      throw new ConflictException(`A user with email ${email} already exists`);
    }

    // Fetch fee structure if provided
    let feeStructure = null;
    if (dto.feeStructureId) {
      feeStructure = await this.prisma.feeStructure.findFirst({
        where: { id: dto.feeStructureId, tenantId },
      });
      if (!feeStructure) {
        throw new NotFoundException('Fee Structure not found');
      }
    }

    // Verify batch exists
    const batch = await this.prisma.batch.findFirst({
      where: { id: dto.batchId, tenantId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const { firstName, lastName } = parseName(admission.enquiry.studentName);
    const passwordHash = await bcrypt.hash('Prime@2025', 12);
    const parentPasswordHash = await bcrypt.hash('Parent@2025', 12);

    const parentEmail = `p.${admission.enquiry.studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now()}@parent.primeclasses.in`;

    const enrolledStudent = await this.prisma.$transaction(async (tx) => {
      // 1. Create Student User Account
      const studentUser = await tx.user.create({
        data: {
          tenantId,
          email,
          phone: admission.enquiry.mobile,
          passwordHash,
          role: UserRole.STUDENT,
        },
      });

      // 2. Create Student record
      const student = await tx.student.create({
        data: {
          userId: studentUser.id,
          tenantId,
          rollNumber: dto.rollNumber,
          firstName,
          lastName,
          dob: admission.enquiry.dob || new Date('2015-01-01'),
          gender: (admission.enquiry.gender as Gender) || Gender.MALE,
          schoolName: admission.enquiry.school || 'Integrated Sales CRM',
          classStudying: admission.enquiry.class || 'Class 5',
          address: {
            street: admission.enquiry.address || '',
            city: admission.enquiry.city || '',
            state: admission.enquiry.state || '',
            pincode: admission.enquiry.pincode || '',
          },
          admissionDate: admission.admissionDate,
          status: StudentStatus.ACTIVE,
          section: dto.section,
          photoUrl: admission.studentPhoto,
          documents: admission.documents || {},
        },
      });

      // 3. Create Parent User Account
      const parentUser = await tx.user.create({
        data: {
          tenantId,
          email: parentEmail,
          phone: admission.enquiry.mobile,
          passwordHash: parentPasswordHash,
          role: UserRole.PARENT,
        },
      });

      // 4. Create Parent record
      const parent = await tx.parent.create({
        data: {
          userId: parentUser.id,
          tenantId,
          fatherName: admission.enquiry.fatherName || `Father of ${admission.enquiry.studentName}`,
          motherName: admission.enquiry.motherName || `Mother of ${admission.enquiry.studentName}`,
          fatherPhone: admission.enquiry.mobile,
          motherPhone: admission.enquiry.alternateMobile || '',
          address: {
            street: admission.enquiry.address || '',
            city: admission.enquiry.city || '',
            state: admission.enquiry.state || '',
            pincode: admission.enquiry.pincode || '',
          },
        },
      });

      // 5. Link Student to Parent
      await tx.studentParentMap.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          relationship: ParentRelationship.FATHER,
          isPrimary: true,
        },
      });

      // 6. Enroll in Batch
      await tx.batchStudent.create({
        data: {
          batchId: dto.batchId,
          studentId: student.id,
          status: 'ACTIVE',
        },
      });

      // 7. Assign Fee Structure if provided
      if (feeStructure) {
        const netAmount = new Prisma.Decimal(feeStructure.totalFee)
          .minus(admission.discount || 0)
          .minus(admission.scholarship || 0);

        await tx.studentFee.create({
          data: {
            tenantId,
            studentId: student.id,
            feeStructureId: feeStructure.id,
            academicYear: admission.enquiry.academicYear || feeStructure.academicYear || '2026-27',
            totalAmount: feeStructure.totalFee,
            discountAmount: new Prisma.Decimal(admission.discount || 0).plus(admission.scholarship || 0),
            netAmount: netAmount,
            paidAmount: admission.registrationFee || 0,
            status: 'PENDING',
          },
        });
      }

      // 8. Update Admission record
      await tx.admission.update({
        where: { id },
        data: {
          convertedToAcademic: true,
          academicStudentId: student.id,
          status: 'CONVERTED',
          paymentStatus: 'PAID',
        },
      });

      // 9. Update Enquiry status
      await tx.enquiry.update({
        where: { id: admission.enquiryId },
        data: { status: 'CONVERTED' },
      });

      return student;
    });

    return enrolledStudent;
  }
}
