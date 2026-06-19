import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

import { AppShell } from './components/layout/AppShell';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingWizard } from './pages/auth/OnboardingWizard';

// Phase 9 Pages
import { CrmDashboard } from './pages/crm/CrmDashboard';
import { CounselorDashboard } from './pages/crm/CounselorDashboard';
import { CampaignManager } from './pages/crm/CampaignManager';
import { WebsiteBuilder } from './pages/crm/WebsiteBuilder';
import { PublicLandingPage } from './pages/public/PublicLandingPage';

// Super Admin & Franchise Settings (Phase 8)
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { HeadOfficeDashboard } from './pages/franchise/HeadOfficeDashboard';
import { BrandingSettingsPage } from './pages/settings/BrandingSettingsPage';
import { useAuthStore } from './store/auth.store';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Students
import { StudentListPage } from './pages/students/StudentListPage';
import { StudentDetailPage } from './pages/students/StudentDetailPage';
import { CreateStudentPage } from './pages/students/CreateStudentPage';
import { EditStudentPage } from './pages/students/EditStudentPage';

// Parents
import { ParentListPage } from './pages/parents/ParentListPage';
import { ParentDetailPage } from './pages/parents/ParentDetailPage';
import { CreateParentPage } from './pages/parents/CreateParentPage';
import { EditParentPage } from './pages/parents/EditParentPage';

// Batches
import { BatchListPage } from './pages/batches/BatchListPage';
import { BatchDetailPage } from './pages/batches/BatchDetailPage';
import { CreateBatchPage } from './pages/batches/CreateBatchPage';
import { EditBatchPage } from './pages/batches/EditBatchPage';

// Attendance
import { AttendanceDashboardPage } from './pages/attendance/AttendanceDashboardPage';
import { MarkAttendancePage } from './pages/attendance/MarkAttendancePage';
import { AttendanceHistoryPage } from './pages/attendance/AttendanceHistoryPage';
import { AttendanceReportsPage } from './pages/attendance/AttendanceReportsPage';

// Tests
import { TestListPage } from './pages/tests/TestListPage';
import { TestDetailPage } from './pages/tests/TestDetailPage';
import { CreateTestPage } from './pages/tests/CreateTestPage';
import { EditTestPage } from './pages/tests/EditTestPage';
import { EnterMarksPage } from './pages/tests/EnterMarksPage';
import { MeritListPage } from './pages/tests/MeritListPage';

// Reports & Parent Portal
import { ReportsPage } from './pages/reports/ReportsPage';
import { ParentDashboardPage } from './pages/dashboard/ParentDashboardPage';

// Communication & Notices
import { NoticesPage } from './pages/communication/NoticesPage';
import { AnnouncementsPage } from './pages/communication/AnnouncementsPage';
import { CreateAnnouncementPage } from './pages/communication/CreateAnnouncementPage';
import { EditAnnouncementPage } from './pages/communication/EditAnnouncementPage';
import { AnnouncementDetailPage } from './pages/communication/AnnouncementDetailPage';
import { SupportTicketsPage } from './pages/communication/SupportTicketsPage';

// Documents
import { DocumentsPage } from './pages/documents/DocumentsPage';

// Fees (Phase 4)
import { FeeDashboardPage } from './pages/fees/FeeDashboardPage';
import { FeePlansPage } from './pages/fees/FeePlansPage';
import { FeePlanDetailPage } from './pages/fees/FeePlanDetailPage';
import { StudentFeesPage } from './pages/fees/StudentFeesPage';
import { PaymentsPage } from './pages/fees/PaymentsPage';
import { RecordPaymentPage } from './pages/fees/RecordPaymentPage';
import { ReceiptsPage } from './pages/fees/ReceiptsPage';
import { RefundsPage } from './pages/fees/RefundsPage';
import { FeeReportsPage } from './pages/fees/FeeReportsPage';

// Audit
import { AuditDashboardPage } from './pages/audit/AuditDashboardPage';

// Phase 5 — LMS & Online Tests
import { MaterialsPage } from './pages/materials/MaterialsPage';
import { DigitalLibraryPage } from './pages/materials/DigitalLibraryPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { OnlineTestsPage } from './pages/tests/OnlineTestsPage';
import { OnlineExamPage } from './pages/tests/OnlineExamPage';
import { QuestionBankPage } from './pages/tests/QuestionBankPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { StudentAnalyticsPage } from './pages/reports/StudentAnalyticsPage';
import { PredictionDashboard } from './pages/analytics/PredictionDashboard';
import { FacultyInsights } from './pages/analytics/FacultyInsights';

// Faculty, Users, and Subjects
import { FacultyListPage } from './pages/faculty/FacultyListPage';
import { FacultyDetailPage } from './pages/faculty/FacultyDetailPage';
import { CreateFacultyPage } from './pages/faculty/CreateFacultyPage';
import { EditFacultyPage } from './pages/faculty/EditFacultyPage';
import { UsersPage } from './pages/users/UsersPage';
import { SubjectsPage } from './pages/subjects/SubjectsPage';


function App() {
  const user = useAuthStore((s) => s.user);

  return (
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-500">Page not found</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;
