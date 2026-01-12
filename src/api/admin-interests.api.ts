import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  Interest,
  InterestsQueryParams,
  PaginatedInterestsResponse,
  CreateInterestPayload,
  UpdateInterestPayload,
} from '@/types';

export async function getInterests(params: InterestsQueryParams = {}): Promise<PaginatedInterestsResponse> {
  const searchParams = new URLSearchParams();
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return apiGet<PaginatedInterestsResponse>(`/admin/interests${query ? `?${query}` : ''}`);
}

export async function createInterest(payload: CreateInterestPayload): Promise<Interest> {
  return apiPost<Interest, CreateInterestPayload>('/admin/interests', payload);
}

export async function updateInterest(interestId: string, payload: UpdateInterestPayload): Promise<void> {
  return apiPatch<void, UpdateInterestPayload>(`/admin/interests/${interestId}`, payload);
}

export async function deleteInterest(interestId: string): Promise<void> {
  return apiDelete<void>(`/admin/interests/${interestId}`);
}
