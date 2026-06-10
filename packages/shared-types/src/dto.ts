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

// ---- Fees ----

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
  invoiceId: string;
  amountPaid: number;
  paymentMode: PaymentMode;
  remarks?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  invoiceId: string;
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

