import api from './api';
import { ApiResponse, NotificationResponseDto, PagedResponse } from '../types';

export const notificationService = {
  async getNotifications(
    page = 1,
    pageSize = 15,
    unreadOnly?: boolean
  ): Promise<ApiResponse<PagedResponse<NotificationResponseDto>>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (unreadOnly !== undefined) params.unreadOnly = unreadOnly;

    const response = await api.get<ApiResponse<PagedResponse<NotificationResponseDto>>>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    const response = await api.put<ApiResponse<boolean>>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    const response = await api.put<ApiResponse<boolean>>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
