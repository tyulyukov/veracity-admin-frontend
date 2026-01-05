import { createBrowserRouter } from 'react-router';
import { ProtectedRoute, PublicOnlyRoute, OwnerOnlyRoute } from './protected-route';
import { AdminLayout } from '@/layouts/admin-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { UsersPage } from '@/pages/users';
import { UserDetailPage } from '@/pages/user-detail';
import { ModeratorsPage } from '@/pages/moderators';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'users/:userId',
            element: <UserDetailPage />,
          },
        ],
      },
    ],
  },
  {
    element: <OwnerOnlyRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'moderators',
            element: <ModeratorsPage />,
          },
        ],
      },
    ],
  },
]);

