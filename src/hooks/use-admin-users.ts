import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminUsersApi from '@/api/admin-users.api';
import type { UsersQueryParams, UpdateUserStatusPayload, UpdateUserRolePayload, EventsQueryParams } from '@/types';

export function useUsers(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminUsersApi.getUsers(params),
  });
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => adminUsersApi.getUserById(userId!),
    enabled: !!userId,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserStatusPayload }) =>
      adminUsersApi.updateUserStatus(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserRolePayload }) =>
      adminUsersApi.updateUserRole(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', userId] });
    },
  });
}

export function useUserEvents(userId: string | undefined, params: EventsQueryParams = {}) {
  return useQuery({
    queryKey: ['adminUserEvents', userId, params],
    queryFn: () => adminUsersApi.getUserEvents(userId!, params),
    enabled: !!userId,
  });
}

