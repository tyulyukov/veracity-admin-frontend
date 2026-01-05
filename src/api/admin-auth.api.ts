import { apiPost, apiGet } from './client';
import type { AdminLoginPayload, AdminInfo } from '@/types';

export async function login(payload: AdminLoginPayload): Promise<{ message: string }> {
  return apiPost<{ message: string }, AdminLoginPayload>('/admin/auth/login', payload);
}

export async function logout(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/admin/auth/logout');
}

export async function getMe(): Promise<AdminInfo> {
  return apiGet<AdminInfo>('/admin/me');
}

