import { TenantMiddleware } from './tenant.middleware';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prime/shared-types';

describe('Tenant Isolation & Authorization Specs', () => {
  let middleware: TenantMiddleware;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    middleware = new TenantMiddleware(mockPrisma as any);
  });

  describe('TenantMiddleware', () => {
    it('should resolve tenant via x-tenant-slug header', async () => {
      const activeTenant = { id: 'tenant-1', slug: 'jpr-01', isActive: true };
      mockPrisma.tenant.findUnique.mockResolvedValue(activeTenant);

      const req: any = {
        headers: {
          'x-tenant-slug': 'jpr-01',
        },
      };
      const res: any = {};
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'jpr-01' },
      });
      expect(req.tenant).toEqual(activeTenant);
      expect(req.tenantId).toBe('tenant-1');
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 status if tenant is suspended/inactive', async () => {
      const inactiveTenant = { id: 'tenant-2', slug: 'del-02', isActive: false };
      mockPrisma.tenant.findUnique.mockResolvedValue(inactiveTenant);

      const req: any = {
        headers: {
          'x-tenant-slug': 'del-02',
        },
      };
      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      const res: any = {
        status: statusMock,
      };
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'This institute account has been suspended. Please contact the administrator.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should resolve tenant via subdomain hostname', async () => {
      const activeTenant = { id: 'tenant-3', slug: 'delhi', isActive: true };
      mockPrisma.tenant.findUnique.mockResolvedValue(activeTenant);

      const req: any = {
        headers: {
          host: 'delhi.primeclasses.in',
        },
      };
      const res: any = {};
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'delhi' },
      });
      expect(req.tenant).toEqual(activeTenant);
      expect(req.tenantId).toBe('tenant-3');
      expect(next).toHaveBeenCalled();
    });

    it('should resolve tenant via verified custom domain', async () => {
      const activeTenant = { id: 'tenant-4', slug: 'military', isActive: true, customDomain: 'militaryprep.edu', domainVerified: true };
      mockPrisma.tenant.findFirst.mockResolvedValue(activeTenant);

      const req: any = {
        headers: {
          host: 'militaryprep.edu:8080',
        },
      };
      const res: any = {};
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
        where: {
          customDomain: 'militaryprep.edu',
          domainVerified: true,
        },
      });
      expect(req.tenant).toEqual(activeTenant);
      expect(req.tenantId).toBe('tenant-4');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('SuperAdminGuard', () => {
    let guard: SuperAdminGuard;

    beforeEach(() => {
      guard = new SuperAdminGuard();
    });

    it('should authorize a user with SUPER_ADMIN role', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: UserRole.SUPER_ADMIN,
            },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny and throw ForbiddenException for non-SUPER_ADMIN role', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: UserRole.ADMIN,
            },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException('Only system Super Admins are authorized for this action')
      );
    });

    it('should deny and throw ForbiddenException if user is missing', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException('Only system Super Admins are authorized for this action')
      );
    });
  });
});
