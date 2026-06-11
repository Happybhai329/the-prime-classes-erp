import api from '@/lib/api';
import { TicketCategory, TicketStatus } from '@prime/shared-types';

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  message: string;
}

export interface ReplyTicketPayload {
  message: string;
  attachmentUrl?: string;
}

export const communicationService = {
  createTicket: async (data: CreateTicketPayload) => {
    return api.post('/tickets', data);
  },

  getMyTickets: async (params?: Record<string, any>) => {
    return api.get('/tickets', { params });
  },

  getAllTickets: async (params?: Record<string, any>) => {
    return api.get('/tickets/all', { params });
  },

  getTicketDetail: async (id: string) => {
    return api.get(`/tickets/${id}`);
  },

  replyToTicket: async (id: string, data: ReplyTicketPayload) => {
    return api.post(`/tickets/${id}/reply`, data);
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    return api.patch(`/tickets/${id}/status`, { status });
  },

  assignTicket: async (id: string, assigneeId: string) => {
    return api.patch(`/tickets/${id}/assign`, { assigneeId });
  },
};
