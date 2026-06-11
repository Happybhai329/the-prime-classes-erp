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
    return api.post('/announcements', data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/announcements', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/announcements/${id}`);
  },

  update: async (id: string, data: Partial<CreateAnnouncementPayload>) => {
    return api.patch(`/announcements/${id}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`/announcements/${id}`);
  },
};
