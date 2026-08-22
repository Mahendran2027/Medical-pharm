import api from './api';
import {
  ApiResponse,
  CreateCategoryDto,
  CreateMedicineDto,
  MedicineCategoryDto,
  MedicineResponseDto,
  PagedResponse,
  PharmacyResponseDto,
  UpdateMedicineDto,
  UserResponseDto,
} from '../types';

export const adminService = {
  // Users Management
  async getUsers(
    page = 1,
    pageSize = 10,
    role?: string
  ): Promise<ApiResponse<PagedResponse<UserResponseDto>>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (role) params.role = role;

    const response = await api.get<ApiResponse<PagedResponse<UserResponseDto>>>('/users', {
      params,
    });
    return response.data;
  },

  async getUserById(id: string): Promise<ApiResponse<UserResponseDto>> {
    const response = await api.get<ApiResponse<UserResponseDto>>(`/users/${id}`);
    return response.data;
  },

  // Pharmacy Approvals & Oversight
  async getAllPharmacies(
    page = 1,
    pageSize = 10,
    isApproved?: boolean
  ): Promise<ApiResponse<PagedResponse<PharmacyResponseDto>>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (isApproved !== undefined) params.isApproved = isApproved;

    const response = await api.get<ApiResponse<PagedResponse<PharmacyResponseDto>>>(
      '/admin/Pharmacies',
      { params }
    );
    return response.data;
  },

  async approvePharmacy(id: string): Promise<ApiResponse<PharmacyResponseDto>> {
    const response = await api.put<ApiResponse<PharmacyResponseDto>>(
      `/admin/Pharmacies/${id}/approve`
    );
    return response.data;
  },

  async deactivatePharmacy(id: string): Promise<ApiResponse<PharmacyResponseDto>> {
    const response = await api.put<ApiResponse<PharmacyResponseDto>>(
      `/admin/Pharmacies/${id}/deactivate`
    );
    return response.data;
  },

  // Medicines Catalog Management
  async createMedicine(dto: CreateMedicineDto): Promise<ApiResponse<MedicineResponseDto>> {
    const response = await api.post<ApiResponse<MedicineResponseDto>>('/medicines', dto);
    return response.data;
  },

  async updateMedicine(
    id: string,
    dto: UpdateMedicineDto
  ): Promise<ApiResponse<MedicineResponseDto>> {
    const response = await api.put<ApiResponse<MedicineResponseDto>>(`/medicines/${id}`, dto);
    return response.data;
  },

  async deleteMedicine(id: string): Promise<ApiResponse<boolean>> {
    const response = await api.delete<ApiResponse<boolean>>(`/medicines/${id}`);
    return response.data;
  },

  // Categories Management
  async createCategory(name: string, description = ''): Promise<ApiResponse<MedicineCategoryDto>> {
    const response = await api.post<ApiResponse<MedicineCategoryDto>>('/medicines/categories', {
      name,
      description,
    });
    return response.data;
  },
};

export default adminService;
