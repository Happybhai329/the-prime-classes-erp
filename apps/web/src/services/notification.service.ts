import { api } from '@/lib/api';
import { PaginatedResponse } from '@prime/shared-types';

export const notificationService = {
  create: (data: any) =>
    api.post('/notifications', data).then(r => r.data),

  getNotifications: (params?: any) =>
    api.get<PaginatedResponse<any>>('/notifications', { params }).then(r => r.data),

  getUnreadCount: () =>
    api.get<{ unreadCount: number }>('/notifications/unread-count').then(r => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then(r => r.data),
};
