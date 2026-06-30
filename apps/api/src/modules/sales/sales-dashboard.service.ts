import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SalesDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalEnquiries,
      todaysEnquiries,
      totalAdmissions,
      todaysAdmissions,
      admissionsGroup,
      cancelledCount,
    ] = await Promise.all([
      // Total Enquiries
      this.prisma.enquiry.count({ where: { tenantId } }),
      // Today's Enquiries
      this.prisma.enquiry.count({
        where: {
          tenantId,
          createdAt: { gte: today, lte: endOfToday },
        },
      }),
      // Total Admissions
      this.prisma.admission.count({ where: { tenantId } }),
      // Today's Admissions
      this.prisma.admission.count({
        where: {
          tenantId,
          createdAt: { gte: today, lte: endOfToday },
        },
      }),
      // Sums for Admissions (Revenue etc)
      this.prisma.admission.findMany({
        where: { tenantId },
        select: {
          registrationFee: true,
          status: true,
        },
      }),
      // Cancelled Count
      this.prisma.admission.count({
        where: { tenantId, status: 'CANCELLED' },
      }),
    ]);

    // Calculate revenue (registrationFee)
    const revenue = admissionsGroup
      .filter((a) => a.status !== 'CANCELLED')
      .reduce((sum, a) => sum + Number(a.registrationFee || 0), 0);

    // Calculate conversion %
    const conversionRate = totalEnquiries > 0
      ? parseFloat(((totalAdmissions / totalEnquiries) * 100).toFixed(2))
      : 0;

    // Get Admission Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendAdmissions = await this.prisma.admission.findMany({
      where: {
        tenantId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map<string, number>();

    // Initialise last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      trendMap.set(label, 0);
    }

    // Populate trend
    trendAdmissions.forEach((a) => {
      const date = new Date(a.createdAt);
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substr(-2)}`;
      if (trendMap.has(label)) {
        trendMap.set(label, trendMap.get(label)! + 1);
      }
    });

    const trend = Array.from(trendMap.entries())
      .map(([name, count]) => ({ name, count }))
      .reverse();

    return {
      totalEnquiries,
      todaysEnquiries,
      totalAdmissions,
      todaysAdmissions,
      revenue,
      cancelledCount,
      conversionRate,
      trend,
    };
  }
}
