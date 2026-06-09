import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

import { AppShell } from './components/layout/AppShell';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

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

// Batches
import { BatchListPage } from './pages/batches/BatchListPage';
import { BatchDetailPage } from './pages/batches/BatchDetailPage';
import { CreateBatchPage } from './pages/batches/CreateBatchPage';
import { EditBatchPage } from './pages/batches/EditBatchPage';

// Placeholder for unbuilt modules
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">This module is under development (Phase 2).</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
        <Route path="parents/:id" element={<ParentDetailPage />} />

        {/* Batches */}
        <Route path="batches" element={<BatchListPage />} />
        <Route path="batches/create" element={<CreateBatchPage />} />
        <Route path="batches/:id" element={<BatchDetailPage />} />
        <Route path="batches/:id/edit" element={<EditBatchPage />} />

        {/* Stubs for Phase 2 */}
        <Route path="faculty" element={<PlaceholderPage title="Faculty Management" />} />
        <Route path="attendance" element={<PlaceholderPage title="Attendance Management" />} />
        <Route path="tests" element={<PlaceholderPage title="Test & Assessment Management" />} />
        <Route path="fees" element={<PlaceholderPage title="Fee Collection & Invoicing" />} />
        <Route path="reports" element={<PlaceholderPage title="Analytics & Reports" />} />
        <Route path="settings" element={<PlaceholderPage title="System Settings" />} />
        
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
