import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, QueryAnnouncementDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { NotificationType } from '@prime/shared-types';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────────────

  async create(tenantId: string, userId: string, dto: CreateAnnouncementDto) {
    // Announcements use the generic Notification model but are treated
    // specially by the UI. The content is stored in the data JSON field.
    const announcement = await this.prisma.notification.create({
      data: {
        tenantId,
        title: dto.title,
        body: dto.content,
        type: NotificationType.ANNOUNCEMENT,
        data: {
          category: dto.category,
          attachments: dto.attachmentUrls || [],
          scheduledAt: dto.scheduledAt || null,
        },
        createdBy: userId,
      },
      include: {
        creator: { select: { email: true } },
      },
    });

    this.logger.log(`Announcement created: ${announcement.id} by user ${userId}`);
    return this.formatAnnouncement(announcement);
  }

  // ──────────────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────────────

  async findAll(tenantId: string, query: QueryAnnouncementDto) {
    const where: Prisma.NotificationWhereInput = {
      tenantId,
      type: NotificationType.ANNOUNCEMENT,
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { body: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Note: We can't easily filter by category at DB level since it's inside JSON `data` column.
    // For a larger scale app, we might extract `category` to a dedicated column or model.
    // In PostgreSQL, you can use jsonb path queries but Prisma's support is somewhat limited
    // depending on the database. For now, we fetch all matching text and filter in memory if needed.
    // To properly support json filtering in Prisma on PostgreSQL, you would use:
    // data: { path: ['category'], equals: query.category }

    if (query.category) {
       where.data = {
           path: ['category'],
           equals: query.category
       };
    }

    const [announcements, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          creator: { select: { email: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: announcements.map((a) => this.formatAnnouncement(a)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // GET ONE
  // ──────────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    const announcement = await this.prisma.notification.findFirst({
      where: { id, tenantId, type: NotificationType.ANNOUNCEMENT },
      include: {
        creator: { select: { email: true } },
      },
    });

    if (!announcement) throw new NotFoundException('Announcement not found');
    return this.formatAnnouncement(announcement);
  }

  // ──────────────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────────────

  async update(tenantId: string, id: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.notification.findFirst({
      where: { id, tenantId, type: NotificationType.ANNOUNCEMENT },
    });
    
    if (!announcement) throw new NotFoundException('Announcement not found');

    const currentData = announcement.data as Record<string, any>;

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { body: dto.content }),
        data: {
          ...currentData,
          ...(dto.category && { category: dto.category }),
          ...(dto.attachmentUrls && { attachments: dto.attachmentUrls }),
          ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt }),
        },
      },
      include: {
        creator: { select: { email: true } },
      },
    });

    return this.formatAnnouncement(updated);
  }

  // ──────────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const announcement = await this.prisma.notification.findFirst({
      where: { id, tenantId, type: NotificationType.ANNOUNCEMENT },
    });
    
    if (!announcement) throw new NotFoundException('Announcement not found');

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────

  private formatAnnouncement(notification: any) {
    const data = (notification.data || {}) as any;
    return {
      id: notification.id,
      title: notification.title,
      content: notification.body,
      category: data.category || 'GENERAL',
      attachments: data.attachments || [],
      scheduledAt: data.scheduledAt || null,
      publishedAt: notification.createdAt.toISOString(),
      createdBy: notification.createdBy,
      createdByName: notification.creator?.email || 'Unknown',
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
