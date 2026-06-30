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
  Bell,
  Megaphone,
  LifeBuoy,
  FileText,
  ShieldCheck,
  BookOpen,
  Calendar,
  Home,
  PhoneCall,
  Award,
  Briefcase,
} from 'lucide-react';
import { Permission } from '@prime/shared-types';
import type React from 'react';

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
    title: 'Sales',
    items: [
      {
        label: 'Sales Dashboard',
        path: '/sales/dashboard',
        icon: LayoutDashboard,
        permissions: [Permission.SALES_DASHBOARD_VIEW],
      },
      {
        label: 'Enquiries',
        path: '/sales/enquiries',
        icon: ClipboardList,
        permissions: [Permission.ENQUIRY_READ],
      },
      {
        label: 'Follow-ups',
        path: '/sales/followups',
        icon: PhoneCall,
        permissions: [Permission.FOLLOWUP_READ],
      },
      {
        label: 'Admissions',
        path: '/sales/admissions',
        icon: Award,
        permissions: [Permission.ADMISSION_READ],
      },
      {
        label: 'Counsellors',
        path: '/sales/counsellors',
        icon: Briefcase,
        permissions: [Permission.COUNSELLOR_READ],
      },
      {
        label: 'Sales Reports',
        path: '/sales/reports',
        icon: BarChart3,
        permissions: [Permission.SALES_REPORT_VIEW],
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
      {
        label: 'Subjects',
        path: '/subjects',
        icon: Layers,
        permissions: [Permission.SUBJECT_READ],
      },
    ],
  },
  {
    title: 'LMS & Testing',
    items: [
      {
        label: 'Study Materials',
        path: '/materials',
        icon: FileText,
        permissions: [Permission.MATERIAL_DOWNLOAD],
      },
      {
        label: 'Digital Library',
        path: '/library',
        icon: GraduationCap,
        permissions: [Permission.MATERIAL_DOWNLOAD],
      },
      {
        label: 'Assignments',
        path: '/assignments',
        icon: ClipboardList,
        permissions: [Permission.ASSIGNMENT_SUBMIT, Permission.ASSIGNMENT_CREATE],
      },
      {
        label: 'Homework',
        path: '/homework',
        icon: BookOpen,
        permissions: [Permission.ASSIGNMENT_SUBMIT, Permission.ASSIGNMENT_CREATE],
      },
      {
        label: 'Online Tests',
        path: '/online-tests',
        icon: ClipboardList,
        permissions: [Permission.ONLINE_TEST_TAKE, Permission.ONLINE_TEST_MANAGE],
      },
      {
        label: 'Question Bank',
        path: '/question-bank',
        icon: Layers,
        permissions: [Permission.QUESTION_BANK_MANAGE],
      },
      {
        label: 'Leaderboard',
        path: '/leaderboard',
        icon: BarChart3,
        permissions: [],
      },
    ],
  },
  {
    title: 'Portals & Calendar',
    items: [
      {
        label: 'Student Portal',
        path: '/student-portal',
        icon: Home,
        permissions: [Permission.STUDENT_READ_OWN],
      },
      {
        label: 'Parent Portal',
        path: '/parent-portal-v2',
        icon: Users,
        permissions: [Permission.PARENT_READ_OWN],
      },
      {
        label: 'Academic Calendar',
        path: '/academic-calendar',
        icon: Calendar,
        permissions: [Permission.CALENDAR_EVENT_VIEW],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Fee Dashboard',
        path: '/fees',
        icon: IndianRupee,
        permissions: [Permission.FEE_VIEW_ALL],
      },
      {
        label: 'Fee Plans',
        path: '/fees/plans',
        icon: Layers,
        permissions: [Permission.FEE_STRUCTURE_MANAGE],
      },
      {
        label: 'Student Fees',
        path: '/fees/student-fees',
        icon: Users,
        permissions: [Permission.FEE_VIEW_ALL],
      },
      {
        label: 'Payments',
        path: '/fees/payments',
        icon: IndianRupee,
        permissions: [Permission.FEE_COLLECT],
      },
      {
        label: 'Receipts',
        path: '/fees/receipts',
        icon: FileText,
        permissions: [Permission.FEE_RECEIPT_VIEW],
      },
      {
        label: 'Refunds & Discounts',
        path: '/fees/refunds',
        icon: ShieldCheck,
        permissions: [Permission.FEE_REFUND_MANAGE],
      },
      {
        label: 'Fee Reports',
        path: '/fees/reports',
        icon: BarChart3,
        permissions: [Permission.FEE_REPORT],
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
      {
        label: 'Parent Portal',
        path: '/parent-portal',
        icon: Users,
        permissions: [Permission.REPORT_OWN],
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Notice Board',
        path: '/notices',
        icon: Bell,
        permissions: [Permission.NOTICE_VIEW],
      },
      {
        label: 'Announcements',
        path: '/announcements',
        icon: Megaphone,
        permissions: [Permission.ANNOUNCEMENT_VIEW],
      },
      {
        label: 'Support Tickets',
        path: '/tickets',
        icon: LifeBuoy,
        permissions: [Permission.TICKET_VIEW_OWN, Permission.TICKET_VIEW_ALL],
      },
    ],
  },
  {
    title: 'Resources & System',
    items: [
      {
        label: 'Documents',
        path: '/documents',
        icon: FileText,
        permissions: [Permission.DOCUMENT_VIEW_OWN, Permission.DOCUMENT_VIEW_ALL],
      },
      {
        label: 'Audit Logs',
        path: '/audit',
        icon: ShieldCheck,
        permissions: [Permission.AUDIT_VIEW],
      },
      {
        label: 'Users',
        path: '/users',
        icon: Users,
        permissions: [Permission.USER_READ],
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        permissions: [], // All authenticated users
      },
    ],
  },
  {
    title: 'SaaS & Franchise',
    items: [
      {
        label: 'Head Office Portal',
        path: '/franchise',
        icon: Layers,
        permissions: [Permission.FRANCHISE_VIEW],
      },
      {
        label: 'Super Admin Portal',
        path: '/super-admin',
        icon: ShieldCheck,
        permissions: [Permission.TENANT_MANAGE],
      },
    ],
  },
];
