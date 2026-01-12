import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminInterestsApi from '@/api/admin-interests.api';
import type { InterestsQueryParams, CreateInterestPayload, UpdateInterestPayload } from '@/types';

export function useInterests(params: InterestsQueryParams = {}) {
  return useQuery({
    queryKey: ['adminInterests', params],
    queryFn: () => adminInterestsApi.getInterests(params),
  });
}

export function useCreateInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInterestPayload) => adminInterestsApi.createInterest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInterests'] });
    },
  });
}

export function useUpdateInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interestId, payload }: { interestId: string; payload: UpdateInterestPayload }) =>
      adminInterestsApi.updateInterest(interestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInterests'] });
    },
  });
}

export function useDeleteInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interestId: string) => adminInterestsApi.deleteInterest(interestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInterests'] });
    },
  });
}
