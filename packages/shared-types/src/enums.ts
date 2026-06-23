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

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
}

export enum SaaSInvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

export enum FeatureKey {
  LMS = 'LMS',
  MOBILE_APPS = 'MOBILE_APPS',
  AI_ANALYTICS = 'AI_ANALYTICS',
  ONLINE_TESTING = 'ONLINE_TESTING',
  PARENT_PORTAL = 'PARENT_PORTAL',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
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

export enum SupportPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
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

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  ASSIGNMENT = 'ASSIGNMENT',
}

export enum CalendarEventType {
  HOLIDAY = 'HOLIDAY',
  EVENT = 'EVENT',
  EXAM = 'EXAM',
  IMPORTANT_DATE = 'IMPORTANT_DATE',
}

export enum VideoProvider {
  MINIO = 'MINIO',
  YOUTUBE = 'YOUTUBE',
  VIMEO = 'VIMEO',
  AWS_MEDIACONVERT = 'AWS_MEDIACONVERT',
  M3U8 = 'M3U8',
}

// ---- CRM, Admissions & Marketing Automation (Phase 9) ----

export enum LeadSource {
  WEBSITE_FORM = 'WEBSITE_FORM',
  GOOGLE_ADS = 'GOOGLE_ADS',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
  WHATSAPP = 'WHATSAPP',
  MANUAL = 'MANUAL',
}

export enum LeadStatus {
  INQUIRY = 'INQUIRY',
  COUNSELING = 'COUNSELING',
  DOCUMENT_COLLECTION = 'DOCUMENT_COLLECTION',
  FEE_PAYMENT = 'FEE_PAYMENT',
  ADMISSION_CONFIRMED = 'ADMISSION_CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ENROLLED = 'ENROLLED',
}

export enum DocumentVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum CampaignType {
  ADMISSION = 'ADMISSION',
  SCHOLARSHIP = 'SCHOLARSHIP',
  EVENT = 'EVENT',
}

export enum CampaignChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum EventType {
  SEMINAR = 'SEMINAR',
  PARENT_MEETING = 'PARENT_MEETING',
  SCHOLARSHIP_TEST = 'SCHOLARSHIP_TEST',
  ADMISSION_DRIVE = 'ADMISSION_DRIVE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum LeadActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  NOTE = 'NOTE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  FOLLOW_UP_SCHEDULED = 'FOLLOW_UP_SCHEDULED',
}

// ---- Enterprise Platform (Phase 10) ----

export enum OrganizationUnitType {
  ORGANIZATION = 'ORGANIZATION',
  REGION = 'REGION',
  ZONE = 'ZONE',
  STATE = 'STATE',
  CITY = 'CITY',
  INSTITUTE = 'INSTITUTE',
  BRANCH = 'BRANCH',
}

export enum OrganizationScopeType {
  ORGANIZATION = 'ORGANIZATION',
  UNIT = 'UNIT',
  TENANT = 'TENANT',
  BRANCH = 'BRANCH',
}

export enum BranchHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  CRITICAL = 'CRITICAL',
  SUSPENDED = 'SUSPENDED',
  UNKNOWN = 'UNKNOWN',
}

export enum RollupPeriodType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum FranchiseAgreementStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum RoyaltyLedgerStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  DISPUTED = 'DISPUTED',
}

export enum FranchiseInvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

export enum PayoutStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  HELD = 'HELD',
}

export enum SsoProtocol {
  OIDC = 'OIDC',
  SAML = 'SAML',
}

export enum MfaFactorType {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WEBAUTHN = 'WEBAUTHN',
}

export enum ApiClientStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum MarketplaceScope {
  TENANT = 'TENANT',
  ORGANIZATION = 'ORGANIZATION',
}

export enum MarketplaceInstallationStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  REMOVED = 'REMOVED',
}

export enum MarketplaceAppStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  SUSPENDED = 'SUSPENDED',
}

export enum ExtensionPointType {
  DASHBOARD_WIDGET = 'DASHBOARD_WIDGET',
  CRM_ACTION = 'CRM_ACTION',
  REPORT_EXPORTER = 'REPORT_EXPORTER',
  COMMUNICATION_PROVIDER = 'COMMUNICATION_PROVIDER',
  PAYMENT_PROVIDER = 'PAYMENT_PROVIDER',
  CONTENT_PACK = 'CONTENT_PACK',
  THEME = 'THEME',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

export enum ResourceAssetType {
  CURRICULUM = 'CURRICULUM',
  QUESTION_BANK = 'QUESTION_BANK',
  MATERIAL = 'MATERIAL',
  CAMPAIGN_TEMPLATE = 'CAMPAIGN_TEMPLATE',
  POSTER = 'POSTER',
  SOCIAL_MEDIA_KIT = 'SOCIAL_MEDIA_KIT',
  ADMISSION_MATERIAL = 'ADMISSION_MATERIAL',
  REPORT_TEMPLATE = 'REPORT_TEMPLATE',
}

export enum ResourceVisibility {
  INTERNAL = 'INTERNAL',
  PARTNER = 'PARTNER',
  PUBLIC = 'PUBLIC',
}
