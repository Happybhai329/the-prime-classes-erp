import { Injectable, NotFoundException } from '@nestjs/common';
import { RollupPeriodType } from '@prime/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { FranchiseBillingService } from '../franchise-billing/franchise-billing.service';
import { ResourceCenterService } from '../resource-center/resource-center.service';

@Injectable()
export class PartnerPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enterprise: EnterpriseService,
    private readonly franchiseBilling: FranchiseBillingService,
    private readonly resources: ResourceCenterService,
  ) {}

  async getPortal(tenantId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { tenantId },
      include: { organization: true },
    });
    if (!branch) {
      throw new NotFoundException(
        'This tenant is not linked to a franchise organization',
      );
    }

    const [dashboard, performance, statements, resources, academicAssets] =
      await Promise.all([
        this.enterprise.getDashboard(
          branch.organizationId,
          RollupPeriodType.DAILY,
        ),
        this.franchiseBilling.getPerformance(branch.organizationId),
        this.franchiseBilling.listStatements(branch.organizationId),
        this.resources.listItems(branch.organizationId, tenantId),
        this.resources.listSharedAssets(branch.organizationId, tenantId),
      ]);

    return {
      organization: {
        id: branch.organization.id,
        name: branch.organization.name,
      },
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
      },
      dashboard,
      performance,
      statements,
      resources,
      academicAssets,
    };
  }
}
