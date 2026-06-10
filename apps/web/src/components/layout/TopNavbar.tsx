import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { NotificationPopover } from './NotificationPopover';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';

interface TopNavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onMenuClick,
  isSidebarCollapsed,
}) => {
  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      }`}
      id="top-navbar"
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Open menu"
          id="mobile-menu-button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <NotificationPopover />

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gray-200 mx-2" />

        <UserMenu />
      </div>
    </header>
  );
};
