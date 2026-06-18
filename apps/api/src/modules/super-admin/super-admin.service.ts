import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SaaSPlanSummary, SubscriptionDetail, SaaSInvoiceSummary, TenantUsageSummary } from '@prime/shared-types';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────
  // TENANTS MANAGEMENT
  // ──────────────────────────────────────────────────

  async getTenants() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        users: { select: { id: true } },
      },
    });

    return Promise.all(
      tenants.map(async (t) => {
        const activeSub = t.subscriptions[0];
        const activeUsersCount = await this.prisma.user.count({
          where: { tenantId: t.id, isActive: true },
        });

        // Sum file sizes
        const materialsSize = await this.prisma.material.aggregate({
          where: { tenantId: t.id },
          _sum: { fileSize: true },
        });
        const docsSize = await this.prisma.document.aggregate({
          where: { tenantId: t.id },
          _sum: { fileSize: true },
        });
        const totalStorage = (materialsSize._sum.fileSize || 0) + (docsSize._sum.fileSize || 0);

        // API calls count (mock or audit logs)
        const apiCalls = await this.prisma.auditLog.count({
          where: { tenantId: t.id },
        });

        // Calculate a mock dynamic health score
        const studentCount = await this.prisma.student.count({ where: { tenantId: t.id } });
        const batchCount = await this.prisma.batch.count({ where: { tenantId: t.id } });
        let healthScore = 75; // baseline
        if (studentCount > 0) {
          healthScore = Math.min(100, Math.max(30, 50 + studentCount * 5 + batchCount * 10 - (t.isActive ? 0 : 40)));
        }

        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          isActive: t.isActive,
          customDomain: t.customDomain,
          domainVerified: t.domainVerified,
          plan: activeSub?.plan?.name || 'FREE',
          activeUsers: activeUsersCount,
          storageUsageBytes: totalStorage,
          apiCallsCount: apiCalls || 120, // default placeholder for view
          healthScore,
          createdAt: t.createdAt.toISOString(),
        };
      })
    );
  }

  async toggleTenantStatus(id: string, isActive: boolean) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  }

  // ──────────────────────────────────────────────────
  // PLANS & SUBSCRIPTIONS
  // ──────────────────────────────────────────────────

  async getPlans() {
    const plans = await this.prisma.plan.findMany({
      include: { featureFlags: true },
    });

    return plans.map((p) => {
      const flags: Record<string, boolean> = {};
      p.featureFlags.forEach((ff) => {
        flags[ff.featureKey] = ff.isEnabled;
      });

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        billingCycle: p.billingCycle,
        isActive: p.isActive,
        featureFlags: flags,
      };
    });
  }

  async upgradePlan(tenantId: string, planId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Deactivate previous active subscriptions
    await this.prisma.subscription.updateMany({
      where: { tenantId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    // Create new subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Generate SaaS Invoice
    const count = await this.prisma.saaSInvoice.count();
    const invoiceNumber = `INV-SAAS-${(count + 1).toString().padStart(6, '0')}`;
    
    await this.prisma.saaSInvoice.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        invoiceNumber,
        amount: plan.price,
        status: 'PAID', // auto paid for simulation
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
        paymentMethod: 'RAZORPAY',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return subscription;
  }

  // ──────────────────────────────────────────────────
  // BILLING & ANALYTICS
  // ──────────────────────────────────────────────────

  async getRevenueStats() {
    const invoices = await this.prisma.saaSInvoice.findMany({
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.plan.price), 0);
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    // Group invoices by month for revenue chart
    const monthlyRevenue: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status === 'PAID') {
        const month = inv.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(inv.amount);
      }
    });

    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      mrr,
      totalRevenue,
      chartData,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        tenantName: inv.tenant.name,
        amount: Number(inv.amount),
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
        paidAt: inv.paidAt?.toISOString() || null,
      })),
    };
  }

  // ──────────────────────────────────────────────────
  // SUPPORT TICKETS
  // ──────────────────────────────────────────────────

  async getTickets() {
    return this.prisma.supportTicket.findMany({
      include: {
        tenant: { select: { name: true } },
        creator: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respondToTicket(ticketId: string, senderId: string, content: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Support ticket not found');

    await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        content,
      },
    });

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED', updatedAt: new Date() },
    });
  }
}
