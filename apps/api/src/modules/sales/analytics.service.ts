import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(tenantId: string) {
    const [
      enquiries,
      admissions,
      followUpsCount,
      enrolledCount,
      leadSourcesGroup,
      counsellorRankings,
    ] = await Promise.all([
      // Total Enquiries
      this.prisma.enquiry.findMany({
        where: { tenantId },
        select: { id: true, source: true },
      }),
      // Total Admissions
      this.prisma.admission.findMany({
        where: { tenantId },
        select: { id: true, registrationFee: true, convertedToAcademic: true },
      }),
      // Enquiries with at least 1 Follow Up
      this.prisma.enquiry.count({
        where: {
          tenantId,
          followUps: { some: {} },
        },
      }),
      // Enrolled Count
      this.prisma.admission.count({
        where: { tenantId, convertedToAcademic: true },
      }),
      // Lead Sources Group
      this.prisma.enquiry.groupBy({
        by: ['source'],
        where: { tenantId },
        _count: { id: true },
      }),
      // Counsellor Rankings
      this.prisma.counsellor.findMany({
        where: { tenantId, active: true },
        select: {
          id: true,
          name: true,
          targetAdmissions: true,
          targetRevenue: true,
          enquiries: {
            select: {
              admissions: {
                select: {
                  registrationFee: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // 1. Lead Sources
    const leadSources = leadSourcesGroup.map((g) => ({
      name: g.source || 'Unknown',
      value: g._count.id,
    }));

    // 2. Conversion Funnel
    // Funnel stages: Enquiry -> Follow Up -> Admission -> Enrollment
    const funnel = [
      { stage: 'Enquiry', count: enquiries.length },
      { stage: 'Follow Up', count: followUpsCount },
      { stage: 'Admission', count: admissions.length },
      { stage: 'Enrollment', count: enrolledCount },
    ];

    // 3. Counsellor performance rankings
    const rankings = counsellorRankings.map((c) => {
      let admissionsCount = 0;
      let revenueSum = 0;

      c.enquiries.forEach((e) => {
        e.admissions.forEach((a) => {
          if (a.status !== 'CANCELLED') {
            admissionsCount++;
            revenueSum += Number(a.registrationFee || 0);
          }
        });
      });

      return {
        name: c.name,
        admissions: admissionsCount,
        targetAdmissions: c.targetAdmissions,
        revenue: revenueSum,
        targetRevenue: Number(c.targetRevenue),
        conversionRate: c.enquiries.length > 0
          ? parseFloat(((admissionsCount / c.enquiries.length) * 100).toFixed(2))
          : 0,
      };
    }).sort((a, b) => b.admissions - a.admissions);

    return {
      leadSources,
      funnel,
      rankings,
    };
  }
}
