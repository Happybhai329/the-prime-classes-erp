import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prime/shared-types';
import { PrismaService } from '../../database/prisma.service';
import {
  ORG_SCOPE_KEY,
  OrganizationScopeRequirement,
} from './org-scope.decorator';

@Injectable()
export class OrganizationScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<OrganizationScopeRequirement>(
      ORG_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Organization access denied');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const organizationId = await this.resolveOrganizationId(request, user.tenantId);
    if (!organizationId) {
      throw new ForbiddenException('Organization context is required');
    }

    const explicitScope = await this.prisma.userOrganizationScope.findFirst({
      where: {
        userId: user.sub || user.id,
        organizationId,
        isActive: true,
        ...(requirement.permission
          ? { permissions: { has: requirement.permission } }
          : {}),
      },
    });

    if (explicitScope) {
      request.organizationId = organizationId;
      request.organizationScope = explicitScope;
      return true;
    }

    const branch = await this.prisma.branch.findUnique({
      where: { tenantId: user.tenantId },
      select: { organizationId: true },
    });

    if (
      user.role === UserRole.ADMIN &&
      branch?.organizationId === organizationId
    ) {
      request.organizationId = organizationId;
      return true;
    }

    throw new ForbiddenException('Organization access denied');
  }

  private async resolveOrganizationId(request: any, tenantId?: string) {
    const requested =
      request.params?.organizationId ||
      request.params?.orgId ||
      request.query?.organizationId ||
      request.body?.organizationId;

    if (requested) {
      return requested;
    }

    if (!tenantId) {
      return null;
    }

    const branch = await this.prisma.branch.findUnique({
      where: { tenantId },
      select: { organizationId: true },
    });

    return branch?.organizationId || null;
  }
}
