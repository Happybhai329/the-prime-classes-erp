import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CampaignType, CampaignChannel, CampaignStatus } from '@prime/shared-types';
import { buildPaginationMeta } from '../../common/utils/helpers';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCampaign(tenantId: string, data: any) {
    return this.prisma.campaign.create({
      data: {
        tenantId,
        name: data.name,
        type: data.type,
        channel: data.channel,
        status: CampaignStatus.DRAFT,
        templateBody: data.templateBody,
        subject: data.subject || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });
  }

  async findAllCampaigns(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      type?: CampaignType;
      channel?: CampaignChannel;
      status?: CampaignStatus;
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      tenantId,
      ...(query.type && { type: query.type }),
      ...(query.channel && { channel: query.channel }),
      ...(query.status && { status: query.status }),
    };

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findCampaignById(tenantId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * Dispatch campaign broadcasts to active leads.
   */
  async triggerCampaign(tenantId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Retrieve active leads as target segment
    const leads = await this.prisma.lead.findMany({
      where: { tenantId, email: { not: null }, phone: { not: null } },
    });

    const totalLeads = leads.length;
    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    this.logger.log(`Starting campaign broadcast "${campaign.name}" via channel ${campaign.channel} to ${totalLeads} leads.`);

    // Simulate messaging gateway dispatches
    for (const lead of leads) {
      try {
        // Mock processing message templates
        const processedBody = campaign.templateBody
          .replace(/\{\{\s*firstName\s*\}\}/g, lead.firstName)
          .replace(/\{\{\s*lastName\s*\}\}/g, lead.lastName);

        this.logger.debug(
          `[DISPATCH] [${campaign.channel}] To: ${campaign.channel === CampaignChannel.EMAIL ? lead.email : lead.phone} Msg: ${processedBody.substring(0, 40)}...`,
        );

        sentCount++;
        if (Math.random() > 0.05) {
          deliveredCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    // Build metrics payload
    const metrics = {
      totalTargeted: totalLeads,
      sent: sentCount,
      delivered: deliveredCount,
      opened: Math.round(deliveredCount * 0.45), // simulated open rate
      clicked: Math.round(deliveredCount * 0.15), // simulated click rate
      failed: failedCount,
    };

    // Update campaign record
    return this.prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.COMPLETED,
        sentAt: new Date(),
        metrics,
      },
    });
  }
}
