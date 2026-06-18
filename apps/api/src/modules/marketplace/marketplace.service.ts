import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMarketplaceAppDto,
  InstallMarketplaceAppDto,
} from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async createApp(userId: string, dto: CreateMarketplaceAppDto) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.marketplaceApp.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          publisher: dto.publisher,
          description: dto.description || null,
          scopes: dto.scopes,
          manifest: dto.manifest as any,
          submittedBy: userId,
          status: 'REVIEW',
        },
      });

      if (dto.extensionPoints?.length) {
        await tx.extensionPoint.createMany({
          data: dto.extensionPoints.map((type) => ({
            appId: app.id,
            type: type as any,
            name: type,
          })),
        });
      }
      return app;
    });
  }

  listApps(includeUnpublished = false) {
    return this.prisma.marketplaceApp.findMany({
      where: includeUnpublished ? {} : { status: 'PUBLISHED' },
      include: { extensionPoints: true, themePackages: true },
      orderBy: { name: 'asc' },
    });
  }

  publishApp(appId: string) {
    return this.prisma.marketplaceApp.update({
      where: { id: appId },
      data: { status: 'PUBLISHED' },
    });
  }

  async installApp(
    appId: string,
    userId: string,
    dto: InstallMarketplaceAppDto,
  ) {
    const app = await this.prisma.marketplaceApp.findUnique({
      where: { id: appId },
    });
    if (!app || app.status !== 'PUBLISHED') {
      throw new NotFoundException('Published marketplace app not found');
    }
    if (dto.scope === 'TENANT' && !dto.tenantId) {
      throw new BadRequestException('tenantId is required for tenant installs');
    }
    if (dto.scope === 'ORGANIZATION' && !dto.organizationId) {
      throw new BadRequestException(
        'organizationId is required for organization installs',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const installation = await tx.marketplaceInstallation.create({
        data: {
          appId,
          organizationId: dto.organizationId || null,
          tenantId: dto.tenantId || null,
          scope: dto.scope as any,
          config: (dto.config as any) || {},
          installedBy: userId,
        },
      });
      await tx.marketplacePermissionGrant.createMany({
        data: dto.permissions.map((permission) => ({
          installationId: installation.id,
          permission,
        })),
        skipDuplicates: true,
      });
      return installation;
    });
  }

  listInstallations(organizationId?: string, tenantId?: string) {
    return this.prisma.marketplaceInstallation.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(tenantId ? { tenantId } : {}),
      },
      include: {
        app: { include: { extensionPoints: true } },
        permissionGrants: true,
      },
      orderBy: { installedAt: 'desc' },
    });
  }

  async issueContextToken(installationId: string, userId: string) {
    const installation = await this.prisma.marketplaceInstallation.findUnique({
      where: { id: installationId },
      include: { permissionGrants: true, app: true },
    });
    if (!installation || installation.status !== 'ACTIVE') {
      throw new NotFoundException('Active marketplace installation not found');
    }

    return {
      token: this.jwt.sign(
        {
          type: 'marketplace-context',
          installationId: installation.id,
          appId: installation.appId,
          appSlug: installation.app.slug,
          userId,
          organizationId: installation.organizationId,
          tenantId: installation.tenantId,
          permissions: installation.permissionGrants.map(
            (grant) => grant.permission,
          ),
        },
        { expiresIn: '5m' },
      ),
      expiresIn: 300,
    };
  }
}
