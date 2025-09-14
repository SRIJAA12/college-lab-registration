import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, LOCAL_STORAGE_KEYS, ERROR_CODES } from '../utils/constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: originalRequest?.url,
      method: originalRequest?.method
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorData = error.response.data as any;
      
      if (errorData?.error === ERROR_CODES.TOKEN_EXPIRED || 
          errorData?.error === ERROR_CODES.INVALID_TOKEN) {
        // Clear stored authentication data
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_LOGIN);
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError = {
        ...error,
        response: {
          data: {
            success: false,
            message: 'Network error. Please check your internet connection.',
            error: ERROR_CODES.NETWORK_ERROR
          },
          status: 0,
          statusText: 'Network Error'
        }
      };
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // Check if error is a network error
  isNetworkError: (error: any): boolean => {
    return !error.response || error.response.status === 0;
  },

  // Check if error is an authentication error
  isAuthError: (error: any): boolean => {
    return error.response?.status === 401;
  },

  // Check if error is a validation error
  isValidationError: (error: any): boolean => {
    return error.response?.status === 400 && error.response?.data?.error === ERROR_CODES.VALIDATION_ERROR;
  },

  // Get error message from response
  getErrorMessage: (error: any): string => {
    if (apiHelpers.isNetworkError(error)) {
      return 'Network error. Please check your internet connection.';
    }
    
    return error.response?.data?.message || error.message || 'An unexpected error occurred.';
  },

  // Get validation errors
  getValidationErrors: (error: any): any[] => {
    if (apiHelpers.isValidationError(error)) {
      return error.response?.data?.errors || [];
    }
    return [];
  }
};

// Auth API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verifyToken: () =>
    api.get('/auth/verify'),

  verifyDob: (email: string, dob: string) =>
    api.post('/auth/verify-dob', { email, dob }),

  resetPassword: (resetToken: string, newPassword: string) =>
    api.post('/auth/reset-password', { resetToken, newPassword }),

  facultyResetPassword: (email: string, newPassword: string) =>
    api.post('/auth/faculty-reset-password', { email, newPassword }),

  getUserProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data: { name?: string; department?: string }) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword })
};

// Registration API endpoints
export const registrationAPI = {
  create: (registrationData: any) =>
    api.post('/registration', registrationData),

  getAll: (params?: any) =>
    api.get('/registration', { params }),

  getMyRegistrations: (params?: any) =>
    api.get('/registration/my-registrations', { params }),

  endSession: (id: string, notes?: string) =>
    api.put(`/registration/${id}/end-session`, { notes }),

  getStats: (period?: string) =>
    api.get('/registration/stats', { params: { period } }),

  getLabUtilization: (labNo: string, period?: string) =>
    api.get(`/registration/lab/${labNo}/utilization`, { params: { period } }),

  export: (params?: any) =>
    api.get('/registration/export', { params })
};

export default api;
