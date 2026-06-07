import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prime/shared-types';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to set required permissions on a route.
 *
 * Usage:
 *   @Permissions(Permission.STUDENT_READ, Permission.STUDENT_WRITE)
 *   @Get('students')
 *   findAll() { ... }
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
