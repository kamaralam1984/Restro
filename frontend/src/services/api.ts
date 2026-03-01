import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401/403 - Unauthorized/Forbidden (token expired or invalid)
      if (error.response.status === 401 || error.response.status === 403) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          // Redirect to login if we're in admin area
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }
        const message = (error.response.data as any)?.error || 'Session expired. Please login again.';
        throw new Error(message);
      }
      // Server responded with error status
      const message = (error.response.data as any)?.error || error.message;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const api = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(endpoint, config).then((res) => res.data),
  
  post: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(endpoint, data, config).then((res) => res.data),
  
  put: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(endpoint, data, config).then((res) => res.data),
  
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(endpoint, config).then((res) => res.data),
  
  patch: <T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(endpoint, data, config).then((res) => res.data),
};

export default api;

