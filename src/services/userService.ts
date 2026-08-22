import api from './api';
import { ApiResponse, UserResponseDto, UpdateUserDto } from '../types';

export const userService = {
  async getCurrentUserProfile(): Promise<ApiResponse<UserResponseDto>> {
    try {
      const response = await api.get<ApiResponse<UserResponseDto>>('/users/me');
      return response.data;
    } catch {
      const response = await api.get<ApiResponse<UserResponseDto>>('/auth/me');
      return response.data;
    }
  },

  async updateProfile(data: UpdateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const response = await api.put<ApiResponse<UserResponseDto>>('/users/me', data);
    return response.data;
  },
};

export default userService;
