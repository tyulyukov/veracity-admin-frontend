import { useQuery } from '@tanstack/react-query';
import * as adminContentApi from '@/api/admin-content.api';
import type { PostsQueryParams, ActivityQueryParams } from '@/types';

export function useUserPosts(userId: string | undefined, params: PostsQueryParams = {}) {
  return useQuery({
    queryKey: ['adminUserPosts', userId, params],
    queryFn: () => adminContentApi.getUserPosts(userId!, params),
    enabled: !!userId,
  });
}

export function useUserActivity(userId: string | undefined, params: ActivityQueryParams = {}) {
  return useQuery({
    queryKey: ['adminUserActivity', userId, params],
    queryFn: () => adminContentApi.getUserActivity(userId!, params),
    enabled: !!userId,
  });
}
