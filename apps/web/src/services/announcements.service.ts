import api from '@/lib/api';
import { AnnouncementCategory } from '@prime/shared-types';

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  category: AnnouncementCategory;
  attachmentUrls?: string[];
  scheduledAt?: string;
}

export const announcementsService = {
  create: async (data: CreateAnnouncementPayload) => {
    const res = await api.post('/announcements', data);
    return res.data.data;
  },

  findAll: async (params?: Record<string, any>) => {
    const res = await api.get('/announcements', { params });
    return res.data.data;
  },

  findOne: async (id: string) => {
    const res = await api.get(`/announcements/${id}`);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateAnnouncementPayload>) => {
    const res = await api.patch(`/announcements/${id}`, data);
    return res.data.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/announcements/${id}`);
    return res.data.data;
  },
};
