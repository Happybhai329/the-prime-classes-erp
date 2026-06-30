import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyAdmissions(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.admission.findMany({
      where: {
        tenantId,
        createdAt: { gte: today },
      },
      include: {
        enquiry: {
          select: { studentName: true, mobile: true, class: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMonthlyAdmissions(tenantId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.prisma.admission.findMany({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
      include: {
        enquiry: {
          select: { studentName: true, mobile: true, class: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCounsellorPerformance(tenantId: string) {
    const counsellors = await this.prisma.counsellor.findMany({
      where: { tenantId },
      include: {
        enquiries: {
          include: {
            admissions: true,
          },
        },
      },
    });

    return counsellors.map((c) => {
      let admissionsCount = 0;
      let revenue = 0;
      c.enquiries.forEach((e) => {
        e.admissions.forEach((a) => {
          if (a.status !== 'CANCELLED') {
            admissionsCount++;
            revenue += Number(a.registrationFee || 0);
          }
        });
      });

      return {
        counsellorName: c.name,
        totalEnquiries: c.enquiries.length,
        admissions: admissionsCount,
        targetAdmissions: c.targetAdmissions,
        revenue,
        targetRevenue: Number(c.targetRevenue),
        active: c.active,
      };
    });
  }

  async getLeadSourceReport(tenantId: string) {
    const enquiries = await this.prisma.enquiry.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { id: true },
    });

    const admissions = await this.prisma.admission.findMany({
      where: { tenantId },
      include: { enquiry: { select: { source: true } } },
    });

    return enquiries.map((g) => {
      const source = g.source || 'Unknown';
      const sourceAdmissions = admissions.filter((a) => a.enquiry.source === source).length;
      return {
        source,
        enquiries: g._count.id,
        admissions: sourceAdmissions,
        conversionRate: g._count.id > 0
          ? parseFloat(((sourceAdmissions / g._count.id) * 100).toFixed(2))
          : 0,
      };
    });
  }

  async getConversionReport(tenantId: string) {
    const [totalEnquiries, totalAdmissions, enrolledCount] = await Promise.all([
      this.prisma.enquiry.count({ where: { tenantId } }),
      this.prisma.admission.count({ where: { tenantId } }),
      this.prisma.admission.count({ where: { tenantId, convertedToAcademic: true } }),
    ]);

    return {
      totalEnquiries,
      totalAdmissions,
      enrolledCount,
      enquiryToAdmissionRate: totalEnquiries > 0
        ? parseFloat(((totalAdmissions / totalEnquiries) * 100).toFixed(2))
        : 0,
      admissionToEnrollmentRate: totalAdmissions > 0
        ? parseFloat(((enrolledCount / totalAdmissions) * 100).toFixed(2))
        : 0,
      overallConversionRate: totalEnquiries > 0
        ? parseFloat(((enrolledCount / totalEnquiries) * 100).toFixed(2))
        : 0,
    };
  }

  async getRevenueReport(tenantId: string) {
    const admissions = await this.prisma.admission.findMany({
      where: { tenantId, status: { not: 'CANCELLED' } },
      select: {
        registrationFee: true,
        discount: true,
        scholarship: true,
        createdAt: true,
      },
    });

    const monthlyRevenue = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    admissions.forEach((a) => {
      const monthStr = monthNames[a.createdAt.getMonth()];
      const yearStr = a.createdAt.getFullYear().toString();
      const key = `${monthStr} ${yearStr}`;
      monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + Number(a.registrationFee || 0));
    });

    const detailedMonthly = Array.from(monthlyRevenue.entries()).map(([month, amount]) => ({
      month,
      amount,
    }));

    const totalRevenue = admissions.reduce((sum, a) => sum + Number(a.registrationFee || 0), 0);
    const totalDiscount = admissions.reduce((sum, a) => sum + Number(a.discount || 0), 0);
    const totalScholarship = admissions.reduce((sum, a) => sum + Number(a.scholarship || 0), 0);

    return {
      totalRevenue,
      totalDiscount,
      totalScholarship,
      monthlyRevenue: detailedMonthly,
    };
  }

  async getCancelledAdmissions(tenantId: string) {
    return this.prisma.admission.findMany({
      where: {
        tenantId,
        status: 'CANCELLED',
      },
      include: {
        enquiry: {
          select: { studentName: true, mobile: true, class: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingAdmissions(tenantId: string) {
    return this.prisma.admission.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      include: {
        enquiry: {
          select: { studentName: true, mobile: true, class: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScholarshipReport(tenantId: string) {
    const admissions = await this.prisma.admission.findMany({
      where: {
        tenantId,
        scholarship: { gt: 0 },
      },
      include: {
        enquiry: {
          select: { studentName: true, mobile: true, class: true },
        },
      },
      orderBy: { scholarship: 'desc' },
    });

    return admissions.map((a) => ({
      admissionNumber: a.admissionNumber,
      studentName: a.enquiry.studentName,
      class: a.enquiry.class || '',
      scholarshipAmount: Number(a.scholarship),
      registrationFee: Number(a.registrationFee),
    }));
  }
}
