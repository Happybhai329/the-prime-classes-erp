// ============================================================
// @prime/shared-types — RBAC Permissions
// Granular permission constants and role-permission mapping
// ============================================================

export enum Permission {
  // Tenant
  TENANT_MANAGE = 'tenant:manage',

  // Users
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // Students
  STUDENT_READ = 'student:read',
  STUDENT_WRITE = 'student:write',
  STUDENT_DELETE = 'student:delete',
  STUDENT_IMPORT = 'student:import',
  STUDENT_READ_OWN = 'student:read:own',

  // Parents
  PARENT_READ = 'parent:read',
  PARENT_WRITE = 'parent:write',
  PARENT_READ_OWN = 'parent:read:own',

  // Faculty
  FACULTY_READ = 'faculty:read',
  FACULTY_WRITE = 'faculty:write',

  // Batches
  BATCH_READ = 'batch:read',
  BATCH_WRITE = 'batch:write',
  BATCH_DELETE = 'batch:delete',

  // Subjects
  SUBJECT_READ = 'subject:read',
  SUBJECT_WRITE = 'subject:write',

  // Attendance
  ATTENDANCE_MARK = 'attendance:mark',
  ATTENDANCE_READ_ALL = 'attendance:read:all',
  ATTENDANCE_READ_OWN = 'attendance:read:own',
  ATTENDANCE_REPORT = 'attendance:report',

  // Tests
  TEST_CREATE = 'test:create',
  TEST_EDIT = 'test:edit',
  TEST_DELETE = 'test:delete',
  TEST_MARKS_ENTRY = 'test:marks:entry',
  TEST_PUBLISH = 'test:publish',
  TEST_VIEW_ALL = 'test:view:all',
  TEST_VIEW_OWN = 'test:view:own',

  // Fees
  FEE_STRUCTURE_MANAGE = 'fee:structure:manage',
  FEE_INVOICE_MANAGE = 'fee:invoice:manage',
  FEE_COLLECT = 'fee:collect',
  FEE_VIEW_ALL = 'fee:view:all',
  FEE_VIEW_OWN = 'fee:view:own',
  FEE_REPORT = 'fee:report',

  // Materials
  MATERIAL_UPLOAD = 'material:upload',
  MATERIAL_DOWNLOAD = 'material:download',
  MATERIAL_DELETE = 'material:delete',

  // Notifications
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_BROADCAST = 'notification:broadcast',
  NOTIFICATION_VIEW_OWN = 'notification:view:own',

  // Reports
  REPORT_ALL = 'report:all',
  REPORT_BATCH = 'report:batch',
  REPORT_OWN = 'report:own',

  // Audit
  AUDIT_VIEW = 'audit:view',

  // Notices (Phase 3)
  NOTICE_CREATE = 'notice:create',
  NOTICE_EDIT = 'notice:edit',
  NOTICE_DELETE = 'notice:delete',
  NOTICE_VIEW = 'notice:view',

  // Announcements (Phase 3)
  ANNOUNCEMENT_CREATE = 'announcement:create',
  ANNOUNCEMENT_VIEW = 'announcement:view',

  // Communication / Tickets (Phase 3)
  TICKET_CREATE = 'ticket:create',
  TICKET_VIEW_ALL = 'ticket:view:all',
  TICKET_VIEW_OWN = 'ticket:view:own',
  TICKET_RESPOND = 'ticket:respond',

  // Documents (Phase 3)
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_VIEW_ALL = 'document:view:all',
  DOCUMENT_VIEW_OWN = 'document:view:own',
  DOCUMENT_DELETE = 'document:delete',
}

import { UserRole } from './enums';

