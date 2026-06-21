import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_PERMISSIONS, type UserRole, type Permission } from '@prime/shared-types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedPermissions?: Permission[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  allowedPermissions 
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user) {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    if (allowedPermissions && allowedPermissions.length > 0) {
      if (user.role !== 'SUPER_ADMIN') {
        const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
        const hasPermission = allowedPermissions.some((p) => userPermissions.includes(p));
        if (!hasPermission) {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
  }

  return <>{children}</>;
};
