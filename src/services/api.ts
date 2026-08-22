import axios from 'axios';
import { handleMockRequest } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and fallback to built-in Mock API
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend explicitly answered with 401 Unauthorized, handle session expiry
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Catch Network Errors, missing response, server errors, 404s or timeouts, and route to local Mock API
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response.status >= 500 ||
      error.response.status === 404
    ) {
      if (error.config) {
        try {
          console.warn('[MediFind API] Live server unreachable or returned error. Falling back to built-in Mock API for:', error.config.url);
          const mockRes = await handleMockRequest(error.config);
          if (mockRes) {
            return mockRes;
          }
        } catch (mockErr) {
          return Promise.reject(mockErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

