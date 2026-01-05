import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAdminAuthStore } from '@/stores/admin-auth.store';
import * as adminAuthApi from '@/api/admin-auth.api';
import type { AdminLoginPayload } from '@/types';

export function useCurrentAdmin() {
  const { setAdmin } = useAdminAuthStore();

  return useQuery({
    queryKey: ['currentAdmin'],
    queryFn: async () => {
      const admin = await adminAuthApi.getMe();
      setAdmin(admin);
      return admin;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: (payload: AdminLoginPayload) => adminAuthApi.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentAdmin'] });
      navigate('/');
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearAuth } = useAdminAuthStore();

  return useMutation({
    mutationFn: () => adminAuthApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
}

