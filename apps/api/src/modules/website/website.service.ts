import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WebsiteService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(tenantId?: string, customDomain?: string) {
    if (!tenantId && !customDomain) {
      throw new NotFoundException('Tenant ID or domain required');
    }

    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    } else if (customDomain) {
      where.tenant = { customDomain };
    }

    const website = await this.prisma.tenantWebsite.findFirst({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            brandColors: true,
            customDomain: true,
          },
        },
      },
    });

    if (!website) {
      throw new NotFoundException('Website config not found');
    }

    return website;
  }

  async getConfig(tenantId: string) {
    let website = await this.prisma.tenantWebsite.findUnique({
      where: { tenantId },
    });

    if (!website) {
      website = await this.prisma.tenantWebsite.create({
        data: {
          tenantId,
          branding: {},
          landingPage: {
            heroTitle: 'Welcome to our Institute',
            heroSubtitle: 'Empowering minds, securing futures.',
            features: [],
            testimonials: [],
          },
          courses: [],
          results: [],
          faculty: [],
          contact: {},
          seo: {
            title: 'Prime Institute',
            description: 'Academics and coaching programs',
            keywords: 'coaching, scholarship, training',
          },
        },
      });
    }

    return website;
  }

  async updateConfig(tenantId: string, data: any) {
    const website = await this.getConfig(tenantId);

    return this.prisma.tenantWebsite.update({
      where: { id: website.id },
      data: {
        branding: data.branding ?? undefined,
        landingPage: data.landingPage ?? undefined,
        courses: data.courses ?? undefined,
        results: data.results ?? undefined,
        faculty: data.faculty ?? undefined,
        contact: data.contact ?? undefined,
        seo: data.seo ?? undefined,
        isActive: data.isActive ?? undefined,
      },
    });
  }
}
