import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Layers,
  UserCog,
  CalendarCheck,
  ClipboardList,
  IndianRupee,
  BarChart3,
  Settings,
} from 'lucide-react';
import { Permission } from '@prime/shared-types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const sidebarNavigation: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permissions: [], // All authenticated users
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Students',
        path: '/students',
        icon: GraduationCap,
        permissions: [Permission.STUDENT_READ],
      },
      {
        label: 'Parents',
        path: '/parents',
        icon: Users,
        permissions: [Permission.PARENT_READ],
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: Layers,
        permissions: [Permission.BATCH_READ],
      },
      {
        label: 'Faculty',
        path: '/faculty',
        icon: UserCog,
        permissions: [Permission.FACULTY_READ],
      },
    ],
  },
  {
    title: 'Academics',
    items: [
      {
        label: 'Attendance',
        path: '/attendance',
        icon: CalendarCheck,
        permissions: [Permission.ATTENDANCE_MARK],
      },
      {
        label: 'Tests',
        path: '/tests',
        icon: ClipboardList,
        permissions: [Permission.TEST_VIEW_ALL],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Fees',
        path: '/fees',
        icon: IndianRupee,
        permissions: [Permission.FEE_VIEW_ALL],
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        label: 'Reports',
        path: '/reports',
        icon: BarChart3,
        permissions: [Permission.REPORT_ALL, Permission.REPORT_BATCH],
      },
    ],
  },
  {
    items: [
      {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        permissions: [], // All authenticated users
      },
    ],
  },
];
