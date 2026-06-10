import { api } from '@/lib/api';
import {
  CreateTestRequest,
  UpdateTestRequest,
  TestDetail,
  BulkMarkEntryRequest,
  MeritListResponse,
  SubjectAnalysis,
  PaginatedResponse,
} from '@prime/shared-types';

export const testService = {
  getTests: (params?: any) =>
    api.get<PaginatedResponse<any>>('/tests', { params }).then(r => r.data),

  getTest: (id: string) =>
    api.get<TestDetail>(`/tests/${id}`).then(r => r.data),

  createTest: (data: CreateTestRequest) =>
    api.post('/tests', data).then(r => r.data),

  updateTest: (id: string, data: UpdateTestRequest) =>
    api.patch(`/tests/${id}`, data).then(r => r.data),

  deleteTest: (id: string) =>
    api.delete(`/tests/${id}`).then(r => r.data),

  enterMarks: (id: string, data: BulkMarkEntryRequest) =>
    api.post(`/tests/${id}/marks`, data).then(r => r.data),

  computeRankings: (id: string) =>
    api.post(`/tests/${id}/compute-rankings`).then(r => r.data),

  publish: (id: string) =>
    api.patch(`/tests/${id}/publish`).then(r => r.data),

  getMeritList: (id: string) =>
    api.get<MeritListResponse>(`/tests/${id}/merit-list`).then(r => r.data),

  getSubjectAnalysis: (id: string) =>
    api.get<SubjectAnalysis[]>(`/tests/${id}/subject-analysis`).then(r => r.data),
};
