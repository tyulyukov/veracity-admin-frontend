import { apiGet, apiPost, apiDelete } from './client';
import type {
  ModeratorsQueryParams,
  PaginatedModeratorsResponse,
  CreateModeratorPayload,
  Moderator,
} from '@/types';

export async function getModerators(params: ModeratorsQueryParams = {}): Promise<PaginatedModeratorsResponse> {
  const searchParams = new URLSearchParams();
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return apiGet<PaginatedModeratorsResponse>(`/admin/moderators${query ? `?${query}` : ''}`);
}

export async function createModerator(payload: CreateModeratorPayload): Promise<Moderator> {
  return apiPost<Moderator, CreateModeratorPayload>('/admin/moderators', payload);
}

export async function deleteModerator(email: string): Promise<void> {
  return apiDelete<void>(`/admin/moderators/${encodeURIComponent(email)}`);
}

