import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { useAuthStore } from './store/auth.store';
import { Permission } from '@prime/shared-types';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const OnboardingWizard = lazy(() => import('./pages/auth/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));

// Phase 9 Pages
const CrmDashboard = lazy(() => import('./pages/crm/CrmDashboard').then(m => ({ default: m.CrmDashboard })));
const CounselorDashboard = lazy(() => import('./pages/crm/CounselorDashboard').then(m => ({ default: m.CounselorDashboard })));
const CampaignManager = lazy(() => import('./pages/crm/CampaignManager').then(m => ({ default: m.CampaignManager })));
const WebsiteBuilder = lazy(() => import('./pages/crm/WebsiteBuilder').then(m => ({ default: m.WebsiteBuilder })));
const PublicLandingPage = lazy(() => import('./pages/public/PublicLandingPage').then(m => ({ default: m.PublicLandingPage })));

// Super Admin & Franchise Settings (Phase 8)
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const HeadOfficeDashboard = lazy(() => import('./pages/franchise/HeadOfficeDashboard').then(m => ({ default: m.HeadOfficeDashboard })));
const BrandingSettingsPage = lazy(() => import('./pages/settings/BrandingSettingsPage').then(m => ({ default: m.BrandingSettingsPage })));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));

// Students
const StudentListPage = lazy(() => import('./pages/students/StudentListPage').then(m => ({ default: m.StudentListPage })));
const StudentDetailPage = lazy(() => import('./pages/students/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })));
const CreateStudentPage = lazy(() => import('./pages/students/CreateStudentPage').then(m => ({ default: m.CreateStudentPage })));
const EditStudentPage = lazy(() => import('./pages/students/EditStudentPage').then(m => ({ default: m.EditStudentPage })));

// Parents
const ParentListPage = lazy(() => import('./pages/parents/ParentListPage').then(m => ({ default: m.ParentListPage })));
const ParentDetailPage = lazy(() => import('./pages/parents/ParentDetailPage').then(m => ({ default: m.ParentDetailPage })));
const CreateParentPage = lazy(() => import('./pages/parents/CreateParentPage').then(m => ({ default: m.CreateParentPage })));
const EditParentPage = lazy(() => import('./pages/parents/EditParentPage').then(m => ({ default: m.EditParentPage })));

// Batches
const BatchListPage = lazy(() => import('./pages/batches/BatchListPage').then(m => ({ default: m.BatchListPage })));
const BatchDetailPage = lazy(() => import('./pages/batches/BatchDetailPage').then(m => ({ default: m.BatchDetailPage })));
const CreateBatchPage = lazy(() => import('./pages/batches/CreateBatchPage').then(m => ({ default: m.CreateBatchPage })));
const EditBatchPage = lazy(() => import('./pages/batches/EditBatchPage').then(m => ({ default: m.EditBatchPage })));

// Attendance
const AttendanceDashboardPage = lazy(() => import('./pages/attendance/AttendanceDashboardPage').then(m => ({ default: m.AttendanceDashboardPage })));
const MarkAttendancePage = lazy(() => import('./pages/attendance/MarkAttendancePage').then(m => ({ default: m.MarkAttendancePage })));
const AttendanceHistoryPage = lazy(() => import('./pages/attendance/AttendanceHistoryPage').then(m => ({ default: m.AttendanceHistoryPage })));
const AttendanceReportsPage = lazy(() => import('./pages/attendance/AttendanceReportsPage').then(m => ({ default: m.AttendanceReportsPage })));

// Tests
const TestListPage = lazy(() => import('./pages/tests/TestListPage').then(m => ({ default: m.TestListPage })));
const TestDetailPage = lazy(() => import('./pages/tests/TestDetailPage').then(m => ({ default: m.TestDetailPage })));
const CreateTestPage = lazy(() => import('./pages/tests/CreateTestPage').then(m => ({ default: m.CreateTestPage })));
const EditTestPage = lazy(() => import('./pages/tests/EditTestPage').then(m => ({ default: m.EditTestPage })));
const EnterMarksPage = lazy(() => import('./pages/tests/EnterMarksPage').then(m => ({ default: m.EnterMarksPage })));
const MeritListPage = lazy(() => import('./pages/tests/MeritListPage').then(m => ({ default: m.MeritListPage })));

// Reports & Parent Portal
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ParentDashboardPage = lazy(() => import('./pages/dashboard/ParentDashboardPage').then(m => ({ default: m.ParentDashboardPage })));

// Communication & Notices
const NoticesPage = lazy(() => import('./pages/communication/NoticesPage').then(m => ({ default: m.NoticesPage })));
const AnnouncementsPage = lazy(() => import('./pages/communication/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const CreateAnnouncementPage = lazy(() => import('./pages/communication/CreateAnnouncementPage').then(m => ({ default: m.CreateAnnouncementPage })));
const EditAnnouncementPage = lazy(() => import('./pages/communication/EditAnnouncementPage').then(m => ({ default: m.EditAnnouncementPage })));
const AnnouncementDetailPage = lazy(() => import('./pages/communication/AnnouncementDetailPage').then(m => ({ default: m.AnnouncementDetailPage })));
const SupportTicketsPage = lazy(() => import('./pages/communication/SupportTicketsPage').then(m => ({ default: m.SupportTicketsPage })));

// Documents
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage').then(m => ({ default: m.DocumentsPage })));

// Fees (Phase 4)
const FeeDashboardPage = lazy(() => import('./pages/fees/FeeDashboardPage').then(m => ({ default: m.FeeDashboardPage })));
const FeePlansPage = lazy(() => import('./pages/fees/FeePlansPage').then(m => ({ default: m.FeePlansPage })));
const FeePlanDetailPage = lazy(() => import('./pages/fees/FeePlanDetailPage').then(m => ({ default: m.FeePlanDetailPage })));
const StudentFeesPage = lazy(() => import('./pages/fees/StudentFeesPage').then(m => ({ default: m.StudentFeesPage })));
const PaymentsPage = lazy(() => import('./pages/fees/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const RecordPaymentPage = lazy(() => import('./pages/fees/RecordPaymentPage').then(m => ({ default: m.RecordPaymentPage })));
const ReceiptsPage = lazy(() => import('./pages/fees/ReceiptsPage').then(m => ({ default: m.ReceiptsPage })));
const RefundsPage = lazy(() => import('./pages/fees/RefundsPage').then(m => ({ default: m.RefundsPage })));
const FeeReportsPage = lazy(() => import('./pages/fees/FeeReportsPage').then(m => ({ default: m.FeeReportsPage })));

// Audit
const AuditDashboardPage = lazy(() => import('./pages/audit/AuditDashboardPage').then(m => ({ default: m.AuditDashboardPage })));

// Phase 5 — LMS & Online Tests
const MaterialsPage = lazy(() => import('./pages/materials/MaterialsPage').then(m => ({ default: m.MaterialsPage })));
const DigitalLibraryPage = lazy(() => import('./pages/materials/DigitalLibraryPage').then(m => ({ default: m.DigitalLibraryPage })));
const AssignmentsPage = lazy(() => import('./pages/assignments/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })));
const HomeworkPage = lazy(() => import('./pages/homework/HomeworkPage').then(m => ({ default: m.HomeworkPage })));
const StudentDashboard = lazy(() => import('./pages/student-portal/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ParentDashboard = lazy(() => import('./pages/parent-portal/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const AcademicCalendarPage = lazy(() => import('./pages/calendar/AcademicCalendarPage').then(m => ({ default: m.AcademicCalendarPage })));
const OnlineTestsPage = lazy(() => import('./pages/tests/OnlineTestsPage').then(m => ({ default: m.OnlineTestsPage })));
const OnlineExamPage = lazy(() => import('./pages/tests/OnlineExamPage').then(m => ({ default: m.OnlineExamPage })));
const QuestionBankPage = lazy(() => import('./pages/tests/QuestionBankPage').then(m => ({ default: m.QuestionBankPage })));
const LeaderboardPage = lazy(() => import('./pages/leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const StudentAnalyticsPage = lazy(() => import('./pages/reports/StudentAnalyticsPage').then(m => ({ default: m.StudentAnalyticsPage })));
const PredictionDashboard = lazy(() => import('./pages/analytics/PredictionDashboard').then(m => ({ default: m.PredictionDashboard })));
const FacultyInsights = lazy(() => import('./pages/analytics/FacultyInsights').then(m => ({ default: m.FacultyInsights })));

// Faculty, Users, and Subjects
const FacultyListPage = lazy(() => import('./pages/faculty/FacultyListPage').then(m => ({ default: m.FacultyListPage })));
const FacultyDetailPage = lazy(() => import('./pages/faculty/FacultyDetailPage').then(m => ({ default: m.FacultyDetailPage })));
const CreateFacultyPage = lazy(() => import('./pages/faculty/CreateFacultyPage').then(m => ({ default: m.CreateFacultyPage })));
const EditFacultyPage = lazy(() => import('./pages/faculty/EditFacultyPage').then(m => ({ default: m.EditFacultyPage })));
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const SubjectsPage = lazy(() => import('./pages/subjects/SubjectsPage').then(m => ({ default: m.SubjectsPage })));

function App() {
  const user = useAuthStore((s) => s.user);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">Loading page...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/public-site" element={<PublicLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Students */}
          <Route path="students" element={<ProtectedRoute allowedPermissions={[Permission.STUDENT_READ]}><StudentListPage /></ProtectedRoute>} />
          <Route path="students/create" element={<ProtectedRoute allowedPermissions={[Permission.STUDENT_WRITE]}><CreateStudentPage /></ProtectedRoute>} />
          <Route path="students/:id" element={<ProtectedRoute allowedPermissions={[Permission.STUDENT_READ, Permission.STUDENT_READ_OWN]}><StudentDetailPage /></ProtectedRoute>} />
          <Route path="students/:id/edit" element={<ProtectedRoute allowedPermissions={[Permission.STUDENT_WRITE]}><EditStudentPage /></ProtectedRoute>} />

          {/* Parents */}
          <Route path="parents" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_READ]}><ParentListPage /></ProtectedRoute>} />
          <Route path="parents/create" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_WRITE]}><CreateParentPage /></ProtectedRoute>} />
          <Route path="parents/:id" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_READ, Permission.PARENT_READ_OWN]}><ParentDetailPage /></ProtectedRoute>} />
          <Route path="parents/:id/edit" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_WRITE]}><EditParentPage /></ProtectedRoute>} />

          {/* Batches */}
          <Route path="batches" element={<ProtectedRoute allowedPermissions={[Permission.BATCH_READ]}><BatchListPage /></ProtectedRoute>} />
          <Route path="batches/create" element={<ProtectedRoute allowedPermissions={[Permission.BATCH_WRITE]}><CreateBatchPage /></ProtectedRoute>} />
          <Route path="batches/:id" element={<ProtectedRoute allowedPermissions={[Permission.BATCH_READ]}><BatchDetailPage /></ProtectedRoute>} />
          <Route path="batches/:id/edit" element={<ProtectedRoute allowedPermissions={[Permission.BATCH_WRITE]}><EditBatchPage /></ProtectedRoute>} />

          {/* Attendance */}
          <Route path="attendance">
            <Route index element={<ProtectedRoute allowedPermissions={[Permission.ATTENDANCE_READ_ALL, Permission.ATTENDANCE_READ_OWN]}><AttendanceDashboardPage /></ProtectedRoute>} />
            <Route path="mark" element={<ProtectedRoute allowedPermissions={[Permission.ATTENDANCE_MARK]}><MarkAttendancePage /></ProtectedRoute>} />
            <Route path="history" element={<ProtectedRoute allowedPermissions={[Permission.ATTENDANCE_READ_ALL, Permission.ATTENDANCE_READ_OWN]}><AttendanceHistoryPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedPermissions={[Permission.ATTENDANCE_REPORT]}><AttendanceReportsPage /></ProtectedRoute>} />
          </Route>

          {/* Tests */}
          <Route path="tests">
            <Route index element={<ProtectedRoute allowedPermissions={[Permission.TEST_VIEW_ALL, Permission.TEST_VIEW_OWN]}><TestListPage /></ProtectedRoute>} />
            <Route path="create" element={<ProtectedRoute allowedPermissions={[Permission.TEST_CREATE]}><CreateTestPage /></ProtectedRoute>} />
            <Route path=":id" element={<ProtectedRoute allowedPermissions={[Permission.TEST_VIEW_ALL, Permission.TEST_VIEW_OWN]}><TestDetailPage /></ProtectedRoute>} />
            <Route path=":id/edit" element={<ProtectedRoute allowedPermissions={[Permission.TEST_EDIT]}><EditTestPage /></ProtectedRoute>} />
            <Route path=":id/marks" element={<ProtectedRoute allowedPermissions={[Permission.TEST_MARKS_ENTRY]}><EnterMarksPage /></ProtectedRoute>} />
            <Route path=":id/merit-list" element={<ProtectedRoute allowedPermissions={[Permission.TEST_VIEW_ALL, Permission.TEST_VIEW_OWN]}><MeritListPage /></ProtectedRoute>} />
          </Route>

          {/* Reports, Analytics & Parent Portal */}
          <Route path="reports" element={<ProtectedRoute allowedPermissions={[Permission.REPORT_ALL, Permission.REPORT_BATCH, Permission.REPORT_OWN]}><ReportsPage /></ProtectedRoute>} />
          <Route path="reports/analytics" element={<ProtectedRoute allowedPermissions={[Permission.REPORT_ALL, Permission.REPORT_BATCH]}><StudentAnalyticsPage /></ProtectedRoute>} />
          <Route path="parent-portal" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_READ_OWN]}><ParentDashboardPage /></ProtectedRoute>} />
          <Route path="analytics/student/:studentId" element={<ProtectedRoute allowedPermissions={[Permission.REPORT_ALL, Permission.REPORT_BATCH, Permission.REPORT_OWN]}><PredictionDashboard /></ProtectedRoute>} />
          <Route path="analytics/faculty" element={<ProtectedRoute allowedPermissions={[Permission.REPORT_ALL, Permission.REPORT_BATCH]}><FacultyInsights /></ProtectedRoute>} />

          {/* Communication & Documents */}
          <Route path="notices" element={<ProtectedRoute allowedPermissions={[Permission.NOTICE_VIEW]}><NoticesPage /></ProtectedRoute>} />
          <Route path="announcements" element={<ProtectedRoute allowedPermissions={[Permission.ANNOUNCEMENT_VIEW]}><AnnouncementsPage /></ProtectedRoute>} />
          <Route path="announcements/create" element={<ProtectedRoute allowedPermissions={[Permission.ANNOUNCEMENT_CREATE]}><CreateAnnouncementPage /></ProtectedRoute>} />
          <Route path="announcements/:id" element={<ProtectedRoute allowedPermissions={[Permission.ANNOUNCEMENT_VIEW]}><AnnouncementDetailPage /></ProtectedRoute>} />
          <Route path="announcements/:id/edit" element={<ProtectedRoute allowedPermissions={[Permission.ANNOUNCEMENT_CREATE]}><EditAnnouncementPage /></ProtectedRoute>} />
          <Route path="tickets" element={<ProtectedRoute allowedPermissions={[Permission.TICKET_VIEW_ALL, Permission.TICKET_VIEW_OWN]}><SupportTicketsPage /></ProtectedRoute>} />
          <Route path="documents" element={<ProtectedRoute allowedPermissions={[Permission.DOCUMENT_VIEW_ALL, Permission.DOCUMENT_VIEW_OWN]}><DocumentsPage /></ProtectedRoute>} />

          {/* Audit */}
          <Route path="audit" element={<ProtectedRoute allowedPermissions={[Permission.AUDIT_VIEW]}><AuditDashboardPage /></ProtectedRoute>} />

          {/* LMS & Online Testing (Phase 5) */}
          <Route path="materials" element={<ProtectedRoute allowedPermissions={[Permission.MATERIAL_DOWNLOAD, Permission.MATERIAL_UPLOAD]}><MaterialsPage /></ProtectedRoute>} />
          <Route path="library" element={<ProtectedRoute allowedPermissions={[Permission.MATERIAL_DOWNLOAD, Permission.MATERIAL_UPLOAD]}><DigitalLibraryPage /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute allowedPermissions={[Permission.ASSIGNMENT_SUBMIT, Permission.ASSIGNMENT_CREATE, Permission.ASSIGNMENT_REVIEW]}><AssignmentsPage /></ProtectedRoute>} />
          <Route path="homework" element={<ProtectedRoute allowedPermissions={[Permission.ASSIGNMENT_SUBMIT, Permission.ASSIGNMENT_CREATE, Permission.ASSIGNMENT_REVIEW]}><HomeworkPage /></ProtectedRoute>} />
          <Route path="online-tests" element={<ProtectedRoute allowedPermissions={[Permission.ONLINE_TEST_TAKE, Permission.ONLINE_TEST_MANAGE]}><OnlineTestsPage /></ProtectedRoute>} />
          <Route path="online-tests/exam/:testId" element={<ProtectedRoute allowedPermissions={[Permission.ONLINE_TEST_TAKE]}><OnlineExamPage /></ProtectedRoute>} />
          <Route path="question-bank" element={<ProtectedRoute allowedPermissions={[Permission.QUESTION_BANK_MANAGE]}><QuestionBankPage /></ProtectedRoute>} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Phase 17 — Student Portal, Parent Portal & Academic Calendar */}
          <Route path="student-portal" element={<ProtectedRoute allowedPermissions={[Permission.STUDENT_READ_OWN]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="parent-portal-v2" element={<ProtectedRoute allowedPermissions={[Permission.PARENT_READ_OWN]}><ParentDashboard /></ProtectedRoute>} />
          <Route path="academic-calendar" element={<ProtectedRoute allowedPermissions={[Permission.CALENDAR_EVENT_VIEW]}><AcademicCalendarPage /></ProtectedRoute>} />

          {/* Phase 9 CRM & Admissions Routes */}
          <Route path="crm">
            <Route path="dashboard" element={<ProtectedRoute allowedPermissions={[Permission.COUNSELOR_DASHBOARD_VIEW]}><CrmDashboard /></ProtectedRoute>} />
            <Route path="counselor" element={<ProtectedRoute allowedPermissions={[Permission.COUNSELOR_MANAGE]}><CounselorDashboard /></ProtectedRoute>} />
            <Route path="campaigns" element={<ProtectedRoute allowedPermissions={[Permission.CAMPAIGN_MANAGE]}><CampaignManager /></ProtectedRoute>} />
            <Route path="website-builder" element={<ProtectedRoute allowedPermissions={[Permission.WEBSITE_BUILDER_MANAGE]}><WebsiteBuilder /></ProtectedRoute>} />
          </Route>

          {/* Faculty */}
          <Route path="faculty" element={<ProtectedRoute allowedPermissions={[Permission.FACULTY_READ]}><FacultyListPage /></ProtectedRoute>} />
          <Route path="faculty/create" element={<ProtectedRoute allowedPermissions={[Permission.FACULTY_WRITE]}><CreateFacultyPage /></ProtectedRoute>} />
          <Route path="faculty/:id" element={<ProtectedRoute allowedPermissions={[Permission.FACULTY_READ]}><FacultyDetailPage /></ProtectedRoute>} />
          <Route path="faculty/:id/edit" element={<ProtectedRoute allowedPermissions={[Permission.FACULTY_WRITE]}><EditFacultyPage /></ProtectedRoute>} />

          {/* Users */}
          <Route path="users" element={<ProtectedRoute allowedPermissions={[Permission.USER_READ]}><UsersPage /></ProtectedRoute>} />

          {/* Subjects */}
          <Route path="subjects" element={<ProtectedRoute allowedPermissions={[Permission.SUBJECT_READ]}><SubjectsPage /></ProtectedRoute>} />

          {/* Fees (Phase 4) */}
          <Route path="fees">
            <Route index element={<ProtectedRoute allowedPermissions={[Permission.FEE_DASHBOARD, Permission.FEE_VIEW_OWN]}><FeeDashboardPage /></ProtectedRoute>} />
            <Route path="plans" element={<ProtectedRoute allowedPermissions={[Permission.FEE_STRUCTURE_MANAGE]}><FeePlansPage /></ProtectedRoute>} />
            <Route path="plans/:id" element={<ProtectedRoute allowedPermissions={[Permission.FEE_STRUCTURE_MANAGE]}><FeePlanDetailPage /></ProtectedRoute>} />
            <Route path="student-fees" element={<ProtectedRoute allowedPermissions={[Permission.FEE_VIEW_ALL, Permission.FEE_VIEW_OWN]}><StudentFeesPage /></ProtectedRoute>} />
            <Route path="payments" element={<ProtectedRoute allowedPermissions={[Permission.FEE_VIEW_ALL]}><PaymentsPage /></ProtectedRoute>} />
            <Route path="payments/record" element={<ProtectedRoute allowedPermissions={[Permission.FEE_COLLECT]}><RecordPaymentPage /></ProtectedRoute>} />
            <Route path="receipts" element={<ProtectedRoute allowedPermissions={[Permission.FEE_RECEIPT_VIEW]}><ReceiptsPage /></ProtectedRoute>} />
            <Route path="refunds" element={<ProtectedRoute allowedPermissions={[Permission.FEE_REFUND_MANAGE]}><RefundsPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedPermissions={[Permission.FEE_REPORT]}><FeeReportsPage /></ProtectedRoute>} />
          </Route>
          {/* SaaS & Franchise (Phase 8) */}
          <Route
            path="super-admin"
            element={
              user?.role === 'SUPER_ADMIN' ? (
                <SuperAdminDashboard />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="franchise" element={<HeadOfficeDashboard />} />
          <Route path="settings/branding" element={<BrandingSettingsPage />} />
          <Route path="settings" element={<BrandingSettingsPage />} />
          
          {/* Catch-all 404 inside AppShell */}
          <Route path="*" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">404</h1>
              <p className="text-gray-500 dark:text-gray-400">Page not found</p>
            </div>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
