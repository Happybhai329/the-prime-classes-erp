// ============================================================
// @prime/shared-types — DTO Interfaces
// Shared request/response shapes for API, Web, and Mobile
// ============================================================

import {
  UserRole,
  Gender,
  StudentStatus,
  TargetExam,
  AttendanceStatus,
  TestType,
  TestStatus,
  InvoiceStatus,
  PaymentMode,
  MaterialType,
  NotificationType,
  // Phase 3
  NoticePriority,
  NoticeTargetAudience,
  AnnouncementCategory,
  TicketStatus,
  TicketCategory,
  DocumentType,
  // Phase 4
  FeeType,
  InstallmentType,
  StudentFeeStatus,
  DiscountType,
  DiscountMode,
  RefundStatus,
} from './enums';

// ---- Common ----

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ---- Auth ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ---- User ----

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLogin: string | null;
  student?: StudentSummary;
  parent?: ParentSummary;
  faculty?: FacultySummary;
}

// ---- Student ----

export interface StudentSummary {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
  targetExam: TargetExam[];
}

export interface StudentDetail extends StudentSummary {
  dob: string;
  gender: Gender;
  schoolName: string;
  classStudying: string;
  address: Address;
  admissionDate: string;
  photoUrl: string | null;
  documents: Record<string, string>;
  batches: BatchSummary[];
  parents: ParentSummary[];
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  schoolName: string;
  classStudying: string;
  address: Address;
  targetExam: TargetExam[];
  batchId?: string;
  parentPhone?: string;
  parentName?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// ---- Parent ----

export interface ParentSummary {
  id: string;
  fatherName: string;
  motherName: string;
  fatherPhone: string;
  motherPhone: string;
}

// ---- Faculty ----

export interface FacultySummary {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  specialization: string[];
}

// ---- Batch ----

export interface BatchSummary {
  id: string;
  name: string;
  code: string;
  targetExam: TargetExam;
  academicYear: string;
  isActive: boolean;
  studentCount?: number;
}

export interface BatchDetail extends BatchSummary {
  startDate: string;
  endDate: string;
  maxStrength: number;
  timing: BatchTiming;
  classTeacher: FacultySummary | null;
  subjects: SubjectWithFaculty[];
}

export interface BatchTiming {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface SubjectWithFaculty {
  id: string;
  name: string;
  code: string;
  faculty: FacultySummary | null;
}

// ---- Attendance ----

export interface MarkAttendanceRequest {
  records: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface AttendanceReportItem {
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

// ---- Tests ----

export interface TestSummary {
  id: string;
  name: string;
  testType: TestType;
  testDate: string;
  totalMarks: number;
  status: TestStatus;
  batchName: string;
}

export interface TestMarksEntry {
  studentId: string;
  marksObtained: number;
  subjectMarks: Record<string, number>;
  isAbsent: boolean;
  remarks?: string;
}

export interface TestRankingItem {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  batchRank: number;
  overallRank: number;
  grade: string;
}

export interface StudentPerformanceTrend {
  testId: string;
  testName: string;
  testDate: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  batchRank: number;
}

// ---- Fees (Phase 4 — Complete Fee Management) ----

export interface FeeInvoiceSummary {
  id: string;
  invoiceNumber: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAmount: number;
}

export interface RecordPaymentRequest {
  studentFeeId: string;
  installmentId?: string;
  amountPaid: number;
  paymentMode: PaymentMode;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
  isAdvance?: boolean;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  invoiceId: string;
}

// ---- Fee Plans ----

export interface FeePlanSummary {
  id: string;
  name: string;
  course: string | null;
  academicYear: string;
  feeType: FeeType;
  totalFee: number;
  installmentType: InstallmentType;
  batchName: string | null;
  isActive: boolean;
  assignedStudents: number;
}

export interface FeePlanDetail extends FeePlanSummary {
  description: string | null;
  registrationFee: number;
  admissionFee: number;
  monthlyFee: number;
  materialFee: number;
  examFee: number;
  amount: number;
  dueDay: number | null;
  batchId: string | null;
  createdAt: string;
}

export interface CreateFeePlanRequest {
  name: string;
  course?: string;
  academicYear: string;
  feeType: FeeType;
  installmentType: InstallmentType;
  batchId?: string;
  description?: string;
  registrationFee?: number;
  admissionFee?: number;
  monthlyFee?: number;
  materialFee?: number;
  examFee?: number;
  totalFee: number;
  amount?: number;
  dueDay?: number;
  customInstallments?: CustomInstallmentInput[];
}

export interface CustomInstallmentInput {
  label: string;
  amount: number;
  dueDate: string;
}

export interface UpdateFeePlanRequest {
  name?: string;
  course?: string;
  academicYear?: string;
  feeType?: FeeType;
  installmentType?: InstallmentType;
  batchId?: string;
  description?: string;
  registrationFee?: number;
  admissionFee?: number;
  monthlyFee?: number;
  materialFee?: number;
  examFee?: number;
  totalFee?: number;
  amount?: number;
  dueDay?: number;
  isActive?: boolean;
}

// ---- Student Fee Assignment ----

export interface StudentFeeAssignment {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  batchName: string;
  feePlanName: string;
  academicYear: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: StudentFeeStatus;
  assignedAt: string;
}

export interface StudentFeeDetail extends StudentFeeAssignment {
  installments: InstallmentItem[];
  payments: PaymentDetail[];
  discounts: DiscountDetail[];
  refunds: RefundDetail[];
}

export interface AssignFeePlanRequest {
  feeStructureId: string;
  studentId: string;
  academicYear: string;
}

export interface BulkAssignFeePlanRequest {
  feeStructureId: string;
  academicYear: string;
  studentIds?: string[];
  batchId?: string;
}

// ---- Installments ----

export interface InstallmentItem {
  id: string;
  installmentNo: number;
  label: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  status: InvoiceStatus;
  outstandingAmount: number;
}

// ---- Payments ----

export interface PaymentDetail {
  id: string;
  studentName: string;
  rollNumber: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  transactionId: string | null;
  receiptNumber: string;
  collectedByName: string;
  notes: string | null;
  isAdvance: boolean;
  installmentLabel: string | null;
  feePlanName: string | null;
  createdAt: string;
}

export interface PaymentAdjustmentRequest {
  paymentId: string;
  adjustedAmount: number;
  reason: string;
}

// ---- Receipts ----

export interface ReceiptDetail {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  feeDescription: string;
  qrData: string;
  generatedAt: string;
  instituteName?: string;
  instituteLogo?: string;
}

// ---- Discounts / Scholarships ----

export interface DiscountDetail {
  id: string;
  discountType: DiscountType;
  discountMode: DiscountMode;
  value: number;
  amount: number;
  reason: string | null;
  approvedByName: string | null;
  createdAt: string;
}

export interface ApplyDiscountRequest {
  studentFeeId: string;
  discountType: DiscountType;
  discountMode: DiscountMode;
  value: number;
  reason?: string;
}

// ---- Refunds ----

export interface RefundDetail {
  id: string;
  studentFeeId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedByName: string;
  approvedByName: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface CreateRefundRequest {
  studentFeeId: string;
  paymentId?: string;
  amount: number;
  reason: string;
}

export interface UpdateRefundStatusRequest {
  status: RefundStatus;
}

// ---- Fee Dashboard ----

export interface FeeDashboardData {
  revenueThisMonth: number;
  revenueThisYear: number;
  pendingFees: number;
  overdueAmount: number;
  collectionRate: number;
  refundAmount: number;
  totalStudentsWithFees: number;
  studentsFullyPaid: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  collections: number;
}

export interface BatchRevenueChartData {
  batchName: string;
  totalFee: number;
  collected: number;
  outstanding: number;
}

export interface CollectionTrendData {
  date: string;
  amount: number;
  count: number;
}

export interface OutstandingTrendData {
  month: string;
  outstanding: number;
}

// ---- Fee Reports ----

export interface DailyCollectionReport {
  date: string;
  totalCollected: number;
  totalTransactions: number;
  byPaymentMode: { mode: PaymentMode; amount: number; count: number }[];
  transactions: PaymentDetail[];
}

export interface MonthlyCollectionReport {
  month: string;
  year: number;
  totalCollected: number;
  totalTransactions: number;
  dailyBreakdown: { date: string; amount: number }[];
  byPaymentMode: { mode: PaymentMode; amount: number; count: number }[];
}

export interface StudentLedger {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    batchName: string;
  };
  totalFee: number;
  totalDiscount: number;
  netFee: number;
  totalPaid: number;
  totalRefund: number;
  balance: number;
  entries: StudentLedgerEntry[];
}

export interface StudentLedgerEntry {
  date: string;
  description: string;
  type: 'FEE' | 'PAYMENT' | 'DISCOUNT' | 'REFUND';
  debit: number;
  credit: number;
  balance: number;
}

export interface BatchRevenueReport {
  batchId: string;
  batchName: string;
  totalStudents: number;
  totalFees: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  students: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    totalFee: number;
    paid: number;
    outstanding: number;
    status: StudentFeeStatus;
  }[];
}

export interface OutstandingReport {
  totalOutstanding: number;
  overdueAmount: number;
  upcomingDues: number;
  byBatch: {
    batchId: string;
    batchName: string;
    outstanding: number;
    studentCount: number;
  }[];
  students: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    batchName: string;
    outstanding: number;
    lastPaymentDate: string | null;
    nextDueDate: string | null;
  }[];
}

// ---- Parent Portal Fee View ----

export interface ParentFeeOverview {
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  nextDueDate: string | null;
  nextDueAmount: number;
}

export interface ParentFeeLedger {
  studentId: string;
  studentName: string;
  rollNumber: string;
  overview: ParentFeeOverview;
  feePlans: {
    feePlanName: string;
    totalAmount: number;
    paidAmount: number;
    status: StudentFeeStatus;
    installments: InstallmentItem[];
  }[];
  recentPayments: PaymentDetail[];
}

// ---- Study Materials ----

export interface StudyMaterialSummary {
  id: string;
  title: string;
  description: string;
  materialType: MaterialType;
  subjectName: string;
  batchName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  dueDate: string | null;
}

// ---- Notifications ----

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown>;
  sentAt: string;
  isRead: boolean;
}

export interface SendNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  targetRole?: UserRole[];
  targetIds?: string[];
  data?: Record<string, unknown>;
}

