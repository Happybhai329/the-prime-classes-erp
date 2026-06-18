import api from '@/lib/api';
import { VideoProvider } from '@prime/shared-types';

export interface CreateVideoPayload {
  batchId?: string;
  subjectId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  provider: VideoProvider;
  durationSeconds?: number;
  thumbnailUrl?: string;
  isLive?: boolean;
  scheduledStart?: string;
}

export const videosService = {
  create: async (data: CreateVideoPayload) => {
    return api.post('/videos', data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/videos', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/videos/${id}`);
  },

  remove: async (id: string) => {
    return api.delete(`/videos/${id}`);
  },
};