/**
 * Role → Permission mapping.
 * Used by the RBAC guard to authorize requests.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // Full access

  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.STUDENT_READ,
    Permission.STUDENT_WRITE,
    Permission.STUDENT_DELETE,
    Permission.STUDENT_IMPORT,
    Permission.PARENT_READ,
    Permission.PARENT_WRITE,
    Permission.FACULTY_READ,
    Permission.FACULTY_WRITE,
    Permission.BATCH_READ,
    Permission.BATCH_WRITE,
    Permission.BATCH_DELETE,
    Permission.SUBJECT_READ,
    Permission.SUBJECT_WRITE,
    Permission.ATTENDANCE_MARK,
    Permission.ATTENDANCE_READ_ALL,
    Permission.ATTENDANCE_REPORT,
    Permission.TEST_CREATE,
    Permission.TEST_EDIT,
    Permission.TEST_DELETE,
    Permission.TEST_MARKS_ENTRY,
    Permission.TEST_PUBLISH,
    Permission.TEST_VIEW_ALL,
    Permission.FEE_STRUCTURE_MANAGE,
    Permission.FEE_INVOICE_MANAGE,
    Permission.FEE_COLLECT,
    Permission.FEE_VIEW_ALL,
    Permission.FEE_REPORT,
    Permission.MATERIAL_UPLOAD,
    Permission.MATERIAL_DOWNLOAD,
    Permission.MATERIAL_DELETE,
    Permission.NOTIFICATION_SEND,
    Permission.NOTIFICATION_BROADCAST,
    Permission.NOTIFICATION_VIEW_OWN,
    Permission.REPORT_ALL,
    Permission.REPORT_BATCH,
    Permission.AUDIT_VIEW,
    // Phase 3
    Permission.NOTICE_CREATE,
    Permission.NOTICE_EDIT,
    Permission.NOTICE_DELETE,
    Permission.NOTICE_VIEW,
    Permission.ANNOUNCEMENT_CREATE,
    Permission.ANNOUNCEMENT_VIEW,
    Permission.TICKET_CREATE,
    Permission.TICKET_VIEW_ALL,
    Permission.TICKET_VIEW_OWN,
    Permission.TICKET_RESPOND,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VIEW_ALL,
    Permission.DOCUMENT_VIEW_OWN,
    Permission.DOCUMENT_DELETE,
  ],

  [UserRole.FACULTY]: [
    Permission.STUDENT_READ,
    Permission.BATCH_READ,
    Permission.SUBJECT_READ,
    Permission.ATTENDANCE_MARK,
    Permission.ATTENDANCE_READ_ALL,
    Permission.ATTENDANCE_REPORT,
    Permission.TEST_CREATE,
    Permission.TEST_EDIT,
    Permission.TEST_MARKS_ENTRY,
    Permission.TEST_PUBLISH,
    Permission.TEST_VIEW_ALL,
    Permission.MATERIAL_UPLOAD,
    Permission.MATERIAL_DOWNLOAD,
    Permission.NOTIFICATION_SEND,
    Permission.NOTIFICATION_VIEW_OWN,
    Permission.REPORT_BATCH,
    // Phase 3
    Permission.NOTICE_CREATE,
    Permission.NOTICE_VIEW,
    Permission.ANNOUNCEMENT_VIEW,
    Permission.TICKET_VIEW_ALL,
    Permission.TICKET_VIEW_OWN,
    Permission.TICKET_RESPOND,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VIEW_ALL,
  ],

  [UserRole.STUDENT]: [
    Permission.STUDENT_READ_OWN,
    Permission.BATCH_READ,
    Permission.ATTENDANCE_READ_OWN,
    Permission.TEST_VIEW_OWN,
    Permission.FEE_VIEW_OWN,
    Permission.MATERIAL_DOWNLOAD,
    Permission.NOTIFICATION_VIEW_OWN,
    Permission.REPORT_OWN,
  ],

  [UserRole.PARENT]: [
    Permission.PARENT_READ_OWN,
    Permission.ATTENDANCE_READ_OWN,
    Permission.TEST_VIEW_OWN,
    Permission.FEE_VIEW_OWN,
    Permission.NOTIFICATION_VIEW_OWN,
    Permission.REPORT_OWN,
    // Phase 3
    Permission.NOTICE_VIEW,
    Permission.ANNOUNCEMENT_VIEW,
    Permission.TICKET_CREATE,
    Permission.TICKET_VIEW_OWN,
    Permission.DOCUMENT_VIEW_OWN,
  ],

  [UserRole.ACCOUNTANT]: [
    Permission.STUDENT_READ,
    Permission.BATCH_READ,
    Permission.FEE_STRUCTURE_MANAGE,
    Permission.FEE_INVOICE_MANAGE,
    Permission.FEE_COLLECT,
    Permission.FEE_VIEW_ALL,
    Permission.FEE_REPORT,
    Permission.NOTIFICATION_VIEW_OWN,
    Permission.REPORT_ALL,
  ],
};