// ---- Dashboard ----

export interface AdminDashboard {
  totalStudents: number;
  activeStudents: number;
  totalBatches: number;
  totalFaculty: number;
  todayAttendancePercentage: number;
  pendingFees: number;
  upcomingTests: TestSummary[];
  recentNotifications: NotificationItem[];
}

export interface StudentDashboard {
  attendancePercentage: number;
  lastTestRank: number | null;
  totalTests: number;
  pendingFees: number;
  upcomingTests: TestSummary[];
  recentRankings: StudentPerformanceTrend[];
  unreadNotifications: number;
}

export interface ParentDashboard {
  children: {
    studentId: string;
    studentName: string;
    attendancePercentage: number;
    lastTestRank: number | null;
    pendingFees: number;
  }[];
  unreadNotifications: number;
}

// ---- Attendance (Phase 2) ----

export interface AttendanceSessionSummary {
  id: string;
  batchId: string;
  batchName: string;
  sessionDate: string;
  sessionType: string;
  subjectName: string | null;
  takenByName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  isFinalized: boolean;
}

export interface AttendanceSessionDetail extends AttendanceSessionSummary {
  records: {
    id: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    status: AttendanceStatus;
    remarks: string | null;
  }[];
}

export interface AttendanceDashboardData {
  todaySessions: number;
  todayBatchesCovered: number;
  todayTotalStudents: number;
  todayPresentCount: number;
  todayPercentage: number;
  weeklyTrend: { date: string; percentage: number }[];
  batchWiseSummary: {
    batchId: string;
    batchName: string;
    todayPercentage: number;
    markedToday: boolean;
  }[];
}

