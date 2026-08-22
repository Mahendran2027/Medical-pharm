import api from './api';
import {
  ApiResponse,
  MedicineCategoryDto,
  MedicineResponseDto,
  MedicineSearchResponseDto,
  PagedResponse,
} from '../types';

export const medicineService = {
  async getMedicines(
    page = 1,
    pageSize = 10,
    categoryId?: string,
    search?: string
  ): Promise<ApiResponse<PagedResponse<MedicineResponseDto>>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;

    const response = await api.get<ApiResponse<PagedResponse<MedicineResponseDto>>>('/medicines', {
      params,
    });
    return response.data;
  },

  async getMedicineById(id: string): Promise<ApiResponse<MedicineResponseDto>> {
    const response = await api.get<ApiResponse<MedicineResponseDto>>(`/medicines/${id}`);
    return response.data;
  },

  async getCategories(): Promise<ApiResponse<MedicineCategoryDto[]>> {
    const response = await api.get<ApiResponse<MedicineCategoryDto[]>>('/medicines/categories');
    return response.data;
  },

  async searchMedicines(
    query: string,
    city?: string
  ): Promise<ApiResponse<MedicineSearchResponseDto[]>> {
    const params: Record<string, string> = { query };
    if (city) params.city = city;

    const response = await api.get<ApiResponse<MedicineSearchResponseDto[]>>('/search/medicines', {
      params,
    });
    return response.data;
  },
};

export default medicineService;
