import api from '@/lib/api';

export interface UploadMaterialPayload {
  title: string;
  description?: string;
  categoryId?: string;
  batchId?: string;
  subjectId?: string;
  course?: string;
  chapter?: string;
  topic?: string;
  isPublished?: boolean;
  file: File;
}

export const materialsService = {
  createCategory: async (name: string) => {
    return api.post('/materials/categories', { name });
  },

  findCategories: async () => {
    return api.get('/materials/categories');
  },

  upload: async (data: UploadMaterialPayload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.batchId) formData.append('batchId', data.batchId);
    if (data.subjectId) formData.append('subjectId', data.subjectId);
    if (data.course) formData.append('course', data.course);
    if (data.chapter) formData.append('chapter', data.chapter);
    if (data.topic) formData.append('topic', data.topic);
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
    formData.append('file', data.file);

    return api.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: async (id: string, data: Partial<UploadMaterialPayload>) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId || '');
    if (data.batchId !== undefined) formData.append('batchId', data.batchId || '');
    if (data.subjectId !== undefined) formData.append('subjectId', data.subjectId || '');
    if (data.course !== undefined) formData.append('course', data.course || '');
    if (data.chapter !== undefined) formData.append('chapter', data.chapter || '');
    if (data.topic !== undefined) formData.append('topic', data.topic || '');
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
    if (data.file) formData.append('file', data.file);

    return api.patch(`/materials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/materials', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/materials/${id}`);
  },

  getDownloadUrl: async (id: string) => {
    return api.get(`/materials/${id}/download`);
  },

  getPreviewUrl: async (id: string) => {
    return api.get(`/materials/${id}/preview`);
  },

  toggleFavorite: async (id: string) => {
    return api.post(`/materials/${id}/favorite`);
  },

  getAccessLogs: async (id: string) => {
    return api.get(`/materials/${id}/logs`);
  },

  remove: async (id: string) => {
    return api.delete(`/materials/${id}`);
  },
};
