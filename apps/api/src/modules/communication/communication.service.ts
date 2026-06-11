import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTicketDto, ReplyTicketDto, QueryTicketDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { TicketStatus } from '@prime/shared-types';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // CREATE TICKET
  // ──────────────────────────────────────────────────

  async createTicket(tenantId: string, userId: string, dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          tenantId,
          subject: dto.subject,
          category: dto.category,
          createdBy: userId,
        },
      });

      // Create the initial message
      await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: userId,
          content: dto.message,
        },
      });

      this.logger.log(`Ticket created: ${ticket.id} by user ${userId}`);
      return this.getTicketDetail(tenantId, ticket.id, userId, true);
    });
  }

  // ──────────────────────────────────────────────────
  // LIST MY TICKETS
  // ──────────────────────────────────────────────────

  async getMyTickets(tenantId: string, userId: string, query: QueryTicketDto) {
    const where: Prisma.SupportTicketWhereInput = {
      tenantId,
      createdBy: userId,
      ...(query.status && { status: query.status }),
      ...(query.category && { category: query.category }),
      ...(query.search && {
        subject: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    return this.listTickets(where, query);
  }

  // ──────────────────────────────────────────────────
  // LIST ALL TICKETS (admin/faculty)
  // ──────────────────────────────────────────────────

  async getAllTickets(tenantId: string, query: QueryTicketDto) {
    const where: Prisma.SupportTicketWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.category && { category: query.category }),
      ...(query.search && {
        subject: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    return this.listTickets(where, query);
  }

  // ──────────────────────────────────────────────────
  // GET TICKET DETAIL
  // ──────────────────────────────────────────────────

  async getTicketDetail(tenantId: string, ticketId: string, userId: string, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        tenantId,
        ...(isAdmin ? {} : { createdBy: userId }),
      },
      include: {
        creator: { select: { email: true, role: true } },
        assignee: { select: { email: true } },
        messages: {
          include: {
            sender: { select: { email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return {
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      createdBy: ticket.createdBy,
      createdByName: ticket.creator.email,
      createdByRole: ticket.creator.role,
      assignedToName: ticket.assignee?.email || null,
      lastMessage: ticket.messages.length > 0
        ? ticket.messages[ticket.messages.length - 1].content
        : null,
      messageCount: ticket._count.messages,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map((m) => ({
        id: m.id,
        ticketId: m.ticketId,
        senderId: m.senderId,
        senderName: m.sender.email,
        senderRole: m.sender.role,
        content: m.content,
        attachmentUrl: m.attachmentUrl,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // REPLY TO TICKET
  // ──────────────────────────────────────────────────

  async replyToTicket(tenantId: string, ticketId: string, userId: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    // Create the reply message
    await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: userId,
        content: dto.message,
        attachmentUrl: dto.attachmentUrl || null,
      },
    });

    // Auto-update status to IN_PROGRESS if it was OPEN and an admin/faculty is replying
    if (ticket.status === 'OPEN' && ticket.createdBy !== userId) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return this.getTicketDetail(tenantId, ticketId, userId, true);
  }

  // ──────────────────────────────────────────────────
  // UPDATE TICKET STATUS
  // ──────────────────────────────────────────────────

  async updateStatus(tenantId: string, ticketId: string, status: TicketStatus) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    const updateData: Prisma.SupportTicketUpdateInput = { status };
    if (status === 'CLOSED' || status === 'RESOLVED') {
      updateData.closedAt = new Date();
    }

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    return { success: true, status };
  }

  // ──────────────────────────────────────────────────
  // ASSIGN TICKET
  // ──────────────────────────────────────────────────

  async assignTicket(tenantId: string, ticketId: string, assigneeId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo: assigneeId },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────

  private async listTickets(where: Prisma.SupportTicketWhereInput, query: QueryTicketDto) {
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          creator: { select: { email: true, role: true } },
          assignee: { select: { email: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { [query.sortBy || 'updatedAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        category: t.category,
        status: t.status,
        createdBy: t.createdBy,
        createdByName: t.creator.email,
        createdByRole: t.creator.role,
        assignedToName: t.assignee?.email || null,
        lastMessage: t.messages[0]?.content || null,
        messageCount: t._count.messages,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }
}
