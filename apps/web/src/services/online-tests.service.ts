import api from '@/lib/api';
import { OnlineTestMode } from '@prime/shared-types';

export interface CreateOnlineTestPayload {
  batchId: string;
  subjectId?: string;
  title: string;
  description?: string;
  testMode: OnlineTestMode;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking?: number;
  scheduledStart: string;
  scheduledEnd: string;
  questionIds?: string[];
  sectionalSettings?: any;
  isPublished?: boolean;
}

export interface AutoGenerateTestPayload {
  batchId: string;
  subjectId: string;
  title: string;
  testMode: OnlineTestMode;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking?: number;
  scheduledStart: string;
  scheduledEnd: string;
  difficultyMix: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
}

export const onlineTestsService = {
  create: async (data: CreateOnlineTestPayload) => {
    return api.post('/online-tests', data);
  },

  autoGenerate: async (data: AutoGenerateTestPayload) => {
    return api.post('/online-tests/auto', data);
  },

  update: async (id: string, data: Partial<CreateOnlineTestPayload>) => {
    return api.patch(`/online-tests/${id}`, data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/online-tests', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/online-tests/${id}`);
  },

  remove: async (id: string) => {
    return api.delete(`/online-tests/${id}`);
  },

  startAttempt: async (testId: string) => {
    return api.post(`/online-tests/${testId}/start`);
  },

  saveState: async (attemptId: string, resumeState: any) => {
    return api.post(`/online-tests/attempts/${attemptId}/state`, { resumeState });
  },

  submitAttempt: async (attemptId: string, responses: Array<{ questionId: string; selectedAnswer?: string; timeSpentSeconds?: number }>) => {
    return api.post(`/online-tests/attempts/${attemptId}/submit`, { responses });
  },
};
