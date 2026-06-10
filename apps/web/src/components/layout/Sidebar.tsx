import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_PERMISSIONS, type UserRole, type Permission } from '@prime/shared-types';
import { sidebarNavigation } from '@/config/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
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

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
      id="sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-display font-bold text-gray-900 truncate">
              The Prime Classes
            </h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              ERP System
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sidebarNavigation.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) =>
            hasPermission(item.permissions),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx}>
              {section.title && !isCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path ||
                    location.pathname.startsWith(item.path + '/');
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 ${
                          isActive
                            ? 'text-primary-700'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                      {isActive && (
                        <div className="absolute left-0 w-[3px] h-6 bg-primary-700 rounded-r-full" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        id="sidebar-toggle"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
};
