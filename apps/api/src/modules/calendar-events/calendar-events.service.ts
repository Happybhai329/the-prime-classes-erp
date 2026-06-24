import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCalendarEventDto, QueryCalendarEventDto, UpdateCalendarEventDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class CalendarEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description || null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        eventType: dto.eventType,
        batchId: dto.batchId || null,
      },
    });
  }

  async findAll(tenantId: string, query: QueryCalendarEventDto) {
    const where: Prisma.CalendarEventWhereInput = {
      tenantId,
      ...(query.eventType && { eventType: query.eventType }),
      ...(query.batchId && { batchId: query.batchId }),
    };

    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.endDate = { lte: new Date(query.endDate) };
    }

    const [events, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        include: {
          batch: { select: { id: true, name: true } },
        },
        orderBy: { startDate: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return {
      data: events,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, tenantId },
      include: {
        batch: { select: { id: true, name: true } },
      },
    });

    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async update(tenantId: string, id: string, dto: UpdateCalendarEventDto) {
    await this.findOne(tenantId, id);

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        description: dto.description !== undefined ? dto.description : undefined,
        startDate: dto.startDate !== undefined ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? new Date(dto.endDate) : undefined,
        eventType: dto.eventType !== undefined ? dto.eventType : undefined,
        batchId: dto.batchId !== undefined ? (dto.batchId || null) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { success: true };
  }
}
