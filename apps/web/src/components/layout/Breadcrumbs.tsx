import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  parents: 'Parents',
  batches: 'Batches',
  faculty: 'Faculty',
  attendance: 'Attendance',
  tests: 'Tests',
  fees: 'Fees',
  reports: 'Reports',
  settings: 'Settings',
  create: 'Create',
  edit: 'Edit',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            {isLast ? (
              <span className="text-gray-700 font-medium">{label}</span>
            ) : (
              <Link
                to={path}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
