import api from '@/lib/api';

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  batchId: string;
  subjectId: string;
  deadline: string;
  file?: File;
  type?: 'HOMEWORK' | 'ASSIGNMENT';
  isPublished?: boolean;
}

export const assignmentsService = {
  create: async (data: CreateAssignmentPayload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('batchId', data.batchId);
    formData.append('subjectId', data.subjectId);
    formData.append('deadline', data.deadline);
    if (data.type) formData.append('type', data.type);
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
    if (data.file) formData.append('file', data.file);

    return api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id: string, data: Partial<CreateAssignmentPayload>) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.batchId) formData.append('batchId', data.batchId);
    if (data.subjectId) formData.append('subjectId', data.subjectId);
    if (data.deadline) formData.append('deadline', data.deadline);
    if (data.type) formData.append('type', data.type);
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
    if (data.file) formData.append('file', data.file);

    return api.patch(`/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/assignments', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/assignments/${id}`);
  },

  submit: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  grade: async (id: string, studentId: string, data: { score: number; feedback?: string }) => {
    return api.post(`/assignments/${id}/grade/${studentId}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`/assignments/${id}`);
  },
};
