import api from '@/lib/api';
import { DocumentType } from '@prime/shared-types';

export interface UploadDocumentPayload {
  title: string;
  documentType: DocumentType;
  studentId?: string;
  file: File;
}

export const documentsService = {
  upload: async (data: UploadDocumentPayload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('documentType', data.documentType);
    if (data.studentId) {
      formData.append('studentId', data.studentId);
    }
    formData.append('file', data.file);

    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/documents', { params });
  },

  getMyDocuments: async (params?: Record<string, any>) => {
    return api.get('/documents/my', { params });
  },

  getDownloadUrl: async (id: string) => {
    return api.get(`/documents/${id}/download`);
  },

  remove: async (id: string) => {
    return api.delete(`/documents/${id}`);
  },
};
