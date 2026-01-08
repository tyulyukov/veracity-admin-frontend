# Veracity Admin Frontend - AI Agent Guidelines

Follow these rules strictly when working on this codebase.

## Project Structure

```
src/
├── api/           # API client and endpoint modules
├── stores/        # Zustand stores for client state
├── types/         # Shared TypeScript types
├── hooks/         # Custom React hooks (including TanStack Query hooks)
├── routes/        # React Router configuration and route guards
├── layouts/       # Layout components (admin shell with sidebar)
├── pages/         # Page components organized by feature
│   ├── login.tsx      # Admin login page
│   ├── dashboard.tsx  # Main dashboard (stats overview)
│   ├── users.tsx      # User management table
│   ├── user-detail.tsx # Individual user details
│   └── moderators.tsx # Moderator management (owner only)
├── components/
│   └── ui/        # shadcn/ui components
└── lib/           # Utility functions
```

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Routing**: React Router v7 (data router pattern with `createBrowserRouter`)
- **Server State**: TanStack Query v5 (`@tanstack/react-query`)
- **Client State**: Zustand (auth state caching)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix-based)
- **Tables**: TanStack Table v8 (for user/moderator lists)
- **Icons**: Lucide React

## Design System

### Colors (CSS Variables)

All colors use OKLCH color space. Key variables:

- `--background`: Deep charcoal (`oklch(0.04 0.005 250)`)
- `--foreground`: Near-white (`oklch(0.98 0.005 250)`)
- `--primary`: Warm gold/amber (`oklch(0.78 0.12 75)`)
- `--primary-foreground`: Dark contrast for primary (`oklch(0.15 0.02 75)`)
- `--card`: Slightly lighter than background (`oklch(0.08 0.008 250)`)
- `--muted-foreground`: Subdued text (`oklch(0.65 0.02 250)`)
- `--border`: 10% white opacity (`oklch(1 0 0 / 10%)`)
- `--destructive`: Red for errors (`oklch(0.60 0.20 25)`)
- `--sidebar`: Sidebar background (`oklch(0.06 0.006 250)`)
- `--sidebar-border`: Sidebar borders (`oklch(1 0 0 / 8%)`)

### Typography

- **Headers**: `font-display` (Instrument Sans Variable) - bold, sharp, impactful
- **Body**: `font-sans` (Inter Variable) - clean, readable
- Use `font-display` class for all headings (`<h1>`, `<h2>`, etc.)

### Spacing & Radius

- Border radius: `--radius: 0.5rem` with variants (`--radius-sm`, `--radius-lg`, etc.)
- Consistent padding: 4, 6, 8 for small, medium, large containers

## Component Patterns

### Use shadcn/ui Components

Import from `@/components/ui/*`. Available components:
- `Button`, `Input`, `Label`, `Select`
- `Card`, `Badge`, `Separator`, `Avatar`
- `DropdownMenu`, `AlertDialog`
- `DataTable` (custom TanStack Table wrapper)

### Component Guidelines

1. **No inline styles** - Use Tailwind classes exclusively
2. **Composition over configuration** - Build complex UI from simple primitives
3. **Consistent loading states** - Use `<Loader2 className="animate-spin" />` from lucide-react
4. **Error handling** - Display errors in styled boxes with `bg-destructive/10 border-destructive/20`

### Page Structure

```tsx
export function ExamplePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      {/* Content */}
    </div>
  );
}
```

## State Management

### Zustand (Client State)

- Store in `src/stores/*.store.ts`
- Use for admin auth state caching
- Keep stores minimal - prefer TanStack Query for server data

```ts
import { create } from 'zustand';

interface AdminAuthState {
  admin: AdminInfo | null;
  setAdmin: (admin: AdminInfo | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  setAdmin: (admin) => set({ admin }),
}));
```

### TanStack Query (Server State)

- Query hooks in `src/hooks/use-*.ts`
- Use `queryKey` arrays for cache management
- Mutations with `useMutation` for POST/PATCH/DELETE

```ts
export function useAdminUsers(params: UsersQueryParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminUsersApi.getUsers(params),
  });
}
```

## API Layer

### Structure

- `src/api/client.ts` - Base fetch wrapper with credentials
- `src/api/admin-auth.api.ts` - Admin authentication
- `src/api/admin-users.api.ts` - User management endpoints
- `src/api/admin-moderators.api.ts` - Moderator management endpoints

### Conventions

1. All requests include `credentials: 'include'` for cookie auth
2. Base URL: `http://localhost:7007/api/v1`
3. Use typed functions, no `any`
4. Throw `ApiClientError` for non-OK responses

