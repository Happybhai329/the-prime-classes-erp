import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, ROLE_PERMISSIONS, UserRole } from '@prime/shared-types';
import { PERMISSIONS_KEY } from '../decorators';
import { IS_PUBLIC_KEY } from '../decorators';

/**
 * RBAC Guard — checks if the authenticated user has the required permissions.
 *
 * Permissions are resolved from the user's role via ROLE_PERMISSIONS mapping.
 * Super Admins bypass all permission checks.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions for this route
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions specified, allow access (authenticated is enough)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // Super Admin bypasses all permission checks
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Get user's permissions based on their role
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];

    // Check if user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
