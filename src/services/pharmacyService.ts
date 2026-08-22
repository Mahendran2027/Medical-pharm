import api from './api';
import {
  ApiResponse,
  PharmacyAnalyticsResponseDto,
  PharmacyResponseDto,
  UpdatePharmacyDto,
} from '../types';

export const pharmacyService = {
  async getMyPharmacyProfile(): Promise<ApiResponse<PharmacyResponseDto>> {
    const response = await api.get<ApiResponse<PharmacyResponseDto>>('/pharmacies/me');
    return response.data;
  },

  async updateMyPharmacyProfile(
    data: UpdatePharmacyDto
  ): Promise<ApiResponse<PharmacyResponseDto>> {
    const response = await api.put<ApiResponse<PharmacyResponseDto>>('/pharmacies/me', data);
    return response.data;
  },

  async getPharmacyAnalytics(): Promise<ApiResponse<PharmacyAnalyticsResponseDto>> {
    const response = await api.get<ApiResponse<PharmacyAnalyticsResponseDto>>(
      '/analytics/pharmacy'
    );
    return response.data;
  },
};

export default pharmacyService;
