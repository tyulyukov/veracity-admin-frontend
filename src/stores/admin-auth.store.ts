import { create } from 'zustand';
import type { AdminInfo } from '@/types';

interface AdminAuthState {
  admin: AdminInfo | null;
  isLoading: boolean;
  setAdmin: (admin: AdminInfo | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  isLoading: true,
  setAdmin: (admin) => set({ admin, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ admin: null, isLoading: false }),
}));

