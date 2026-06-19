import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { LeadStatus, LeadSource, LeadActivityType } from '@prime/shared-types';
import { buildPaginationMeta } from '../../common/utils/helpers';
import { CreateLeadDto, UpdateLeadDto, LeadActivityDto } from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * AI Lead Scoring Algorithm.
   * Dynamically calculates conversion probability (0.0 to 100.0) based on engagement, source, and stages.
   */
  calculateLeadScore(status: LeadStatus, source: LeadSource, activityCount: number, followUpScheduled: boolean): number {
    let score = 0;

    // 1. Stage Weight (50%)
    switch (status) {
      case LeadStatus.INQUIRY:
        score += 15;
        break;
      case LeadStatus.COUNSELING:
        score += 35;
        break;
      case LeadStatus.DOCUMENT_COLLECTION:
        score += 60;
        break;
      case LeadStatus.FEE_PAYMENT:
        score += 85;
        break;
      case LeadStatus.ADMISSION_CONFIRMED:
        score += 100;
        break;
      case LeadStatus.REJECTED:
        return 0.0;
    }

    // 2. Lead Source Weight (25%)
    let sourceWeight = 0;
    switch (source) {
      case LeadSource.MANUAL:
        sourceWeight = 25; // Highly qualified manual entry
        break;
      case LeadSource.WEBSITE_FORM:
        sourceWeight = 20; // Direct intent
        break;
      case LeadSource.WHATSAPP:
        sourceWeight = 18; // Direct chat engagement
        break;
      case LeadSource.GOOGLE_ADS:
        sourceWeight = 15; // Search intent
        break;
      case LeadSource.FACEBOOK_ADS:
        sourceWeight = 10; // Passive feed intent
        break;
    }
    score += sourceWeight;

    // 3. Engagement Activities (25%)
    // Base engagement: +5 per completed counselor contact activity (up to 20)
    const engagementScore = Math.min(activityCount * 5, 20);
    score += engagementScore;

    // Active scheduling incentive: +5 if counselor has active follow-up scheduled
    if (followUpScheduled) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Recalculate lead score and update lead in DB.
   */
  async updateLeadScore(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          where: { isCompleted: true },
        },
      },
    });

    if (!lead) return;

    const activeFollowUp = await this.prisma.leadActivity.findFirst({
      where: {
        leadId,
        isCompleted: false,
        activityType: LeadActivityType.FOLLOW_UP_SCHEDULED,
        scheduledAt: { gte: new Date() },
      },
    });

    const newScore = this.calculateLeadScore(
      lead.status as LeadStatus,
      lead.source as LeadSource,
      lead.activities.length,
      !!activeFollowUp,
    );

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score: new Prisma.Decimal(newScore) },
    });
  }

  // --- Leads CRUD ---

  async findAllLeads(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: LeadStatus;
      source?: LeadSource;
      counselorId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.source && { source: query.source }),
      ...(query.counselorId && { assignedCounselorId: query.counselorId }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          counselor: {
            include: {
              user: {
                select: { email: true, phone: true },
              },
            },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findLeadById(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        counselor: {
          include: {
            user: { select: { email: true } },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { email: true } },
          },
        },
        applications: {
          select: { id: true, applicationNumber: true, status: true, classApplyingFor: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async createLead(tenantId: string, data: CreateLeadDto & { status?: LeadStatus; source?: LeadSource }, currentUserId?: string) {
    // Check if phone or email already registered as lead to prevent duplicates
    if (data.phone) {
      const existing = await this.prisma.lead.findFirst({
        where: { tenantId, phone: data.phone },
      });
      if (existing) {
        throw new ConflictException(`Lead with phone ${data.phone} already exists`);
      }
    }

    // Auto-assignment engine: find active counselor with the lowest workload (least assigned active leads)
    let autoAssignedCounselorId: string | null = null;
    if (!data.assignedCounselorId) {
      const leastBusyCounselor = await this.prisma.counselor.findFirst({
        where: { tenantId, isActive: true },
        orderBy: {
          leads: {
            _count: 'asc',
          },
        },
        select: { id: true },
      });
      if (leastBusyCounselor) {
        autoAssignedCounselorId = leastBusyCounselor.id;
      }
    } else {
      autoAssignedCounselorId = data.assignedCounselorId;
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        source: data.source || LeadSource.WEBSITE_FORM,
        status: data.status || LeadStatus.INQUIRY,
        assignedCounselorId: autoAssignedCounselorId,
        notes: data.notes || '',
        metaData: (data.metaData as Prisma.InputJsonValue) || {},
      },
    });

    // Log initial lead activity
    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        activityType: LeadActivityType.STATUS_CHANGE,
        description: `Lead created from source: ${lead.source}. Status set to: ${lead.status}.`,
        createdById: currentUserId,
        isCompleted: true,
      },
    });

    // Compute first score
    await this.updateLeadScore(lead.id);

    return this.prisma.lead.findUnique({
      where: { id: lead.id },
      include: { counselor: true },
    });
  }

  async updateLead(tenantId: string, id: string, data: UpdateLeadDto, currentUserId?: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        source: data.source ?? undefined,
        status: data.status ?? undefined,
        notes: data.notes ?? undefined,
        metaData: (data.metaData as Prisma.InputJsonValue) ?? undefined,
      },
    });

    // Log status change activity
    if (data.status && data.status !== lead.status) {
      await this.prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: LeadActivityType.STATUS_CHANGE,
          description: `Lead status updated from ${lead.status} to ${data.status}`,
          createdById: currentUserId,
          isCompleted: true,
        },
      });
    }

    await this.updateLeadScore(id);

    return updatedLead;
  }

  async deleteLead(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.prisma.lead.delete({
      where: { id },
    });

    return { success: true };
  }

  async assignLead(tenantId: string, leadId: string, counselorId: string, currentUserId?: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const counselor = await this.prisma.counselor.findFirst({
      where: { id: counselorId, tenantId },
      include: { user: { select: { email: true } } },
    });

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { assignedCounselorId: counselorId },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId,
        activityType: LeadActivityType.STATUS_CHANGE,
        description: `Lead assigned to counselor ${counselor.user.email}`,
        createdById: currentUserId,
        isCompleted: true,
      },
    });

    return { success: true };
  }

  // --- Lead Activities ---

  async logActivity(tenantId: string, leadId: string, data: LeadActivityDto, currentUserId?: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const activity = await this.prisma.leadActivity.create({
      data: {
        leadId,
        activityType: data.activityType,
        description: data.description,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        isCompleted: data.isCompleted ?? true,
        createdById: currentUserId,
      },
    });

    await this.updateLeadScore(leadId);

    return activity;
  }

  // --- Counselors Workspace ---

  async getCounselorDashboard(tenantId: string, userId: string) {
    const counselor = await this.prisma.counselor.findFirst({
      where: { tenantId, userId },
    });

    if (!counselor) {
      throw new NotFoundException('Counselor profile not found for user');
    }

    // Workload stats
    const leadsCount = await this.prisma.lead.count({
      where: { tenantId, assignedCounselorId: counselor.id },
    });

    const activeLeadsCount = await this.prisma.lead.count({
      where: {
        tenantId,
        assignedCounselorId: counselor.id,
        status: { in: [LeadStatus.INQUIRY, LeadStatus.COUNSELING, LeadStatus.DOCUMENT_COLLECTION, LeadStatus.FEE_PAYMENT] },
      },
    });

    const closedAdmissions = await this.prisma.lead.count({
      where: {
        tenantId,
        assignedCounselorId: counselor.id,
        status: LeadStatus.ADMISSION_CONFIRMED,
      },
    });

    // Activities counts: Calls Made, etc.
    const callsMade = await this.prisma.leadActivity.count({
      where: {
        lead: { assignedCounselorId: counselor.id, tenantId },
        activityType: LeadActivityType.CALL,
        isCompleted: true,
      },
    });

    // Conversion rate
    const totalLeadsAssigned = await this.prisma.lead.count({
      where: { tenantId, assignedCounselorId: counselor.id },
    });
    const conversionRate = totalLeadsAssigned > 0
      ? parseFloat(((closedAdmissions / totalLeadsAssigned) * 100).toFixed(2))
      : 0;

    // Follow-ups due today or overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const followUps = await this.prisma.leadActivity.findMany({
      where: {
        lead: { assignedCounselorId: counselor.id, tenantId },
        isCompleted: false,
        activityType: LeadActivityType.FOLLOW_UP_SCHEDULED,
        scheduledAt: { lte: endOfToday },
      },
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, phone: true, score: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return {
      counselorId: counselor.id,
      totalLeadsAssigned,
      activeLeads: activeLeadsCount,
      admissionsClosed: closedAdmissions,
      callsMade,
      conversionRate,
      followUpsDue: followUps,
    };
  }

  async listCounselors(tenantId: string) {
    return this.prisma.counselor.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true },
        },
      },
    });
  }

  async createCounselor(tenantId: string, data: { userId: string }) {
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.counselor.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      if (!existing.isActive) {
        return this.prisma.counselor.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      throw new ConflictException('User is already registered as counselor');
    }

    return this.prisma.counselor.create({
      data: {
        tenantId,
        userId: data.userId,
        isActive: true,
      },
    });
  }

  async deactivateCounselor(tenantId: string, id: string) {
    const counselor = await this.prisma.counselor.findFirst({
      where: { id, tenantId },
    });

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    await this.prisma.counselor.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }
}
