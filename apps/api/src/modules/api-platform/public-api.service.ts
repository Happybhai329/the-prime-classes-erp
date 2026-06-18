import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PublicApiContext {
  tenantId?: string | null;
  organizationId?: string | null;
}

@Injectable()
export class PublicApiService {
  constructor(private readonly prisma: PrismaService) {}

  listBranches(context: PublicApiContext) {
    return this.prisma.branch.findMany({
      where: {
        ...(context.organizationId
          ? { organizationId: context.organizationId }
          : {}),
        ...(context.tenantId ? { tenantId: context.tenantId } : {}),
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        code: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async listStudents(
    context: PublicApiContext,
    page = 1,
    limit = 50,
  ) {
    const tenantIds = await this.resolveTenantIds(context);
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const where = {
      tenantId: { in: tenantIds },
      deletedAt: null,
    };
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          rollNumber: true,
          firstName: true,
          lastName: true,
          status: true,
          targetExam: true,
          admissionDate: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);
    return { data, meta: { page, limit: take, total } };
  }

  async listLeads(context: PublicApiContext, page = 1, limit = 50) {
    const tenantIds = await this.resolveTenantIds(context);
    const take = Math.min(Math.max(limit, 1), 100);
    const where = { tenantId: { in: tenantIds } };
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          source: true,
          status: true,
          score: true,
          createdAt: true,
        },
        skip: (Math.max(page, 1) - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, meta: { page, limit: take, total } };
  }

  async listAdmissions(context: PublicApiContext, page = 1, limit = 50) {
    const tenantIds = await this.resolveTenantIds(context);
    const take = Math.min(Math.max(limit, 1), 100);
    const where = { tenantId: { in: tenantIds } };
    const [data, total] = await Promise.all([
      this.prisma.admissionApplication.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          applicationNumber: true,
          firstName: true,
          lastName: true,
          classApplyingFor: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
        skip: (Math.max(page, 1) - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionApplication.count({ where }),
    ]);
    return { data, meta: { page, limit: take, total } };
  }

  async listPayments(context: PublicApiContext, page = 1, limit = 50) {
    const tenantIds = await this.resolveTenantIds(context);
    const take = Math.min(Math.max(limit, 1), 100);
    const where = {
      tenantId: { in: tenantIds },
      deletedAt: null,
    };
    const [data, total] = await Promise.all([
      this.prisma.feePayment.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          amountPaid: true,
          paymentDate: true,
          paymentMode: true,
          transactionId: true,
          receiptNumber: true,
        },
        skip: (Math.max(page, 1) - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feePayment.count({ where }),
    ]);
    return { data, meta: { page, limit: take, total } };
  }

  async analyticsSummary(context: PublicApiContext) {
    const tenantIds = await this.resolveTenantIds(context);
    const [students, revenue, activeUsers, atRisk] = await Promise.all([
      this.prisma.student.count({
        where: { tenantId: { in: tenantIds }, deletedAt: null },
      }),
      this.prisma.feePayment.aggregate({
        where: { tenantId: { in: tenantIds }, deletedAt: null },
        _sum: { amountPaid: true },
      }),
      this.prisma.user.count({
        where: {
          tenantId: { in: tenantIds },
          isActive: true,
          deletedAt: null,
        },
      }),
      this.prisma.studentAnalyticsSnapshot.count({
        where: { tenantId: { in: tenantIds }, category: 'AT_RISK' },
      }),
    ]);
    return {
      totalStudents: students,
      totalRevenue: Number(revenue._sum.amountPaid || 0),
      activeUsers,
      atRiskStudents: atRisk,
    };
  }

  async listResources(context: PublicApiContext) {
    const tenantIds = await this.resolveTenantIds(context);
    return this.prisma.resourceCenterItem.findMany({
      where: {
        isPublished: true,
        publications: {
          some: {
            status: 'PUBLISHED',
            OR: [
              { tenantId: { in: tenantIds } },
              { tenantId: null, branchId: null },
            ],
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        assetType: true,
        visibility: true,
        fileUrl: true,
        thumbnailUrl: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listSupportTickets(context: PublicApiContext, limit = 50) {
    const tenantIds = await this.resolveTenantIds(context);
    return this.prisma.supportTicket.findMany({
      where: { tenantId: { in: tenantIds } },
      select: {
        id: true,
        tenantId: true,
        subject: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      take: Math.min(Math.max(limit, 1), 100),
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async resolveTenantIds(context: PublicApiContext) {
    if (context.tenantId) return [context.tenantId];
    if (!context.organizationId) return [];
    const branches = await this.prisma.branch.findMany({
      where: { organizationId: context.organizationId },
      select: { tenantId: true },
    });
    return branches.map((branch) => branch.tenantId);
  }
}