export interface AttendanceAnalytics {
  overallPercentage: number;
  absenceTrend: { date: string; absentCount: number }[];
  topDefaulters: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    batchName: string;
    absentCount: number;
    percentage: number;
  }[];
  perfectAttendance: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    batchName: string;
    totalDays: number;
  }[];
}

export interface CreateAttendanceSessionRequest {
  batchId: string;
  sessionDate: string;
  sessionType: string;
  subjectId?: string;
  records: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface BulkAttendanceRequest {
  sessions: CreateAttendanceSessionRequest[];
}

// ---- Tests (Phase 2) ----

export interface CreateTestRequest {
  name: string;
  testType: TestType;
  batchId: string;
  subjectIds: string[];
  totalMarks: number;
  durationMinutes?: number;
  testDate: string;
}

export interface UpdateTestRequest {
  name?: string;
  testType?: TestType;
  subjectIds?: string[];
  totalMarks?: number;
  durationMinutes?: number;
  testDate?: string;
  status?: TestStatus;
}

export interface TestDetail {
  id: string;
  name: string;
  testType: TestType;
  testDate: string;
  totalMarks: number;
  durationMinutes: number | null;
  status: TestStatus;
  batch: BatchSummary;
  subjectIds: string[];
  subjectNames: string[];
  createdBy: string;
  createdAt: string;
  marksCount: number;
  rankingsComputed: boolean;
}

export interface BulkMarkEntryRequest {
  marks: TestMarksEntry[];
}

export interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  average: number;
  highest: number;
  lowest: number;
  totalStudents: number;
  absentCount: number;
}

