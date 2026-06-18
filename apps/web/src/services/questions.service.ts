import api from '@/lib/api';
import { DifficultyLevel, QuestionType } from '@prime/shared-types';

export interface CreateQuestionPayload {
  subjectId: string;
  topic: string;
  difficulty: DifficultyLevel;
  marks: number;
  questionType: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  tags?: string[];
  examTypes?: any[];
}

export const questionsService = {
  create: async (data: CreateQuestionPayload) => {
    return api.post('/questions', data);
  },

  update: async (id: string, data: Partial<CreateQuestionPayload>) => {
    return api.patch(`/questions/${id}`, data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/questions', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/questions/${id}`);
  },

  remove: async (id: string) => {
    return api.delete(`/questions/${id}`);
  },

  bulkImport: async (questions: CreateQuestionPayload[]) => {
    return api.post('/questions/import', { questions });
  },

  createBank: async (data: { name: string; description?: string; subjectId: string }) => {
    return api.post('/questions/banks', data);
  },

  findBanks: async (subjectId?: string) => {
    return api.get('/questions/banks', { params: { subjectId } });
  },

  getBankDetails: async (id: string) => {
    return api.get(`/questions/banks/${id}`);
  },

  addQuestionsToBank: async (id: string, questionIds: string[]) => {
    return api.post(`/questions/banks/${id}/questions`, { questionIds });
  },

  removeQuestionsFromBank: async (id: string, questionIds: string[]) => {
    return api.delete(`/questions/banks/${id}/questions`, { data: { questionIds } });
  },
};
