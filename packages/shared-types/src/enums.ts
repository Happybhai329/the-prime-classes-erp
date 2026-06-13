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
  NAVODAYA = 'NAVODAYA',
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
  REGISTRATION = 'REGISTRATION',
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
  CARD = 'CARD',
}

// ---- Fees Phase 4 ----

export enum InstallmentType {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM',
}

export enum StudentFeeStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export enum DiscountType {
  MERIT_SCHOLARSHIP = 'MERIT_SCHOLARSHIP',
  STAFF_DISCOUNT = 'STAFF_DISCOUNT',
  SIBLING_DISCOUNT = 'SIBLING_DISCOUNT',
  PROMOTIONAL_DISCOUNT = 'PROMOTIONAL_DISCOUNT',
  CUSTOM = 'CUSTOM',
}

export enum DiscountMode {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
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
  // Phase 3
  LOW_ATTENDANCE_ALERT = 'LOW_ATTENDANCE_ALERT',
  TEST_SCHEDULED = 'TEST_SCHEDULED',
  RESULT_PUBLISHED = 'RESULT_PUBLISHED',
  NOTICE_PUBLISHED = 'NOTICE_PUBLISHED',
  // Phase 4
  FEE_PAYMENT_RECEIVED = 'FEE_PAYMENT_RECEIVED',
  FEE_OVERDUE_REMINDER = 'FEE_OVERDUE_REMINDER',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
}

export enum NotificationDeliveryStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

// ---- Notices (Phase 3) ----

export enum NoticePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NoticeTargetAudience {
  ALL_STUDENTS = 'ALL_STUDENTS',
  SPECIFIC_BATCH = 'SPECIFIC_BATCH',
  SPECIFIC_PARENT_GROUP = 'SPECIFIC_PARENT_GROUP',
  FACULTY = 'FACULTY',
  ALL = 'ALL',
}

// ---- Announcements (Phase 3) ----

export enum AnnouncementCategory {
  ACADEMIC = 'ACADEMIC',
  HOLIDAY = 'HOLIDAY',
  EXAM = 'EXAM',
  EMERGENCY = 'EMERGENCY',
  GENERAL = 'GENERAL',
}

// ---- Communication / Tickets (Phase 3) ----

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketCategory {
  ACADEMIC = 'ACADEMIC',
  ATTENDANCE = 'ATTENDANCE',
  FEES = 'FEES',
  TECHNICAL = 'TECHNICAL',
  GENERAL = 'GENERAL',
}

// ---- Documents (Phase 3) ----

export enum DocumentType {
  REPORT_CARD = 'REPORT_CARD',
  ADMIT_CARD = 'ADMIT_CARD',
  TEST_REPORT = 'TEST_REPORT',
  CERTIFICATE = 'CERTIFICATE',
  NOTICE_PDF = 'NOTICE_PDF',
  OTHER = 'OTHER',
}

// ---- Phase 5 Enums ----

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionType {
  MCQ = 'MCQ',
  NUMERICAL = 'NUMERICAL',
  TRUE_FALSE = 'TRUE_FALSE',
  SUBJECTIVE = 'SUBJECTIVE',
}

export enum OnlineTestMode {
  PRACTICE = 'PRACTICE',
  MOCK = 'MOCK',
  SCHOLARSHIP = 'SCHOLARSHIP',
  ENTRANCE_SIMULATION = 'ENTRANCE_SIMULATION',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED',
  ABANDONED = 'ABANDONED',
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  LATE = 'LATE',
}

export enum AchievementType {
  BADGE = 'BADGE',
  POINTS = 'POINTS',
  LEVEL_UP = 'LEVEL_UP',
}

export enum VideoProvider {
  MINIO = 'MINIO',
  YOUTUBE = 'YOUTUBE',
  VIMEO = 'VIMEO',
  AWS_MEDIACONVERT = 'AWS_MEDIACONVERT',
  M3U8 = 'M3U8',
}
