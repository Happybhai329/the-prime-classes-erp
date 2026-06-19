import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TicketStatus, UserRole } from '@prime/shared-types';
import { CreateTicketDto, ReplyTicketDto, QueryTicketsDto } from './dto/tickets.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        tenantId,
        subject: dto.subject,
        category: dto.category,
        createdBy: userId,
      },
    });

    // Create the initial message
    await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        content: dto.message,
      },
    });

    return this.findOne(tenantId, ticket.id, userId);
  }

  async findMyTickets(tenantId: string, userId: string, query: QueryTicketsDto) {
    const where: any = {
      tenantId,
      createdBy: userId,
    };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.subject = { contains: query.search, mode: 'insensitive' };
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          creator: {
            select: { id: true, email: true, role: true, faculty: { select: { firstName: true, lastName: true } } },
          },
          assignee: {
            select: { id: true, email: true, faculty: { select: { firstName: true, lastName: true } } },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page: query.page || 1,
        limit: query.take,
        totalPages: Math.ceil(total / query.take),
      },
    };
  }

  async findAllTickets(tenantId: string, query: QueryTicketsDto) {
    const where: any = { tenantId };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.subject = { contains: query.search, mode: 'insensitive' };
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          creator: {
            select: { id: true, email: true, role: true, faculty: { select: { firstName: true, lastName: true } } },
          },
          assignee: {
            select: { id: true, email: true, faculty: { select: { firstName: true, lastName: true } } },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page: query.page || 1,
        limit: query.take,
        totalPages: Math.ceil(total / query.take),
      },
    };
  }

  async findOne(tenantId: string, id: string, userId?: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
      include: {
        creator: {
          select: { id: true, email: true, role: true, faculty: { select: { firstName: true, lastName: true } } },
        },
        assignee: {
          select: { id: true, email: true, faculty: { select: { firstName: true, lastName: true } } },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, email: true, role: true, faculty: { select: { firstName: true, lastName: true } } },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async reply(tenantId: string, id: string, userId: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content: dto.message,
        attachmentUrl: dto.attachmentUrl,
      },
      include: {
        sender: {
          select: { id: true, email: true, role: true, faculty: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    // Track first response
    if (!ticket.firstRespondedAt && ticket.createdBy !== userId) {
      await this.prisma.supportTicket.update({
        where: { id },
        data: {
          firstRespondedAt: new Date(),
          status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        },
      });
    }

    return message;
  }

  async updateStatus(tenantId: string, id: string, status: TicketStatus) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const data: any = { status };
    if (status === 'CLOSED' || status === 'RESOLVED') {
      data.closedAt = new Date();
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data,
    });
  }

  async assign(tenantId: string, id: string, assigneeId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        assignedTo: assigneeId,
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
      },
    });
  }
}
