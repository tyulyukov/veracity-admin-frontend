import { apiGet, apiPatch } from './client';
import type {
  User,
  UsersQueryParams,
  PaginatedUsersResponse,
  UpdateUserStatusPayload,
  UpdateUserRolePayload,
} from '@/types';

export async function getUsers(params: UsersQueryParams = {}): Promise<PaginatedUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return apiGet<PaginatedUsersResponse>(`/admin/users${query ? `?${query}` : ''}`);
}

export async function getUserById(userId: string): Promise<User> {
  return apiGet<User>(`/admin/users/${userId}`);
}

export async function updateUserStatus(userId: string, payload: UpdateUserStatusPayload): Promise<void> {
  return apiPatch<void, UpdateUserStatusPayload>(`/admin/users/${userId}/status`, payload);
}

export async function updateUserRole(userId: string, payload: UpdateUserRolePayload): Promise<void> {
  return apiPatch<void, UpdateUserRolePayload>(`/admin/users/${userId}/role`, payload);
}

