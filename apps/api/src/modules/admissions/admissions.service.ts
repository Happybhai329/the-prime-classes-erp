import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { ApplicationStatus, DocumentVerificationStatus, PaymentStatus, UserRole, Gender, StudentStatus } from '@prime/shared-types';
import { buildPaginationMeta, generateRollNumber } from '../../common/utils/helpers';

@Injectable()
export class AdmissionsService {
  private readonly logger = new Logger(AdmissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: Apply online - starts a draft or submitted application.
   */
  async submitApplication(tenantId: string, data: any) {
    // Check if duplicate submission
    const existing = await this.prisma.admissionApplication.findFirst({
      where: { tenantId, phone: data.phone, email: data.email, status: { not: ApplicationStatus.REJECTED } },
    });
    if (existing) {
      throw new ConflictException('An active application already exists for this email/phone');
    }

    const currentYear = new Date().getFullYear();
    const appCount = await this.prisma.admissionApplication.count({ where: { tenantId } });
    const appNumber = `APP-${currentYear}-${(appCount + 1).toString().padStart(5, '0')}`;

    return this.prisma.admissionApplication.create({
      data: {
        tenantId,
        applicationNumber: appNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: new Date(data.dob),
        gender: data.gender,
        classApplyingFor: data.classApplyingFor,
        status: data.status || ApplicationStatus.SUBMITTED,
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        paymentAmount: data.paymentAmount ? new Prisma.Decimal(data.paymentAmount) : null,
        paymentDetails: data.paymentDetails || {},
      },
    });
  }

  /**
   * Retrieve list of applications (paginated, searched, filtered).
   */
  async findAllApplications(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ApplicationStatus;
      classApplyingFor?: string;
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionApplicationWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.classApplyingFor && { classApplyingFor: query.classApplyingFor }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { applicationNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [apps, total] = await Promise.all([
      this.prisma.admissionApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionApplication.count({ where }),
    ]);

    return {
      data: apps,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get application by ID, with related uploaded documents.
   */
  async findApplicationById(tenantId: string, id: string) {
    const app = await this.prisma.admissionApplication.findFirst({
      where: { id, tenantId },
      include: {
        documentVerifications: true,
      },
    });

    if (!app) {
      throw new NotFoundException('Admission application not found');
    }

    return app;
  }

  /**
   * Track application status publicly by app number & phone.
   */
  async trackApplication(tenantId: string, appNumber: string, phone: string) {
    const app = await this.prisma.admissionApplication.findFirst({
      where: { tenantId, applicationNumber: appNumber, phone },
      include: {
        documentVerifications: {
          select: { documentType: true, status: true, rejectionReason: true },
        },
      },
    });

    if (!app) {
      throw new NotFoundException('No matching application found');
    }

    return app;
  }

  /**
   * Update application status (Admin/Counselor).
   */
  async updateApplicationStatus(tenantId: string, id: string, status: ApplicationStatus, currentUserId?: string) {
    const app = await this.prisma.admissionApplication.findFirst({
      where: { id, tenantId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (status === ApplicationStatus.ENROLLED) {
      return this.enrollStudent(tenantId, id);
    }

    return this.prisma.admissionApplication.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Update payment status of registration fee.
   */
  async updatePaymentStatus(tenantId: string, id: string, data: { status: PaymentStatus; amount: number; details?: any }) {
    const app = await this.prisma.admissionApplication.findFirst({
      where: { id, tenantId },
    });

    if (!app) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.admissionApplication.update({
      where: { id },
      data: {
        paymentStatus: data.status,
        paymentAmount: new Prisma.Decimal(data.amount),
        paymentDetails: data.details || {},
      },
    });
  }

  /**
   * Upload & request document verification for application.
   */
  async uploadDocument(id: string, documentType: string, documentUrl: string) {
    const existing = await this.prisma.documentVerification.findFirst({
      where: { applicationId: id, documentType },
    });

    if (existing) {
      return this.prisma.documentVerification.update({
        where: { id: existing.id },
        data: {
          documentUrl,
          status: DocumentVerificationStatus.PENDING,
          rejectionReason: null,
          verifiedAt: null,
          verifiedById: null,
        },
      });
    }

    return this.prisma.documentVerification.create({
      data: {
        applicationId: id,
        documentType,
        documentUrl,
        status: DocumentVerificationStatus.PENDING,
      },
    });
  }

  /**
   * Review/Verify a document.
   */
  async verifyDocument(
    tenantId: string,
    documentId: string,
    status: DocumentVerificationStatus,
    rejectionReason?: string,
    currentUserId?: string,
  ) {
    const doc = await this.prisma.documentVerification.findUnique({
      where: { id: documentId },
      include: { application: true },
    });

    if (!doc || doc.application.tenantId !== tenantId) {
      throw new NotFoundException('Document record not found');
    }

    return this.prisma.documentVerification.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === DocumentVerificationStatus.REJECTED ? rejectionReason : null,
        verifiedById: currentUserId,
        verifiedAt: status === DocumentVerificationStatus.VERIFIED ? new Date() : null,
      },
    });
  }

  /**
   * Auto-enroll approved application into Core Student / User database.
   */
  private async enrollStudent(tenantId: string, applicationId: string) {
    const app = await this.prisma.admissionApplication.findUnique({
      where: { id: applicationId },
      include: { documentVerifications: true },
    });

    if (!app || app.tenantId !== tenantId) {
      throw new NotFoundException('Application not found');
    }

    if (app.status === ApplicationStatus.ENROLLED) {
      throw new ConflictException('Application is already enrolled as student');
    }

    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: app.email },
    });
    if (existingUser) {
      throw new ConflictException(`User with email ${app.email} already exists`);
    }

    // 2. Hash a default password
    const passwordHash = await bcrypt.hash('Prime@123', 12);

    // 3. Auto-generate roll number
    const currentYear = new Date().getFullYear();
    const studentCount = await this.prisma.student.count({ where: { tenantId } });
    const rollNumber = generateRollNumber('PRM', currentYear, studentCount + 1);

    return this.prisma.$transaction(async (tx) => {
      // Create Student User Account
      const user = await tx.user.create({
        data: {
          tenantId,
          email: app.email,
          phone: app.phone,
          passwordHash,
          role: UserRole.STUDENT,
        },
      });

      // Construct document verification mapping to core documents JSON structure
      const documentMap: Record<string, string> = {};
      app.documentVerifications.forEach((doc) => {
        if (doc.status === DocumentVerificationStatus.VERIFIED) {
          documentMap[doc.documentType.toLowerCase()] = doc.documentUrl;
        }
      });

      const photoUrl = documentMap['photo'] || null;

      // Create core Student record
      const student = await tx.student.create({
        data: {
          userId: user.id,
          tenantId,
          rollNumber,
          firstName: app.firstName,
          lastName: app.lastName,
          dob: app.dob,
          gender: app.gender as Gender,
          schoolName: 'Public Admission Portal',
          classStudying: app.classApplyingFor,
          address: {},
          admissionDate: new Date(),
          status: StudentStatus.ACTIVE,
          photoUrl,
          documents: documentMap,
        },
      });

      // Map Parent if data exists inside payment/meta info, or register dummy father link
      const defaultPassword = await bcrypt.hash('Parent@123', 12);
      const parentEmail = `p.${app.firstName.toLowerCase()}.${Date.now()}@parent.primeclasses.in`;
      
      const parentUser = await tx.user.create({
        data: {
          tenantId,
          email: parentEmail,
          phone: app.phone,
          passwordHash: defaultPassword,
          role: UserRole.PARENT,
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: parentUser.id,
          tenantId,
          fatherName: `Parent of ${app.firstName}`,
          fatherPhone: app.phone,
        },
      });

      await tx.studentParentMap.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          relationship: 'GUARDIAN',
          isPrimary: true,
        },
      });

      // Mark application as enrolled
      await tx.admissionApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.ENROLLED,
          studentId: student.id,
        },
      });

      // Update linked Lead status (if exists)
      if (app.leadId) {
        await tx.lead.update({
          where: { id: app.leadId },
          data: { status: 'ADMISSION_CONFIRMED' },
        });
      }

      this.logger.log(`Student enrolled: ${student.firstName} ${student.lastName} (Roll: ${rollNumber})`);
      return student;
    });
  }
}
