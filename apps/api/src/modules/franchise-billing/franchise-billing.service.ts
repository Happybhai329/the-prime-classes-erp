import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateFranchiseAgreementDto,
  CreateFranchiseInvoiceDto,
  CreateFranchiseOwnerDto,
  GenerateRoyaltyDto,
} from './dto/franchise-billing.dto';

@Injectable()
export class FranchiseBillingService {
  constructor(private readonly prisma: PrismaService) {}

  createOwner(organizationId: string, dto: CreateFranchiseOwnerDto) {
    return this.prisma.franchiseOwner.create({
      data: {
        organizationId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        taxId: dto.taxId || null,
        address: (dto.address as any) || {},
      },
    });
  }

  listOwners(organizationId: string) {
    return this.prisma.franchiseOwner.findMany({
      where: { organizationId },
      include: {
        agreements: {
          include: { branch: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createAgreement(
    organizationId: string,
    dto: CreateFranchiseAgreementDto,
  ) {
    const owner = await this.prisma.franchiseOwner.findFirst({
      where: { id: dto.ownerId, organizationId },
    });
    if (!owner) {
      throw new NotFoundException('Franchise owner not found');
    }

    let tenantId = dto.tenantId || null;
    if (dto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: dto.branchId, organizationId },
      });
      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
      tenantId = branch.tenantId;
    }

    if (!tenantId) {
      throw new BadRequestException(
        'A branchId or tenantId is required for a franchise agreement',
      );
    }

    return this.prisma.franchiseAgreement.create({
      data: {
        organizationId,
        ownerId: dto.ownerId,
        branchId: dto.branchId || null,
        tenantId,
        agreementNumber: dto.agreementNumber,
        status: 'ACTIVE',
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        franchiseFee: dto.franchiseFee,
        platformCharge: dto.platformCharge,
        royaltyPercent: dto.royaltyPercent,
        terms: (dto.terms as any) || {},
      },
    });
  }

  listAgreements(organizationId: string) {
    return this.prisma.franchiseAgreement.findMany({
      where: { organizationId },
      include: { owner: true, branch: true, revenueRules: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateRoyalties(organizationId: string, dto: GenerateRoyaltyDto) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const agreements = await this.prisma.franchiseAgreement.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
        tenantId: { not: null },
        startDate: { lte: periodEnd },
        OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
      },
    });

    const ledgers = [];
    for (const agreement of agreements) {
      const revenue = await this.prisma.feePayment.aggregate({
        where: {
          tenantId: agreement.tenantId!,
          paymentDate: { gte: periodStart, lte: periodEnd },
          deletedAt: null,
        },
        _sum: { amountPaid: true },
      });
      const grossRevenue = Number(revenue._sum.amountPaid || 0);
      const royaltyAmount =
        (grossRevenue * Number(agreement.royaltyPercent)) / 100;
      const platformCharge = Number(agreement.platformCharge);
      const payoutAmount = Math.max(
        0,
        grossRevenue - royaltyAmount - platformCharge,
      );

      const existing = await this.prisma.royaltyLedger.findFirst({
        where: { agreementId: agreement.id, periodStart, periodEnd },
      });
      const data = {
        branchId: agreement.branchId,
        tenantId: agreement.tenantId!,
        grossRevenue,
        royaltyAmount,
        platformCharge,
        payoutAmount,
        status: 'POSTED' as const,
        metadata: {
          royaltyPercent: Number(agreement.royaltyPercent),
        },
        computedAt: new Date(),
      };

      const ledger = existing
        ? await this.prisma.royaltyLedger.update({
            where: { id: existing.id },
            data,
          })
        : await this.prisma.royaltyLedger.create({
            data: {
              agreementId: agreement.id,
              periodStart,
              periodEnd,
              ...data,
            },
          });

      ledgers.push(ledger);
    }

    return ledgers;
  }

  async getPerformance(organizationId: string, ownerId?: string) {
    const ledgers = await this.prisma.royaltyLedger.findMany({
      where: {
        agreement: {
          organizationId,
          ...(ownerId ? { ownerId } : {}),
        },
      },
      include: {
        agreement: { include: { branch: true } },
      },
      orderBy: { periodStart: 'desc' },
    });

    const branchIds = new Set(
      ledgers.map((item) => item.branchId).filter(Boolean),
    );
    const tenantIds = Array.from(
      new Set(ledgers.map((item) => item.tenantId)),
    );
    const totalStudents =
      tenantIds.length === 0
        ? 0
        : await this.prisma.student.count({
            where: { tenantId: { in: tenantIds }, deletedAt: null },
          });

    return {
      organizationId,
      ownerId,
      totalBranches: branchIds.size,
      totalStudents,
      grossRevenue: ledgers.reduce(
        (sum, item) => sum + Number(item.grossRevenue),
        0,
      ),
      royaltyDue: ledgers.reduce(
        (sum, item) => sum + Number(item.royaltyAmount),
        0,
      ),
      platformCharges: ledgers.reduce(
        (sum, item) => sum + Number(item.platformCharge),
        0,
      ),
      payoutDue: ledgers.reduce(
        (sum, item) => sum + Number(item.payoutAmount),
        0,
      ),
      ledgers: ledgers.map((item) => ({
        ...item,
        grossRevenue: Number(item.grossRevenue),
        royaltyAmount: Number(item.royaltyAmount),
        platformCharge: Number(item.platformCharge),
        payoutAmount: Number(item.payoutAmount),
      })),
    };
  }

  createInvoice(
    organizationId: string,
    dto: CreateFranchiseInvoiceDto,
  ) {
    return this.prisma.franchiseInvoice.create({
      data: {
        organizationId,
        ownerId: dto.ownerId,
        invoiceNumber: dto.invoiceNumber,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        lineItems: (dto.lineItems as any) || [],
      },
    });
  }

  listInvoices(organizationId: string) {
    return this.prisma.franchiseInvoice.findMany({
      where: { organizationId },
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateStatement(
    organizationId: string,
    ownerId: string,
    dto: GenerateRoyaltyDto,
  ) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const performance = await this.getPerformance(organizationId, ownerId);
    const statementNumber = `FST-${periodStart
      .toISOString()
      .slice(0, 7)
      .replace('-', '')}-${ownerId.slice(0, 8)}`;

    return this.prisma.franchiseStatement.upsert({
      where: { statementNumber },
      update: {
        periodStart,
        periodEnd,
        totals: {
          grossRevenue: performance.grossRevenue,
          royaltyAmount: performance.royaltyDue,
          platformCharge: performance.platformCharges,
          payoutAmount: performance.payoutDue,
        },
        generatedAt: new Date(),
      },
      create: {
        organizationId,
        ownerId,
        statementNumber,
        periodStart,
        periodEnd,
        totals: {
          grossRevenue: performance.grossRevenue,
          royaltyAmount: performance.royaltyDue,
          platformCharge: performance.platformCharges,
          payoutAmount: performance.payoutDue,
        },
      },
    });
  }

  listStatements(organizationId: string, ownerId?: string) {
    return this.prisma.franchiseStatement.findMany({
      where: { organizationId, ...(ownerId ? { ownerId } : {}) },
      include: { owner: true },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async generatePayoutReport(
    organizationId: string,
    ownerId: string,
    dto: GenerateRoyaltyDto,
  ) {
    const performance = await this.getPerformance(organizationId, ownerId);
    const reportNumber = `PAY-${dto.periodStart.slice(0, 7).replace('-', '')}-${ownerId.slice(0, 8)}`;

    return this.prisma.payoutReport.upsert({
      where: { reportNumber },
      update: {
        grossRevenue: performance.grossRevenue,
        deductions:
          performance.royaltyDue + performance.platformCharges,
        netPayout: performance.payoutDue,
        generatedAt: new Date(),
      },
      create: {
        organizationId,
        ownerId,
        reportNumber,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        grossRevenue: performance.grossRevenue,
        deductions:
          performance.royaltyDue + performance.platformCharges,
        netPayout: performance.payoutDue,
      },
    });
  }
}
