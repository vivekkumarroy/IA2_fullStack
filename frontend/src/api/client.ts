import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiSuccess } from '../types/api';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('shelflife_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401 unauthenticated, clear session and redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('shelflife_token');
      localStorage.removeItem('shelflife_user');
      // Only redirect if not already on the login page to avoid loops
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Generic GET helper that automatically unwraps { success: true, data: T, meta?: PageMeta }
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response: AxiosResponse<ApiSuccess<T> | T> = await apiClient.get(url, { params });
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body && body.success === true && 'data' in body) {
    // If the response carries meta (e.g. paginated endpoints), combine data and meta
    if ('meta' in body && body.meta !== undefined) {
      return { data: body.data, meta: body.meta } as unknown as T;
    }
    return body.data as T;
  }
  return body as T;
}

/**
 * Generic POST helper that unwraps { success: true, data: T }
 */
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<ApiSuccess<T> | T> = await apiClient.post(url, data, config);
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body && body.success === true && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}
