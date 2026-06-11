import api from '@/lib/api';
import { NoticePriority, NoticeTargetAudience } from '@prime/shared-types';

export interface CreateNoticePayload {
  title: string;
  description: string;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  batchIds?: string[];
  publishDate: string;
  expiryDate?: string;
}

export const noticesService = {
  create: async (data: CreateNoticePayload) => {
    return api.post('/notices', data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/notices', { params });
  },

  getMyNotices: async (params?: Record<string, any>) => {
    return api.get('/notices/my', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/notices/${id}`);
  },

  update: async (id: string, data: Partial<CreateNoticePayload> & { isPublished?: boolean }) => {
    return api.patch(`/notices/${id}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`/notices/${id}`);
  },

  markRead: async (id: string) => {
    return api.post(`/notices/${id}/read`);
  },
};
