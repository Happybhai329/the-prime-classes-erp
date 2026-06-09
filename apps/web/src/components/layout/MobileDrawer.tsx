import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_PERMISSIONS, type UserRole, type Permission } from '@prime/shared-types';
import { sidebarNavigation } from '@/config/navigation';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const userPermissions: Permission[] = user
    ? ROLE_PERMISSIONS[user.role as UserRole] || []
    : [];

  const hasPermission = (required: Permission[]): boolean => {
    if (required.length === 0) return true;
    if (user?.role === 'SUPER_ADMIN') return true;
    return required.some((p) => userPermissions.includes(p));
  };

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" id="mobile-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 left-0 w-[280px] h-full bg-white shadow-xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-gray-900">
                The Prime Classes
              </h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                ERP System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sidebarNavigation.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) =>
              hasPermission(item.permissions),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx}>
                {section.title && (
                  <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + '/');
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
