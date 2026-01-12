import { apiGet } from './client';
import type {
  PostsQueryParams,
  PaginatedPostsResponse,
  ActivityQueryParams,
  PaginatedActivityResponse,
} from '@/types';

export async function getUserPosts(userId: string, params: PostsQueryParams = {}): Promise<PaginatedPostsResponse> {
  const searchParams = new URLSearchParams();
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiGet<PaginatedPostsResponse>(`/admin/users/${userId}/posts${query ? `?${query}` : ''}`);
}

export async function getUserActivity(userId: string, params: ActivityQueryParams = {}): Promise<PaginatedActivityResponse> {
  const searchParams = new URLSearchParams();
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiGet<PaginatedActivityResponse>(`/admin/users/${userId}/activity${query ? `?${query}` : ''}`);
}
