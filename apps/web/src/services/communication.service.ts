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
    const res = await api.post('/support-desk/tickets', data);
    return res.data.data;
  },

  getMyTickets: async (params?: Record<string, any>) => {
    const res = await api.get('/support-desk/tickets', { params });
    return res.data.data;
  },

  getAllTickets: async (params?: Record<string, any>) => {
    const res = await api.get('/support-desk/tickets/all', { params });
    return res.data.data;
  },

  getTicketDetail: async (id: string) => {
    const res = await api.get(`/support-desk/tickets/${id}`);
    return res.data.data;
  },

  replyToTicket: async (id: string, data: ReplyTicketPayload) => {
    const res = await api.post(`/support-desk/tickets/${id}/reply`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    const res = await api.patch(`/support-desk/tickets/${id}/status`, { status });
    return res.data.data;
  },

  assignTicket: async (id: string, assigneeId: string) => {
    const res = await api.patch(`/support-desk/tickets/${id}/assign`, { assigneeId });
    return res.data.data;
  },
};
