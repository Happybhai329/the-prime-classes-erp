import api from '@/lib/api';

export interface CreateCalendarEventPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  eventType: 'HOLIDAY' | 'EVENT' | 'EXAM' | 'IMPORTANT_DATE';
  batchId?: string;
}

export const calendarEventsService = {
  create: async (data: CreateCalendarEventPayload) => {
    return api.post('/calendar-events', data);
  },

  update: async (id: string, data: Partial<CreateCalendarEventPayload>) => {
    return api.patch(`/calendar-events/${id}`, data);
  },

  findAll: async (params?: Record<string, any>) => {
    return api.get('/calendar-events', { params });
  },

  findOne: async (id: string) => {
    return api.get(`/calendar-events/${id}`);
  },

  remove: async (id: string) => {
    return api.delete(`/calendar-events/${id}`);
  },
};