// ---- Merit List (Phase 2) ----

export interface MeritListItem {
  rank: number;
  studentId: string;
  studentName: string;
  rollNumber: string;
  batchName: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  percentile: number;
  grade: string;
}

export interface MeritListResponse {
  testName?: string;
  batchName?: string;
  examType?: string;
  generatedAt: string;
  totalStudents: number;
  items: MeritListItem[];
}

// ---- Student Performance (Phase 2) ----

export interface StudentPerformanceProfile {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    batchName: string;
  };
  attendance: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    percentage: number;
    monthlyTrend: { month: string; percentage: number }[];
  };
  tests: {
    totalTests: number;
    averagePercentage: number;
    bestRank: number | null;
    recentTests: StudentPerformanceTrend[];
    rankTrend: { testName: string; testDate: string; rank: number }[];
    subjectStrengths: { subject: string; avgPercentage: number }[];
    weakAreas: { subject: string; avgPercentage: number }[];
  };
  marksProgress: { testName: string; testDate: string; percentage: number }[];
}

// ---- Parent Portal (Phase 2) ----

export interface ParentChildDetail {
  studentId: string;
  studentName: string;
  rollNumber: string;
  batchName: string;
  attendancePercentage: number;
  recentTests: {
    testName: string;
    testDate: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    batchRank: number | null;
  }[];
  rankTrend: { testName: string; rank: number }[];
  attendanceTrend: { date: string; status: string }[];
  pendingFees: number;
}

export interface ParentPortalDashboard {
  children: ParentChildDetail[];
  unreadNotifications: number;
  upcomingTests: TestSummary[];
  recentNotices: NotificationItem[];
}

// ============================================================
// Phase 3 — Notice Management
// ============================================================

export interface NoticeItem {
  id: string;
  title: string;
  description: string;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  batchIds: string[];
  publishDate: string;
  expiryDate: string | null;
  isPublished: boolean;
  createdBy: string;
  createdByName: string;
  isRead?: boolean;
  createdAt: string;
}

