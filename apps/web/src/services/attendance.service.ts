import { api } from '@/lib/api';
import {
  CreateAttendanceSessionRequest,
  BulkAttendanceRequest,
  AttendanceSessionDetail,
  AttendanceDashboardData,
  AttendanceAnalytics,
  PaginatedResponse,
  ApiResponse,
} from '@prime/shared-types';

export const attendanceService = {
  createSession: (data: CreateAttendanceSessionRequest) =>
    api.post<ApiResponse<AttendanceSessionDetail>>('/attendance/sessions', data).then(r => r.data.data),

  createBulkSessions: (data: BulkAttendanceRequest) =>
    api.post<ApiResponse<any>>('/attendance/sessions/bulk', data).then(r => r.data.data),

  getSessions: (params?: any) =>
    api.get<ApiResponse<PaginatedResponse<AttendanceSessionDetail>>>('/attendance/sessions', { params }).then(r => r.data.data),

  getSession: (id: string) =>
    api.get<ApiResponse<AttendanceSessionDetail>>(`/attendance/sessions/${id}`).then(r => r.data.data),

  updateSession: (id: string, data: any) =>
    api.patch<ApiResponse<AttendanceSessionDetail>>(`/attendance/sessions/${id}`, data).then(r => r.data.data),

  finalizeSession: (id: string) =>
    api.post<ApiResponse<any>>(`/attendance/sessions/${id}/finalize`).then(r => r.data.data),

  getDashboard: () =>
    api.get<ApiResponse<AttendanceDashboardData>>('/attendance/dashboard').then(r => r.data.data),

  getDailyReport: (params?: any) =>
    api.get<ApiResponse<any[]>>('/attendance/reports/daily', { params }).then(r => r.data.data),

  getMonthlyReport: (params?: any) =>
    api.get<ApiResponse<any[]>>('/attendance/reports/monthly', { params }).then(r => r.data.data),

  getStudentReport: (id: string, params?: any) =>
    api.get<ApiResponse<any>>(`/attendance/reports/student/${id}`, { params }).then(r => r.data.data),

  getBatchReport: (id: string, params?: any) =>
    api.get<ApiResponse<any>>(`/attendance/reports/batch/${id}`, { params }).then(r => r.data.data),

  getAnalytics: (params?: any) =>
    api.get<ApiResponse<AttendanceAnalytics>>('/attendance/analytics', { params }).then(r => r.data.data),
};
