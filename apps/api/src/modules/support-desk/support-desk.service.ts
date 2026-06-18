import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateKnowledgeBaseArticleDto,
  CreateSlaPolicyDto,
} from './dto/support-desk.dto';

@Injectable()
export class SupportDeskService {
  constructor(private readonly prisma: PrismaService) {}

  createSlaPolicy(dto: CreateSlaPolicyDto) {
    return this.prisma.supportSlaPolicy.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        priority: dto.priority,
        firstResponseMinutes: dto.firstResponseMinutes,
        resolutionMinutes: dto.resolutionMinutes,
        escalationRules: (dto.escalationRules as any) || {},
      },
    });
  }

  listSlaPolicies(organizationId: string) {
    return this.prisma.supportSlaPolicy.findMany({
      where: { organizationId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async escalateOverdueTickets(organizationId: string) {
    const now = new Date();
    const result = await this.prisma.supportTicket.updateMany({
      where: {
        organizationId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        escalatedAt: null,
        OR: [
          { firstResponseDueAt: { lt: now }, firstRespondedAt: null },
          { resolutionDueAt: { lt: now } },
        ],
      },
      data: { escalatedAt: now },
    });
    return { escalatedCount: result.count };
  }

  listEnterpriseTickets(organizationId: string) {
    return this.prisma.supportTicket.findMany({
      where: { organizationId },
      include: {
        tenant: { select: { name: true, slug: true } },
        creator: { select: { email: true, role: true } },
        assignee: { select: { email: true } },
        slaPolicy: true,
      },
      orderBy: [{ escalatedAt: 'desc' }, { updatedAt: 'desc' }],
      take: 200,
    });
  }

  createArticle(dto: CreateKnowledgeBaseArticleDto) {
    return this.prisma.knowledgeBaseArticle.create({
      data: {
        organizationId: dto.organizationId || null,
        title: dto.title,
        slug: dto.slug,
        content: dto.content,
        category: dto.category || null,
        isPublished: dto.isPublished || false,
      },
    });
  }

  listArticles(organizationId?: string, publishedOnly = false) {
    return this.prisma.knowledgeBaseArticle.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(publishedOnly ? { isPublished: true } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
