import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useCurrentAdmin } from '@/hooks/use-admin-auth';
import { useAdminAuthStore } from '@/stores/admin-auth.store';

export function ProtectedRoute() {
  const { isLoading, isError } = useCurrentAdmin();
  const { admin } = useAdminAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isLoading, isError } = useCurrentAdmin();
  const { admin } = useAdminAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isError && admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function OwnerOnlyRoute() {
  const { isLoading, isError } = useCurrentAdmin();
  const { admin } = useAdminAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !admin) {
    return <Navigate to="/login" replace />;
  }

  if (admin.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

