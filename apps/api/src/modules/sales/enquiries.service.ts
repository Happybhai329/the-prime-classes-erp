import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto, QueryEnquiryDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryEnquiryDto) {
    const where: Prisma.EnquiryWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.source && { source: query.source }),
      ...(query.course && { class: query.course }), // Mapping "course" to Enquiry's class field
      ...(query.counsellorId && { assignedCounsellor: query.counsellorId }),
      ...(query.startDate && query.endDate && {
        createdAt: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        },
      }),
      ...(query.search && {
        OR: [
          { studentName: { contains: query.search, mode: 'insensitive' } },
          { mobile: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { enquiryNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [enquiries, total] = await Promise.all([
      this.prisma.enquiry.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        include: {
          counsellor: { select: { id: true, name: true } },
          createdByUser: { select: { id: true, email: true } },
        },
      }),
      this.prisma.enquiry.count({ where }),
    ]);

    return {
      data: enquiries,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const enquiry = await this.prisma.enquiry.findFirst({
      where: { id, tenantId },
      include: {
        counsellor: true,
        followUps: {
          orderBy: { date: 'desc' },
        },
        admissions: true,
      },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    return enquiry;
  }

  async create(tenantId: string, dto: CreateEnquiryDto, userId?: string) {
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.enquiry.count({ where: { tenantId } });
    const enquiryNumber = `ENQ-${currentYear}-${(count + 1).toString().padStart(5, '0')}`;

    return this.prisma.enquiry.create({
      data: {
        tenantId,
        enquiryNumber,
        studentName: dto.studentName,
        fatherName: dto.fatherName,
        motherName: dto.motherName,
        mobile: dto.mobile,
        alternateMobile: dto.alternateMobile,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        dob: dto.dob ? new Date(dto.dob) : null,
        gender: dto.gender,
        school: dto.school,
        class: dto.class,
        targetExam: dto.targetExam,
        academicYear: dto.academicYear,
        source: dto.source || 'MANUAL',
        campaign: dto.campaign,
        referencePerson: dto.referencePerson,
        status: dto.status || 'NEW',
        assignedCounsellor: dto.assignedCounsellor,
        remarks: dto.remarks,
        createdBy: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEnquiryDto) {
    await this.findOne(tenantId, id);

    return this.prisma.enquiry.update({
      where: { id },
      data: {
        studentName: dto.studentName,
        fatherName: dto.fatherName,
        motherName: dto.motherName,
        mobile: dto.mobile,
        alternateMobile: dto.alternateMobile,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        school: dto.school,
        class: dto.class,
        targetExam: dto.targetExam,
        academicYear: dto.academicYear,
        source: dto.source,
        campaign: dto.campaign,
        referencePerson: dto.referencePerson,
        status: dto.status,
        assignedCounsellor: dto.assignedCounsellor,
        remarks: dto.remarks,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.enquiry.delete({
      where: { id },
    });
  }

  async bulkDelete(tenantId: string, ids: string[]) {
    return this.prisma.enquiry.deleteMany({
      where: {
        tenantId,
        id: { in: ids },
      },
    });
  }

  async exportCsv(tenantId: string, query: QueryEnquiryDto): Promise<string> {
    const where: Prisma.EnquiryWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.source && { source: query.source }),
      ...(query.counsellorId && { assignedCounsellor: query.counsellorId }),
    };

    const enquiries = await this.prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        counsellor: { select: { name: true } },
      },
    });

    const headers = [
      'Enquiry Number',
      'Student Name',
      'Father Name',
      'Mother Name',
      'Mobile',
      'Email',
      'Class',
      'Target Exam',
      'Academic Year',
      'Source',
      'Status',
      'Assigned Counsellor',
      'Created At',
    ];

    const rows = enquiries.map((e) => [
      e.enquiryNumber,
      `"${e.studentName}"`,
      `"${e.fatherName || ''}"`,
      `"${e.motherName || ''}"`,
      e.mobile,
      e.email || '',
      e.class || '',
      e.targetExam || '',
      e.academicYear || '',
      e.source || '',
      e.status,
      e.counsellor ? `"${e.counsellor.name}"` : '',
      e.createdAt.toISOString().split('T')[0],
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async importCsv(tenantId: string, csvContent: string, userId?: string) {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new BadRequestException('Empty or invalid CSV file');
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    
    // Simple helper to find column index
    const getIndex = (name: string) => headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());

    const nameIdx = getIndex('Student Name');
    const mobileIdx = getIndex('Mobile');
    if (nameIdx === -1 || mobileIdx === -1) {
      throw new BadRequestException('CSV must contain Student Name and Mobile columns');
    }

    const fatherIdx = getIndex('Father Name');
    const motherIdx = getIndex('Mother Name');
    const emailIdx = getIndex('Email');
    const classIdx = getIndex('Class');
    const examIdx = getIndex('Target Exam');
    const yearIdx = getIndex('Academic Year');
    const sourceIdx = getIndex('Source');

    const createdEnquiries = [];
    const currentYear = new Date().getFullYear();
    let count = await this.prisma.enquiry.count({ where: { tenantId } });

    for (let i = 1; i < lines.length; i++) {
      // Split by comma but handle values enclosed in quotes
      const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^"|"$/g, ''));
      if (row.length <= Math.max(nameIdx, mobileIdx)) continue;

      const studentName = row[nameIdx];
      const mobile = row[mobileIdx];
      if (!studentName || !mobile) continue;

      const enquiryNumber = `ENQ-${currentYear}-${(count + 1).toString().padStart(5, '0')}`;
      count++;

      const enquiry = await this.prisma.enquiry.create({
        data: {
          tenantId,
          enquiryNumber,
          studentName,
          mobile,
          fatherName: fatherIdx !== -1 ? row[fatherIdx] : null,
          motherName: motherIdx !== -1 ? row[motherIdx] : null,
          email: emailIdx !== -1 ? row[emailIdx] : null,
          class: classIdx !== -1 ? row[classIdx] : null,
          targetExam: examIdx !== -1 ? row[examIdx] : null,
          academicYear: yearIdx !== -1 ? row[yearIdx] : null,
          source: sourceIdx !== -1 ? row[sourceIdx] : 'IMPORT',
          status: 'NEW',
          createdBy: userId,
        },
      });
      createdEnquiries.push(enquiry);
    }

    return { importedCount: createdEnquiries.length };
  }
}
