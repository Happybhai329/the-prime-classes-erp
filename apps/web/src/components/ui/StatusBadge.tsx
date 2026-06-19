import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-600' },
  PASSED_OUT: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Passed Out' },
  DROPPED: { bg: 'bg-red-50', text: 'text-red-700' },
  PRESENT: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  ABSENT: { bg: 'bg-red-50', text: 'text-red-700' },
  LATE: { bg: 'bg-amber-50', text: 'text-amber-700' },
  LEAVE: { bg: 'bg-purple-50', text: 'text-purple-700' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700' },
  PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PARTIAL: { bg: 'bg-blue-50', text: 'text-blue-700' },
  OVERDUE: { bg: 'bg-red-50', text: 'text-red-700' },
  WAIVED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600' },
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700' },
  ONGOING: { bg: 'bg-amber-50', text: 'text-amber-700' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PUBLISHED: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  TRANSFERRED: { bg: 'bg-purple-50', text: 'text-purple-700' },
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-700' },
  IN_PROGRESS: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'In Progress' },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CLOSED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  URGENT: { bg: 'bg-red-50', text: 'text-red-700' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-700' },
  NORMAL: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  const label = config.label || status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {label}
    </span>
  );
};
