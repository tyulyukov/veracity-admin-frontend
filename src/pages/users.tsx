import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { useUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/use-admin-users';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Search, MoreHorizontal, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import type { User, UserStatus, UserRole } from '@/types';
import { getFullStorageUrl } from '@/lib/storage';

const PAGE_SIZE = 10;

const statusConfig: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof CheckCircle }> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  inactive: { label: 'Inactive', variant: 'destructive', icon: XCircle },
};

const roleConfig: Record<UserRole, { label: string }> = {
  standard_user: { label: 'User' },
  speaker: { label: 'Speaker' },
};

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [page, setPage] = useState(0);

  const statusFilter = (searchParams.get('status') as UserStatus | null) ?? undefined;

  const { data, isLoading } = useUsers({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    status: statusFilter,
    search: debouncedSearch || undefined,
  });

  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleStatusFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', value);
    }
    setSearchParams(newParams);
    setPage(0);
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    updateStatus.mutate({ userId, payload: { status } });
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateRole.mutate({ userId, payload: { role } });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <Link to={`/users/${row.original.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar
            src={getFullStorageUrl(row.original.avatarUrl)}
            firstName={row.original.firstName}
            lastName={row.original.lastName}
            seed={row.original.id}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-sm text-muted-foreground truncate">{row.original.email}</p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status];
        return (
          <Badge
            variant={config.variant}
            className={cn(
              row.original.status === 'active' && 'bg-emerald-500/10 text-emerald-500',
              row.original.status === 'pending' && 'bg-amber-500/10 text-amber-500'
            )}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {roleConfig[row.original.role]?.label ?? row.original.role}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/users/${row.original.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Change Status
            </div>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original.id, 'active')}
              disabled={row.original.status === 'active' || updateStatus.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original.id, 'inactive')}
              disabled={row.original.status === 'inactive' || updateStatus.isPending}
            >
              <XCircle className="w-4 h-4 mr-2 text-destructive" />
              Deactivate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Change Role
            </div>
            <DropdownMenuItem
              onClick={() => handleRoleChange(row.original.id, 'standard_user')}
              disabled={row.original.role === 'standard_user' || updateRole.isPending}
            >
              Set as User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange(row.original.id, 'speaker')}
              disabled={row.original.role === 'speaker' || updateRole.isPending}
            >
              Set as Speaker
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts, approve registrations, and update roles
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter ?? 'all'} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data?.users ?? []} />

          {data && data.total > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, data.total)} of{' '}
                {data.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