```ts
export async function getUsers(params: UsersQueryParams): Promise<PaginatedUsersResponse> {
  const queryString = new URLSearchParams();
  if (params.offset !== undefined) queryString.set('offset', params.offset.toString());
  if (params.limit !== undefined) queryString.set('limit', params.limit.toString());
  if (params.status) queryString.set('status', params.status);
  if (params.search) queryString.set('search', params.search);

  return apiGet<PaginatedUsersResponse>(`/admin/users?${queryString}`);
}
```

## Routing & Access Control

### Route Guards

- `PublicOnlyRoute` - Redirects authenticated admins away (login page only)
- `ProtectedRoute` - Requires any authenticated admin (moderator or owner)
- `OwnerOnlyRoute` - Requires owner role (for moderator management)

### Protected Route Pattern

```tsx
{
  element: <OwnerOnlyRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: 'moderators', element: <ModeratorsPage /> },
      ],
    },
  ],
}
```

### Role Hierarchy

- **Owner**: Full access to all features including moderator management
- **Moderator**: Access to dashboard and user management only

## Admin Features

### Dashboard
- Display key metrics (total users, pending users, active users)
- Overview of platform statistics
- Quick access to common tasks

### User Management
- View all users with pagination
- Filter by status (pending, active, inactive)
- Search by name or email
- Update user status (approve/suspend)
- Update user role (standard_user/speaker)
- View detailed user information including:
  - Profile data
  - Connection statistics
  - Activity history
  - Interests

### Moderator Management (Owner Only)
- View all moderators
- Create new moderators
- Delete moderators
- Role displayed for each moderator

## TypeScript Rules

1. **No `any`** - Use proper types or `unknown` with type guards
2. **Types match backend DTOs** - Keep `src/types/index.ts` in sync with backend
3. **Prefer interfaces** for object shapes, types for unions
4. **Export all types** - Make types reusable across the codebase

## Styling Guidelines

### Tailwind Best Practices

1. **Dark mode only** - The app is dark mode only (class on `<html>`)
2. **Use CSS variables** - `bg-background`, `text-foreground`, `border-border`
3. **Responsive** - Mobile-first with `sm:`, `md:`, `lg:` breakpoints
4. **Hover/Focus states** - Always include `hover:`, `focus:` variants
5. **Sidebar design** - Use `sidebar-*` variables for sidebar components

### Common Patterns

```tsx
// Sidebar navigation item (active)
<Link className="bg-sidebar-accent text-sidebar-primary">

// Sidebar navigation item (inactive)
<Link className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">

// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Destructive action
<Button variant="destructive" className="bg-destructive text-white hover:bg-destructive/90">

// Status badge
<Badge className="bg-muted text-muted-foreground">
```

## Animation Guidelines

1. **Prefer CSS transitions** - `transition-colors`, `transition-transform`
2. **Use Tailwind animate classes** - `animate-pulse`, `animate-spin`
3. **Sidebar transitions** - Smooth slide-in/out on mobile (`transition-transform duration-200`)
4. **Keep animations subtle** - 200-300ms duration, ease-out timing

## Tables (TanStack Table)

### DataTable Component

Use the custom `DataTable` component for all tables:

```tsx
import { DataTable } from '@/components/ui/data-table';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  // ... more columns
];

<DataTable columns={columns} data={users} />
```

### Table Conventions

1. Use `columnHelper.accessor()` for type-safe column definitions
2. Include sorting for string/date columns
3. Use custom cell renderers for badges, actions, etc.
4. Keep actions in the last column (usually a dropdown menu)

## Code Style

1. **No comments unless requested** - Code should be self-documenting
2. **Concise components** - Extract reusable parts, avoid prop drilling
3. **SOLID/DRY principles** - Single responsibility, don't repeat yourself
4. **Named exports** - Prefer `export function X()` over default exports
5. **File naming** - kebab-case for files (`user-detail.tsx`)

## Adding New Features

1. Create types in `src/types/index.ts`
2. Add API functions in `src/api/*.api.ts`
3. Create query hooks in `src/hooks/`
4. Build page in `src/pages/`
5. Add route in `src/routes/router.tsx`
6. Update layout navigation if needed (`src/layouts/admin-layout.tsx`)

## Testing Locally

```bash
npm run dev    # Start dev server
npm run build  # Type check + production build
npm run lint   # ESLint check
```

Backend API must be running at `localhost:7007` for auth and data to work.

## Admin-Specific Best Practices

1. **Always check admin role** - Use conditional rendering for owner-only features
2. **Confirm destructive actions** - Use `AlertDialog` for delete/suspend operations
3. **Show clear feedback** - Toast notifications for successful actions
4. **Handle permissions gracefully** - Redirect or show error for unauthorized access
5. **Validate admin actions** - Never trust client-side role checks alone
