import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateResourceItemDto,
  CreateSharedAcademicAssetDto,
  PublishResourceDto,
} from './dto/resource-center.dto';

@Injectable()
export class ResourceCenterService {
  constructor(private readonly prisma: PrismaService) {}

  createItem(organizationId: string, dto: CreateResourceItemDto) {
    return this.prisma.resourceCenterItem.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description || null,
        assetType: dto.assetType as any,
        visibility: dto.visibility as any,
        fileUrl: dto.fileUrl || null,
        thumbnailUrl: dto.thumbnailUrl || null,
        metadata: (dto.metadata as any) || {},
        isPublished: dto.isPublished || false,
      },
    });
  }

  listItems(organizationId: string, tenantId?: string) {
    return this.prisma.resourceCenterItem.findMany({
      where: {
        organizationId,
        ...(tenantId
          ? {
              isPublished: true,
              publications: {
                some: {
                  status: 'PUBLISHED',
                  OR: [{ tenantId }, { tenantId: null, branchId: null }],
                },
              },
            }
          : {}),
      },
      include: { publications: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSharedAsset(
    organizationId: string,
    dto: CreateSharedAcademicAssetDto,
  ) {
    return this.prisma.sharedAcademicAsset.create({
      data: {
        organizationId,
        assetType: dto.assetType as any,
        title: dto.title,
        subject: dto.subject || null,
        course: dto.course || null,
        targetExam: dto.targetExam || null,
        payload: dto.payload as any,
      },
    });
  }

  listSharedAssets(organizationId: string, tenantId?: string) {
    return this.prisma.sharedAcademicAsset.findMany({
      where: {
        organizationId,
        ...(tenantId
          ? {
              isPublished: true,
              publications: {
                some: {
                  status: 'PUBLISHED',
                  OR: [{ tenantId }, { tenantId: null, branchId: null }],
                },
              },
            }
          : {}),
      },
      include: { publications: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async publishItem(
    organizationId: string,
    resourceItemId: string,
    dto: PublishResourceDto,
  ) {
    const resource = await this.prisma.resourceCenterItem.findFirst({
      where: { id: resourceItemId, organizationId },
    });
    if (!resource) {
      throw new NotFoundException('Resource center item not found');
    }

    await this.prisma.resourceCenterItem.update({
      where: { id: resource.id },
      data: { isPublished: true },
    });

    return this.prisma.resourcePublication.create({
      data: {
        organizationId,
        organizationUnitId: dto.organizationUnitId || null,
        branchId: dto.branchId || null,
        tenantId: dto.tenantId || null,
        resourceItemId,
        allowOverride: dto.allowOverride || false,
      },
    });
  }

  async publishSharedAsset(
    organizationId: string,
    sharedAssetId: string,
    dto: PublishResourceDto,
  ) {
    const asset = await this.prisma.sharedAcademicAsset.findFirst({
      where: { id: sharedAssetId, organizationId },
    });
    if (!asset) {
      throw new NotFoundException('Shared academic asset not found');
    }

    await this.prisma.sharedAcademicAsset.update({
      where: { id: asset.id },
      data: { isPublished: true },
    });

    return this.prisma.resourcePublication.create({
      data: {
        organizationId,
        organizationUnitId: dto.organizationUnitId || null,
        branchId: dto.branchId || null,
        tenantId: dto.tenantId || null,
        sharedAssetId,
        allowOverride: dto.allowOverride || false,
      },
    });
  }
}
