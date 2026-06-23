import { api } from '@/lib/api';
import {
  CreateTestRequest,
  UpdateTestRequest,
  TestDetail,
  BulkMarkEntryRequest,
  MeritListResponse,
  SubjectAnalysis,
  PaginatedResponse,
  ApiResponse,
} from '@prime/shared-types';

export const testService = {
  getTests: (params?: any) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/tests', { params }).then(r => r.data.data),

  getTest: (id: string) =>
    api.get<ApiResponse<TestDetail>>(`/tests/${id}`).then(r => r.data.data),

  createTest: (data: CreateTestRequest) =>
    api.post<ApiResponse<any>>('/tests', data).then(r => r.data.data),

  updateTest: (id: string, data: UpdateTestRequest) =>
    api.patch<ApiResponse<any>>(`/tests/${id}`, data).then(r => r.data.data),

  deleteTest: (id: string) =>
    api.delete<ApiResponse<any>>(`/tests/${id}`).then(r => r.data.data),

  enterMarks: (id: string, data: BulkMarkEntryRequest) =>
    api.post<ApiResponse<any>>(`/tests/${id}/marks`, data).then(r => r.data.data),

  computeRankings: (id: string) =>
    api.post<ApiResponse<any>>(`/tests/${id}/compute-rankings`).then(r => r.data.data),

  publish: (id: string) =>
    api.patch<ApiResponse<any>>(`/tests/${id}/publish`).then(r => r.data.data),

  getMeritList: (id: string) =>
    api.get<ApiResponse<MeritListResponse>>(`/tests/${id}/merit-list`).then(r => r.data.data),

  getSubjectAnalysis: (id: string) =>
    api.get<ApiResponse<SubjectAnalysis[]>>(`/tests/${id}/subject-analysis`).then(r => r.data.data),
};
