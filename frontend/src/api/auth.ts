import { post } from './client';
import { LoginRequest, LoginResponse } from '../types/api';
import { mockAuthApi } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (useMock) {
    return mockAuthApi.login(credentials);
  }
  return post<LoginResponse>('/auth/login', credentials);
}
