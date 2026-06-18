import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EventType, PaymentStatus } from '@prime/shared-types';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(tenantId: string, data: any) {
    return this.prisma.event.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location || null,
        maxRegistrations: data.maxRegistrations || null,
        registrationFee: new Prisma.Decimal(data.registrationFee || 0),
        admitCardTemplate: data.admitCardTemplate || null,
      },
    });
  }

  async findAllEvents(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      type?: EventType;
      search?: string;
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      tenantId,
      ...(query.type && { type: query.type }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { location: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findEventById(tenantId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: {
        registrations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // --- Registration & Attendance ---

  async registerForEvent(tenantId: string, eventId: string, data: any) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, tenantId },
      include: { registrations: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.maxRegistrations && event.registrations.length >= event.maxRegistrations) {
      throw new ConflictException('Event is fully registered');
    }

    // Check if phone or email registered already
    const existing = await this.prisma.eventRegistration.findFirst({
      where: { eventId, phone: data.phone },
    });
    if (existing) {
      throw new ConflictException('Already registered for this event with this phone number');
    }

    // Allocate seat & roll number for scholarship test
    let rollNumber: string | null = null;
    let seatNumber: string | null = null;

    if (event.type === EventType.SCHOLARSHIP_TEST) {
      const regCount = event.registrations.length;
      rollNumber = `SCH-TEST-${(regCount + 10001).toString()}`;
      seatNumber = `SEAT-${Math.floor(regCount / 40) + 1}-${(regCount % 40 + 1).toString().padStart(2, '0')}`;
    }

    // Create a lead if registration is public
    let leadId = data.leadId || null;
    if (!leadId) {
      // Find if lead exists or create new
      let lead = await this.prisma.lead.findFirst({
        where: { tenantId, phone: data.phone },
      });
      if (!lead) {
        lead = await this.prisma.lead.create({
          data: {
            tenantId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || null,
            phone: data.phone,
            source: 'WEBSITE_FORM',
            notes: `Auto-created lead from Event Registration: ${event.title}`,
          },
        });
      }
      leadId = lead.id;
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        leadId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        rollNumber,
        seatNumber,
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        paymentAmount: data.paymentAmount ? new Prisma.Decimal(data.paymentAmount) : null,
        paymentDetails: data.paymentDetails || {},
      },
    });
  }

  async markAttendance(tenantId: string, registrationId: string, status: boolean) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!reg || reg.event.tenantId !== tenantId) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { attendanceStatus: status },
    });
  }

  async submitFeedback(registrationId: string, data: { rating: number; feedback: string }) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!reg) {
      throw new NotFoundException('Registration record not found');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        rating: data.rating,
        feedback: data.feedback,
      },
    });
  }

  async recordExamScore(tenantId: string, registrationId: string, score: number) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!reg || reg.event.tenantId !== tenantId) {
      throw new NotFoundException('Registration record not found');
    }

    if (reg.event.type !== EventType.SCHOLARSHIP_TEST) {
      throw new ConflictException('Event is not a scholarship test');
    }

    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { scoreObtained: new Prisma.Decimal(score) },
    });
  }

  async getAdmitCardData(tenantId: string, rollNumber: string) {
    const reg = await this.prisma.eventRegistration.findFirst({
      where: { rollNumber, event: { tenantId } },
      include: { event: true },
    });

    if (!reg) {
      throw new NotFoundException('No matching admit card found for roll number');
    }

    return {
      rollNumber: reg.rollNumber,
      seatNumber: reg.seatNumber,
      studentName: `${reg.firstName} ${reg.lastName}`,
      email: reg.email,
      phone: reg.phone,
      eventTitle: reg.event.title,
      eventLocation: reg.event.location,
      startDate: reg.event.startDate,
      endDate: reg.event.endDate,
      template: reg.event.admitCardTemplate,
    };
  }
}
