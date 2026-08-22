import api from './api';
import {
  AdminAnalyticsResponseDto,
  ApiResponse,
  PharmacyAnalyticsResponseDto,
} from '../types';

export const analyticsService = {
  async getAdminAnalytics(): Promise<ApiResponse<AdminAnalyticsResponseDto>> {
    const response = await api.get<ApiResponse<AdminAnalyticsResponseDto>>('/analytics/admin');
    return response.data;
  },

  async getPharmacyAnalytics(): Promise<ApiResponse<PharmacyAnalyticsResponseDto>> {
    const response = await api.get<ApiResponse<PharmacyAnalyticsResponseDto>>(
      '/analytics/pharmacy'
    );
    return response.data;
  },
};

export default analyticsService;
