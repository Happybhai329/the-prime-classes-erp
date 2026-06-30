import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateFollowUpDto, UpdateFollowUpDto, QueryFollowUpDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryFollowUpDto) {
    const where: Prisma.FollowUpWhereInput = {
      tenantId,
      ...(query.enquiryId && { enquiryId: query.enquiryId }),
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.date && { date: new Date(query.date) }),
    };

    const [followups, total] = await Promise.all([
      this.prisma.followUp.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { date: 'desc' },
        include: {
          enquiry: { select: { studentName: true, mobile: true, enquiryNumber: true } },
          executive: { select: { id: true, email: true } },
        },
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return {
      data: followups,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const followup = await this.prisma.followUp.findFirst({
      where: { id, tenantId },
      include: {
        enquiry: true,
        executive: true,
      },
    });

    if (!followup) {
      throw new NotFoundException('Follow-up not found');
    }

    return followup;
  }

  async create(tenantId: string, dto: CreateFollowUpDto, userId?: string) {
    // Check if enquiry exists
    const enquiry = await this.prisma.enquiry.findFirst({
      where: { id: dto.enquiryId, tenantId },
    });
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    const followup = await this.prisma.followUp.create({
      data: {
        tenantId,
        enquiryId: dto.enquiryId,
        date: new Date(dto.date),
        nextFollowUp: dto.nextFollowUp ? new Date(dto.nextFollowUp) : null,
        type: dto.type,
        remarks: dto.remarks,
        status: dto.status || 'PENDING',
        executiveId: dto.executiveId || userId,
      },
    });

    // Automatically update Enquiry status to "CONTACTED" or "FOLLOW_UP" if status is completed
    if (enquiry.status === 'NEW') {
      await this.prisma.enquiry.update({
        where: { id: dto.enquiryId },
        data: { status: 'CONTACTED' },
      });
    }

    return followup;
  }

  async update(tenantId: string, id: string, dto: UpdateFollowUpDto) {
    await this.findOne(tenantId, id);

    return this.prisma.followUp.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        nextFollowUp: dto.nextFollowUp ? new Date(dto.nextFollowUp) : undefined,
        type: dto.type,
        remarks: dto.remarks,
        status: dto.status,
        executiveId: dto.executiveId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.followUp.delete({
      where: { id },
    });
  }

  async getTimeline(tenantId: string, enquiryId: string) {
    return this.prisma.followUp.findMany({
      where: {
        tenantId,
        enquiryId,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        executive: { select: { email: true } },
      },
    });
  }

  async getDashboardFollowUps(tenantId: string, executiveId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const baseWhere: Prisma.FollowUpWhereInput = {
      tenantId,
      ...(executiveId && { executiveId }),
    };

    const [todayFollowups, upcomingFollowups, missedFollowups] = await Promise.all([
      // Today's FollowUps
      this.prisma.followUp.findMany({
        where: {
          ...baseWhere,
          status: 'PENDING',
          date: {
            gte: today,
            lte: endOfToday,
          },
        },
        include: { enquiry: { select: { studentName: true, mobile: true, enquiryNumber: true } } },
        orderBy: { date: 'asc' },
      }),
      // Upcoming FollowUps (date > endOfToday)
      this.prisma.followUp.findMany({
        where: {
          ...baseWhere,
          status: 'PENDING',
          date: {
            gt: endOfToday,
          },
        },
        include: { enquiry: { select: { studentName: true, mobile: true, enquiryNumber: true } } },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      // Missed FollowUps (date < today and pending)
      this.prisma.followUp.findMany({
        where: {
          ...baseWhere,
          status: 'PENDING',
          date: {
            lt: today,
          },
        },
        include: { enquiry: { select: { studentName: true, mobile: true, enquiryNumber: true } } },
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      today: todayFollowups,
      upcoming: upcomingFollowups,
      missed: missedFollowups,
    };
  }
}