export interface CreateNoticeRequest {
  title: string;
  description: string;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  batchIds?: string[];
  publishDate: string;
  expiryDate?: string;
}

export interface UpdateNoticeRequest {
  title?: string;
  description?: string;
  priority?: NoticePriority;
  targetAudience?: NoticeTargetAudience;
  batchIds?: string[];
  publishDate?: string;
  expiryDate?: string;
  isPublished?: boolean;
}

// ============================================================
// Phase 3 — Announcement System
// ============================================================

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  attachments: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  category: AnnouncementCategory;
  attachmentUrls?: string[];
  scheduledAt?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  category?: AnnouncementCategory;
  attachmentUrls?: string[];
  scheduledAt?: string;
}

// ============================================================
// Phase 3 — Communication Center (Tickets)
// ============================================================

export interface TicketItem {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  assignedToName: string | null;
  lastMessage: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDetail extends TicketItem {
  messages: TicketMessageItem[];
}

export interface TicketMessageItem {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  category: TicketCategory;
  message: string;
}

export interface ReplyTicketRequest {
  message: string;
  attachmentUrl?: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

// ============================================================
// Phase 3 — Document Center
// ============================================================

export interface DocumentItem {
  id: string;
  title: string;
  documentType: DocumentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string | null;
  version: number;
  studentId: string | null;
  studentName: string | null;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

export interface UploadDocumentRequest {
  title: string;
  documentType: DocumentType;
  studentId?: string;
}

// ============================================================
// Phase 3 — Audit & Activity Logs
// ============================================================

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditActivityFeed {
  logs: AuditLogItem[];
  meta: PaginationMeta;
}

// ============================================================
// Phase 3 — Enhanced Parent Portal
// ============================================================

export type PerformanceCategory = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';

export interface ParentDashboardEnhanced extends ParentPortalDashboard {
  children: (ParentChildDetail & {
    performanceCategory: PerformanceCategory;
  })[];
}

export interface SubjectAnalysisItem {
  subjectId: string;
  subjectName: string;
  averagePercentage: number;
  testCount: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ============================================================
// Phase 3 — Mobile API Types
// ============================================================

export interface MobileDeviceRegisterRequest {
  fcmToken: string;
  platform: 'ANDROID' | 'IOS';
  deviceId: string;
}

export interface MobileApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// ============================================================
// Phase 8 — Multi-Tenant SaaS & Franchise Management DTOs
// ============================================================

export interface RegisterTenantRequest {
  name: string;
  slug: string;
  ownerEmail: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface CreateAdminRequest {
  tenantId: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface ProvisionTenantRequest {
  tenantId: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
  planId: string;
  customDomain?: string;
}

export interface SaaSPlanSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  billingCycle: string;
  isActive: boolean;
  featureFlags: Record<string, boolean>;
}

export interface SubscriptionDetail {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  renewalDate: string | null;
}

export interface SaaSInvoiceSummary {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  planName: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
}

export interface BrandingSettings {
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  sidebarBg?: string;
  tagline?: string;
  emailBranding?: {
    senderName?: string;
    senderEmail?: string;
    footerText?: string;
  };
  pdfBranding?: {
    headerLogo?: string;
    footerText?: string;
    showWatermark?: boolean;
  };
}

export interface FranchiseReportSummary {
  organizationId: string;
  organizationName: string;
  totalStudents: number;
  totalRevenue: number;
  branchPerformance: {
    branchId: string;
    branchName: string;
    branchCode: string;
    studentCount: number;
    revenue: number;
    activeUsersCount: number;
  }[];
  facultyCount: number;
  enrollmentTrends: {
    month: string;
    studentCount: number;
  }[];
}

export interface TenantUsageSummary {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  planName: string;
  activeUsers: number;
  storageUsageBytes: number;
  apiCallsCount: number;
  healthScore: number;
}

