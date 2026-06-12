import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto, QueryNoticeDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class NoticesService {
  private readonly logger = new Logger(NoticesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────────────

  async create(tenantId: string, userId: string, dto: CreateNoticeDto) {
    const notice = await this.prisma.notice.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        targetAudience: dto.targetAudience,
        batchIds: dto.batchIds || [],
        publishDate: new Date(dto.publishDate),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isPublished: new Date(dto.publishDate) <= new Date(),
        createdBy: userId,
      },
      include: {
        creator: { select: { email: true } },
      },
    });

    this.logger.log(`Notice created: ${notice.id} by user ${userId}`);
    return this.formatNotice(notice);
  }

  // ──────────────────────────────────────────────────
  // LIST (admin)
  // ──────────────────────────────────────────────────

  async findAll(tenantId: string, query: QueryNoticeDto) {
    const where: Prisma.NoticeWhereInput = {
      tenantId,
      ...(query.priority && { priority: query.priority }),
      ...(query.targetAudience && { targetAudience: query.targetAudience }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        include: {
          creator: { select: { email: true } },
          _count: { select: { readLogs: true } },
        },
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.notice.count({ where }),
    ]);

    return {
      data: notices.map((n) => this.formatNotice(n)),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // GET USER'S NOTICES (parent/student view)
  // ──────────────────────────────────────────────────

  async getMyNotices(tenantId: string, userId: string, userRole: string, query: QueryNoticeDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build audience filter based on user's role
    const audienceFilter: Prisma.NoticeWhereInput[] = [
      { targetAudience: 'ALL' },
    ];

    if (userRole === 'PARENT') {
      audienceFilter.push({ targetAudience: 'SPECIFIC_PARENT_GROUP' });
      audienceFilter.push({ targetAudience: 'ALL_STUDENTS' });
    } else if (userRole === 'STUDENT') {
      audienceFilter.push({ targetAudience: 'ALL_STUDENTS' });
    } else if (userRole === 'FACULTY') {
      audienceFilter.push({ targetAudience: 'FACULTY' });
    }

    // Also include batch-specific notices if user has batch enrollments
    audienceFilter.push({ targetAudience: 'SPECIFIC_BATCH' });

    const where: Prisma.NoticeWhereInput = {
      tenantId,
      isPublished: true,
      publishDate: { lte: today },
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: today } },
      ],
      AND: [{ OR: audienceFilter }],
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        include: {
          creator: { select: { email: true } },
          readLogs: { where: { userId }, select: { readAt: true } },
        },
        orderBy: { publishDate: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.notice.count({ where }),
    ]);

    return {
      data: notices.map((n) => ({
        ...this.formatNotice(n),
        isRead: n.readLogs.length > 0,
      })),
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  // ──────────────────────────────────────────────────
  // GET ONE
  // ──────────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    const notice = await this.prisma.notice.findFirst({
      where: { id, tenantId },
      include: {
        creator: { select: { email: true } },
        _count: { select: { readLogs: true } },
      },
    });

    if (!notice) throw new NotFoundException('Notice not found');
    return this.formatNotice(notice);
  }

  // ──────────────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────────────

  async update(tenantId: string, id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findFirst({ where: { id, tenantId } });
    if (!notice) throw new NotFoundException('Notice not found');

    const updated = await this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.targetAudience && { targetAudience: dto.targetAudience }),
        ...(dto.batchIds && { batchIds: dto.batchIds }),
        ...(dto.publishDate && { publishDate: new Date(dto.publishDate) }),
        ...(dto.expiryDate !== undefined && {
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
      include: {
        creator: { select: { email: true } },
      },
    });

    return this.formatNotice(updated);
  }

  // ──────────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────────

  async remove(tenantId: string, id: string) {
    const notice = await this.prisma.notice.findFirst({ where: { id, tenantId } });
    if (!notice) throw new NotFoundException('Notice not found');

    await this.prisma.notice.delete({ where: { id } });
    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // MARK READ
  // ──────────────────────────────────────────────────

  async markRead(tenantId: string, noticeId: string, userId: string) {
    const notice = await this.prisma.notice.findFirst({ where: { id: noticeId, tenantId } });
    if (!notice) throw new NotFoundException('Notice not found');

    await this.prisma.noticeReadLog.upsert({
      where: { noticeId_userId: { noticeId, userId } },
      create: { noticeId, userId },
      update: { readAt: new Date() },
    });

    return { success: true };
  }

  // ──────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────

  private formatNotice(notice: any) {
    return {
      id: notice.id,
      title: notice.title,
      description: notice.description,
      priority: notice.priority,
      targetAudience: notice.targetAudience,
      batchIds: notice.batchIds,
      publishDate: notice.publishDate?.toISOString().split('T')[0],
      expiryDate: notice.expiryDate?.toISOString().split('T')[0] || null,
      isPublished: notice.isPublished,
      createdBy: notice.createdBy,
      createdByName: notice.creator?.email || 'Unknown',
      readCount: notice._count?.readLogs || 0,
      createdAt: notice.createdAt.toISOString(),
    };
  }
}
