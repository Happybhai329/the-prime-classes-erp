import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { useAuthStore } from './store/auth.store';

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
          <Route path="students" element={<StudentListPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />

          {/* Parents */}
          <Route path="parents" element={<ParentListPage />} />
          <Route path="parents/create" element={<CreateParentPage />} />
          <Route path="parents/:id" element={<ParentDetailPage />} />
          <Route path="parents/:id/edit" element={<EditParentPage />} />

          {/* Batches */}
          <Route path="batches" element={<BatchListPage />} />
          <Route path="batches/create" element={<CreateBatchPage />} />
          <Route path="batches/:id" element={<BatchDetailPage />} />
          <Route path="batches/:id/edit" element={<EditBatchPage />} />

          {/* Attendance */}
          <Route path="attendance">
            <Route index element={<AttendanceDashboardPage />} />
            <Route path="mark" element={<MarkAttendancePage />} />
            <Route path="history" element={<AttendanceHistoryPage />} />
            <Route path="reports" element={<AttendanceReportsPage />} />
          </Route>

          {/* Tests */}
          <Route path="tests">
            <Route index element={<TestListPage />} />
            <Route path="create" element={<CreateTestPage />} />
            <Route path=":id" element={<TestDetailPage />} />
            <Route path=":id/edit" element={<EditTestPage />} />
            <Route path=":id/marks" element={<EnterMarksPage />} />
            <Route path=":id/merit-list" element={<MeritListPage />} />
          </Route>

          {/* Reports, Analytics & Parent Portal */}
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/analytics" element={<StudentAnalyticsPage />} />
          <Route path="parent-portal" element={<ParentDashboardPage />} />
          <Route path="analytics/student/:studentId" element={<PredictionDashboard />} />
          <Route path="analytics/faculty" element={<FacultyInsights />} />

          {/* Communication & Documents */}
          <Route path="notices" element={<NoticesPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/create" element={<CreateAnnouncementPage />} />
          <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="announcements/:id/edit" element={<EditAnnouncementPage />} />
          <Route path="tickets" element={<SupportTicketsPage />} />
          <Route path="documents" element={<DocumentsPage />} />

          {/* Audit */}
          <Route path="audit" element={<AuditDashboardPage />} />

          {/* LMS & Online Testing (Phase 5) */}
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="library" element={<DigitalLibraryPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="online-tests" element={<OnlineTestsPage />} />
          <Route path="online-tests/exam/:testId" element={<OnlineExamPage />} />
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Phase 9 CRM & Admissions Routes */}
          <Route path="crm">
            <Route path="dashboard" element={<CrmDashboard />} />
            <Route path="counselor" element={<CounselorDashboard />} />
            <Route path="campaigns" element={<CampaignManager />} />
            <Route path="website-builder" element={<WebsiteBuilder />} />
          </Route>

          {/* Faculty */}
          <Route path="faculty" element={<FacultyListPage />} />
          <Route path="faculty/create" element={<CreateFacultyPage />} />
          <Route path="faculty/:id" element={<FacultyDetailPage />} />
          <Route path="faculty/:id/edit" element={<EditFacultyPage />} />

          {/* Users */}
          <Route path="users" element={<UsersPage />} />

          {/* Subjects */}
          <Route path="subjects" element={<SubjectsPage />} />

          {/* Fees (Phase 4) */}
          <Route path="fees">
            <Route index element={<FeeDashboardPage />} />
            <Route path="plans" element={<FeePlansPage />} />
            <Route path="plans/:id" element={<FeePlanDetailPage />} />
            <Route path="student-fees" element={<StudentFeesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments/record" element={<RecordPaymentPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="reports" element={<FeeReportsPage />} />
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
