import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminModeratorsApi from '@/api/admin-moderators.api';
import type { ModeratorsQueryParams, CreateModeratorPayload } from '@/types';

export function useModerators(params: ModeratorsQueryParams = {}) {
  return useQuery({
    queryKey: ['adminModerators', params],
    queryFn: () => adminModeratorsApi.getModerators(params),
  });
}

export function useCreateModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateModeratorPayload) => adminModeratorsApi.createModerator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModerators'] });
    },
  });
}

export function useDeleteModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => adminModeratorsApi.deleteModerator(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminModerators'] });
    },
  });
}

