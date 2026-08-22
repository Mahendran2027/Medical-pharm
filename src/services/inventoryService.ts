import api from './api';
import {
  ApiResponse,
  CreateInventoryDto,
  InventoryResponseDto,
  InventoryTransactionResponseDto,
  PagedResponse,
  UpdateInventoryDto,
} from '../types';

export const inventoryService = {
  async getInventory(
    page = 1,
    pageSize = 20,
    search?: string,
    lowStockOnly?: boolean
  ): Promise<ApiResponse<PagedResponse<InventoryResponseDto>>> {
    const params: Record<string, string | number | boolean> = { page, pageSize };
    if (search) params.search = search;
    if (lowStockOnly !== undefined) {
      params.isLowStock = lowStockOnly;
      params.lowStockOnly = lowStockOnly;
    }

    const response = await api.get<ApiResponse<PagedResponse<InventoryResponseDto>>>(
      '/pharmacies/me/inventory',
      { params }
    );
    return response.data;
  },

  async addInventory(data: CreateInventoryDto): Promise<ApiResponse<InventoryResponseDto>> {
    const response = await api.post<ApiResponse<InventoryResponseDto>>(
      '/pharmacies/me/inventory',
      data
    );
    return response.data;
  },

  async updateInventory(
    id: string,
    data: UpdateInventoryDto
  ): Promise<ApiResponse<InventoryResponseDto>> {
    const response = await api.put<ApiResponse<InventoryResponseDto>>(
      `/pharmacies/me/inventory/${id}`,
      data
    );
    return response.data;
  },

  async getLowStockInventory(): Promise<ApiResponse<InventoryResponseDto[]>> {
    const response = await api.get<ApiResponse<InventoryResponseDto[]>>(
      '/pharmacies/me/inventory/low-stock'
    );
    return response.data;
  },

  async getInventoryHistory(
    page = 1,
    pageSize = 20
  ): Promise<ApiResponse<PagedResponse<InventoryTransactionResponseDto>>> {
    const response = await api.get<ApiResponse<PagedResponse<InventoryTransactionResponseDto>>>(
      '/pharmacies/me/inventory/history',
      { params: { page, pageSize } }
    );
    return response.data;
  },
};

export default inventoryService;
