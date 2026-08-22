import api from './api';
import {
  ApiResponse,
  CustomerRegisterDto,
  LoginRequestDto,
  LoginResponseDto,
  PharmacyRegisterDto,
  UserResponseDto,
} from '../types';

export const authService = {
  async login(data: { email: string; password: string }): Promise<ApiResponse<LoginResponseDto>> {
    // Backend expects LoginRequestDto: { email, password }
    const response = await api.post<ApiResponse<LoginResponseDto>>('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  async registerCustomer(data: CustomerRegisterDto): Promise<ApiResponse<UserResponseDto>> {
    const response = await api.post<ApiResponse<UserResponseDto>>('/auth/register/customer', data);
    return response.data;
  },

  async registerPharmacy(data: PharmacyRegisterDto): Promise<ApiResponse<UserResponseDto>> {
    const response = await api.post<ApiResponse<UserResponseDto>>('/auth/register/pharmacy', data);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<UserResponseDto>> {
    const response = await api.get<ApiResponse<UserResponseDto>>('/auth/me');
    return response.data;
  },
};

export default authService;
