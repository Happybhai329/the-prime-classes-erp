// ============================================================
// @prime/shared-types — Enumerations
// All enums shared between API, Web, and Mobile
// ============================================================

// ---- Authentication & Authorization ----

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
}

// ---- Tenant ----

export enum TenantPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// ---- Student ----

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PASSED_OUT = 'PASSED_OUT',
  DROPPED = 'DROPPED',
}

export enum TargetExam {
  SAINIK = 'SAINIK',
  RMS = 'RMS',
  RIMC = 'RIMC',
  SCHOLARSHIP = 'SCHOLARSHIP',
  FOUNDATION = 'FOUNDATION',
}

export enum ParentRelationship {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
}

// ---- Batch ----

export enum BatchStudentStatus {
  ACTIVE = 'ACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  COMPLETED = 'COMPLETED',
}

// ---- Attendance ----

export enum AttendanceSessionType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  SUBJECT = 'SUBJECT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
}

// ---- Tests ----

export enum TestType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  MOCK = 'MOCK',
  SCHOLARSHIP = 'SCHOLARSHIP',
  INTERNAL = 'INTERNAL',
}

export enum TestStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  PUBLISHED = 'PUBLISHED',
}

// ---- Fees ----

export enum FeeType {
  ADMISSION = 'ADMISSION',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  EXAM = 'EXAM',
  MATERIAL = 'MATERIAL',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export enum PaymentMode {
  CASH = 'CASH',
  RAZORPAY = 'RAZORPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  UPI = 'UPI',
}

// ---- Study Materials ----

export enum MaterialType {
  NOTES = 'NOTES',
  HOMEWORK = 'HOMEWORK',
  ASSIGNMENT = 'ASSIGNMENT',
  QUESTION_PAPER = 'QUESTION_PAPER',
  ANSWER_KEY = 'ANSWER_KEY',
  SYLLABUS = 'SYLLABUS',
}

// ---- Notifications ----

export enum NotificationType {
  ATTENDANCE = 'ATTENDANCE',
  TEST_RESULT = 'TEST_RESULT',
  FEE_DUE = 'FEE_DUE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EXAM_ALERT = 'EXAM_ALERT',
}

export enum NotificationDeliveryStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}
