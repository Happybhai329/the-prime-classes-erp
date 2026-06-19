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
    const res = await api.post('/notices', data);
    return res.data.data;
  },

  findAll: async (params?: Record<string, any>) => {
    const res = await api.get('/notices', { params });
    return res.data.data;
  },

  getMyNotices: async (params?: Record<string, any>) => {
    const res = await api.get('/notices/my', { params });
    return res.data.data;
  },

  findOne: async (id: string) => {
    const res = await api.get(`/notices/${id}`);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateNoticePayload> & { isPublished?: boolean }) => {
    const res = await api.patch(`/notices/${id}`, data);
    return res.data.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/notices/${id}`);
    return res.data.data;
  },

  markRead: async (id: string) => {
    const res = await api.post(`/notices/${id}/read`);
    return res.data.data;
  },
};
