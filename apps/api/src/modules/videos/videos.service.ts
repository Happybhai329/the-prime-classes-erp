import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateVideoDto, QueryVideoDto } from './dto';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVideoDto) {
    return this.prisma.videoLecture.create({
      data: {
        tenantId,
        batchId: dto.batchId || null,
        subjectId: dto.subjectId || null,
        title: dto.title,
        description: dto.description || null,
        videoUrl: dto.videoUrl,
        provider: dto.provider,
        durationSeconds: dto.durationSeconds || null,
        thumbnailUrl: dto.thumbnailUrl || null,
        isLive: dto.isLive || false,
        scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : null,
      },
    });
  }

  async findAll(tenantId: string, query: QueryVideoDto, userContext?: { role: string; studentId?: string }) {
    const where: Prisma.VideoLectureWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.subjectId && { subjectId: query.subjectId }),
      ...(query.isLive !== undefined && { isLive: query.isLive }),
    };

    if (userContext) {
      if (userContext.role === 'STUDENT' && userContext.studentId) {
        const studentId = userContext.studentId;
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.OR = [
          { batchId: null },
          ...(batchIds.length > 0 ? [{ batchId: { in: batchIds } }] : []),
        ];
      } else if (userContext.role === 'PARENT' && userContext.studentId) {
        const studentId = userContext.studentId;
        const enrollments = await this.prisma.batchStudent.findMany({
          where: { studentId, status: 'ACTIVE' },
          select: { batchId: true },
        });
        const batchIds = enrollments.map(e => e.batchId);
        where.OR = [
          { batchId: null },
          ...(batchIds.length > 0 ? [{ batchId: { in: batchIds } }] : []),
        ];
      } else {
        if (query.batchId) {
          where.batchId = query.batchId;
        }
      }
    }

    const [videos, total] = await Promise.all([
      this.prisma.videoLecture.findMany({
        where,
        include: {
          batch: { select: { name: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.videoLecture.count({ where }),
    ]);

    return {
      data: videos,
      meta: buildPaginationMeta(total, query.page || 1, query.limit || 20),
    };
  }

  async findOne(tenantId: string, id: string) {
    const video = await this.prisma.videoLecture.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        batch: true,
        subject: true,
      },
    });

    if (!video) throw new NotFoundException('Video lecture not found');

    return video;
  }

  async remove(tenantId: string, id: string) {
    const video = await this.prisma.videoLecture.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!video) throw new NotFoundException('Video lecture not found');

    await this.prisma.videoLecture.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}
