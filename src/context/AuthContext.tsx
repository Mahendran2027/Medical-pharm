import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ApiResponse,
  CustomerRegisterDto,
  LoginResponseDto,
  PharmacyRegisterDto,
  UserResponseDto,
} from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: UserResponseDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<LoginResponseDto>>;
  registerCustomer: (data: CustomerRegisterDto) => Promise<ApiResponse<UserResponseDto>>;
  registerPharmacy: (data: PharmacyRegisterDto) => Promise<ApiResponse<UserResponseDto>>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse<LoginResponseDto>> => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const registerCustomer = async (data: CustomerRegisterDto): Promise<ApiResponse<UserResponseDto>> => {
    return await authService.registerCustomer(data);
  };

  const registerPharmacy = async (data: PharmacyRegisterDto): Promise<ApiResponse<UserResponseDto>> => {
    return await authService.registerPharmacy(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await authService.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch {
        // Ignore refresh errors
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        registerCustomer,
        registerPharmacy,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
