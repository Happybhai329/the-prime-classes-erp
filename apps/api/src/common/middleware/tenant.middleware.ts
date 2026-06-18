import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const tenantHeader = req.headers['x-tenant-slug'] as string;

    let tenant = null;

    if (tenantHeader) {
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: tenantHeader },
      });
    } else {
      // Resolve from hostname/subdomain
      // e.g. jaipur.primeclasses.in or localhost:3000
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'superadmin') {
        const subdomain = parts[0];
        tenant = await this.prisma.tenant.findUnique({
          where: { slug: subdomain },
        });
      } else {
        // Check custom domain
        const cleanHost = host.split(':')[0]; // remove port if any
        tenant = await this.prisma.tenant.findFirst({
          where: {
            customDomain: cleanHost,
            domainVerified: true,
          },
        });
      }
    }

    if (tenant) {
      if (!tenant.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This institute account has been suspended. Please contact the administrator.',
        });
      }
      (req as any).tenant = tenant;
      (req as any).tenantId = tenant.id;
    }

    next();
  }
}
