import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BrandingSettings } from '@prime/shared-types';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        customDomain: true,
        domainVerified: true,
        brandColors: true,
        emailBranding: true,
        pdfBranding: true,
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateBranding(tenantId: string, dto: BrandingSettings) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        logoUrl: dto.logoUrl,
        brandColors: {
          primaryColor: dto.primaryColor || '#1a365d',
          secondaryColor: dto.secondaryColor || '#319795',
          sidebarBg: dto.sidebarBg || '#ffffff',
          tagline: dto.tagline || '',
        },
        emailBranding: dto.emailBranding ? dto.emailBranding : undefined,
        pdfBranding: dto.pdfBranding ? dto.pdfBranding : undefined,
      },
    });
  }

  async verifyCustomDomain(tenantId: string, customDomain: string) {
    if (!customDomain || !customDomain.includes('.')) {
      throw new BadRequestException('Invalid custom domain format');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: customDomain.toLowerCase().trim(),
        domainVerified: true,
        dnsConfigured: true,
      },
    });
  }
}
