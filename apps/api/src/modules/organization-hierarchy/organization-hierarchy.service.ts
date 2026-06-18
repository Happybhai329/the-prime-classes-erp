import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationUnitType } from '@prime/shared-types';
import { PrismaService } from '../../database/prisma.service';
import {
  AssignOrganizationScopeDto,
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
} from './dto/organization-hierarchy.dto';

@Injectable()
export class OrganizationHierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(organizationId: string) {
    const units = await this.prisma.organizationUnit.findMany({
      where: { organizationId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    const byId = new Map<string, any>();
    units.forEach((unit) => byId.set(unit.id, { ...unit, children: [] }));

    const roots: any[] = [];
    byId.forEach((unit) => {
      if (unit.parentId && byId.has(unit.parentId)) {
        byId.get(unit.parentId).children.push(unit);
      } else {
        roots.push(unit);
      }
    });

    return roots;
  }

  async createUnit(dto: CreateOrganizationUnitDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.parentId) {
        const parent = await tx.organizationUnit.findFirst({
          where: { id: dto.parentId, organizationId: dto.organizationId },
        });
        if (!parent) {
          throw new NotFoundException('Parent organization unit not found');
        }
      }

      const unit = await tx.organizationUnit.create({
        data: {
          organizationId: dto.organizationId,
          parentId: dto.parentId || null,
          branchId: dto.branchId || null,
          tenantId: dto.tenantId || null,
          type: dto.type as any,
          name: dto.name,
          code: dto.code,
          slug: dto.slug,
          address: (dto.address as any) || {},
          geo: (dto.geo as any) || {},
          metadata: (dto.metadata as any) || {},
        },
      });

      await tx.organizationUnitClosure.create({
        data: {
          organizationId: dto.organizationId,
          ancestorId: unit.id,
          descendantId: unit.id,
          depth: 0,
        },
      });

      if (dto.parentId) {
        const parentLinks = await tx.organizationUnitClosure.findMany({
          where: { descendantId: dto.parentId },
        });

        await tx.organizationUnitClosure.createMany({
          data: parentLinks.map((link) => ({
            organizationId: dto.organizationId,
            ancestorId: link.ancestorId,
            descendantId: unit.id,
            depth: link.depth + 1,
          })),
          skipDuplicates: true,
        });
      }

      return unit;
    });
  }

  async updateUnit(id: string, dto: UpdateOrganizationUnitDto) {
    return this.prisma.organizationUnit.update({
      where: { id },
      data: {
        ...dto,
        metadata: dto.metadata ? (dto.metadata as any) : undefined,
      },
    });
  }

  async assignScope(dto: AssignOrganizationScopeDto) {
    return this.prisma.userOrganizationScope.create({
      data: {
        userId: dto.userId,
        organizationId: dto.organizationId,
        organizationUnitId: dto.organizationUnitId || null,
        tenantId: dto.tenantId || null,
        scopeType: dto.scopeType as any,
        permissions: dto.permissions,
      },
    });
  }

  async listScopes(organizationId: string) {
    return this.prisma.userOrganizationScope.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, email: true, role: true } },
        organizationUnit: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async backfillExistingBranches(organizationId?: string) {
    const organizations = await this.prisma.organization.findMany({
      where: organizationId ? { id: organizationId } : {},
      include: { branches: true },
    });

    const results: { organizationId: string; rootId: string; branches: number }[] = [];

    for (const org of organizations) {
      const root = await this.prisma.organizationUnit.upsert({
        where: {
          organizationId_code: {
            organizationId: org.id,
            code: 'ORG',
          },
        },
        update: {
          name: org.name,
          slug: org.slug,
          type: OrganizationUnitType.ORGANIZATION as any,
        },
        create: {
          organizationId: org.id,
          name: org.name,
          code: 'ORG',
          slug: org.slug,
          type: OrganizationUnitType.ORGANIZATION as any,
        },
      });

      await this.ensureClosure(root.id, root.id, org.id, 0);

      let branchCount = 0;
      for (const branch of org.branches) {
        const branchUnit = await this.prisma.organizationUnit.upsert({
          where: {
            organizationId_code: {
              organizationId: org.id,
              code: branch.code,
            },
          },
          update: {
            parentId: root.id,
            branchId: branch.id,
            tenantId: branch.tenantId,
            name: branch.name,
            slug: branch.code.toLowerCase(),
            type: OrganizationUnitType.BRANCH as any,
          },
          create: {
            organizationId: org.id,
            parentId: root.id,
            branchId: branch.id,
            tenantId: branch.tenantId,
            name: branch.name,
            code: branch.code,
            slug: branch.code.toLowerCase(),
            type: OrganizationUnitType.BRANCH as any,
          },
        });

        await this.ensureClosure(branchUnit.id, branchUnit.id, org.id, 0);
        await this.ensureClosure(root.id, branchUnit.id, org.id, 1);
        branchCount++;
      }

      results.push({ organizationId: org.id, rootId: root.id, branches: branchCount });
    }

    return results;
  }

  private async ensureClosure(
    ancestorId: string,
    descendantId: string,
    organizationId: string,
    depth: number,
  ) {
    await this.prisma.organizationUnitClosure.upsert({
      where: { ancestorId_descendantId: { ancestorId, descendantId } },
      update: { depth },
      create: { ancestorId, descendantId, organizationId, depth },
    });
  }
}
