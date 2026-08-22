import api from './api';
import {
  ApiResponse,
  CreateReservationDto,
  PagedResponse,
  ReservationResponseDto,
  UpdateReservationStatusDto,
} from '../types';

export const reservationService = {
  async createReservation(data: CreateReservationDto): Promise<ApiResponse<ReservationResponseDto>> {
    const response = await api.post<ApiResponse<ReservationResponseDto>>('/reservations', data);
    return response.data;
  },

  async getMyReservations(
    page = 1,
    pageSize = 10,
    status?: string
  ): Promise<ApiResponse<PagedResponse<ReservationResponseDto>>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (status) params.status = status;

    try {
      const response = await api.get<ApiResponse<PagedResponse<ReservationResponseDto>>>(
        '/reservations/my',
        { params }
      );
      return response.data;
    } catch {
      // Fallback to /reservations/customer if /reservations/my isn't available
      const response = await api.get<ApiResponse<PagedResponse<ReservationResponseDto>>>(
        '/reservations/customer',
        { params }
      );
      return response.data;
    }
  },

  async getPharmacyReservations(
    page = 1,
    pageSize = 10,
    status?: string
  ): Promise<ApiResponse<PagedResponse<ReservationResponseDto>>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (status) params.status = status;

    const response = await api.get<ApiResponse<PagedResponse<ReservationResponseDto>>>(
      '/reservations/pharmacy',
      { params }
    );
    return response.data;
  },

  async approveReservation(
    id: string,
    expiryHours = 24
  ): Promise<ApiResponse<ReservationResponseDto>> {
    const response = await api.put<ApiResponse<ReservationResponseDto>>(
      `/reservations/${id}/approve`,
      null,
      { params: { expiryHours } }
    );
    return response.data;
  },

  async rejectReservation(
    id: string,
    reason = 'Rejected by pharmacy'
  ): Promise<ApiResponse<ReservationResponseDto>> {
    const response = await api.put<ApiResponse<ReservationResponseDto>>(
      `/reservations/${id}/reject`,
      { reasonOrNote: reason }
    );
    return response.data;
  },

  async fulfillReservation(
    id: string
  ): Promise<ApiResponse<ReservationResponseDto>> {
    const response = await api.put<ApiResponse<ReservationResponseDto>>(
      `/reservations/${id}/fulfill`
    );
    return response.data;
  },

  async cancelReservation(
    id: string,
    reason = 'Cancelled by user'
  ): Promise<ApiResponse<ReservationResponseDto>> {
    const response = await api.put<ApiResponse<ReservationResponseDto>>(
      `/reservations/${id}/cancel`
    );
    return response.data;
  },

  async updateReservationStatus(
    id: string,
    action: 'approve' | 'reject' | 'fulfill' | 'cancel',
    data?: UpdateReservationStatusDto
  ): Promise<ApiResponse<ReservationResponseDto>> {
    if (action === 'approve') {
      return this.approveReservation(id);
    }
    if (action === 'reject') {
      return this.rejectReservation(id, data?.reasonOrNote);
    }
    if (action === 'fulfill') {
      return this.fulfillReservation(id);
    }
    return this.cancelReservation(id, data?.reasonOrNote);
  },
};

export default reservationService;
