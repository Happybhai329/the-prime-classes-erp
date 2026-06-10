import { api } from '@/lib/api';
import {
  MeritListResponse,
  StudentPerformanceProfile,
  ParentPortalDashboard,
} from '@prime/shared-types';

export const reportService = {
  getAttendanceSummary: () =>
    api.get('/reports/attendance/summary').then(r => r.data),

  getTestsSummary: () =>
    api.get('/reports/tests/summary').then(r => r.data),

  getInstituteMeritList: () =>
    api.get<MeritListResponse>('/reports/merit-list').then(r => r.data),

  getBatchMeritList: (batchId: string) =>
    api.get<MeritListResponse>(`/reports/merit-list/batch/${batchId}`).then(r => r.data),

  getExamMeritList: (examType: string) =>
    api.get<MeritListResponse>(`/reports/merit-list/exam/${examType}`).then(r => r.data),

  getStudentPerformanceProfile: (studentId: string) =>
    api.get<StudentPerformanceProfile>(`/reports/student/${studentId}/performance`).then(r => r.data),

  getParentChildrenData: () =>
    api.get<ParentPortalDashboard>('/reports/parent/children').then(r => r.data),
};
