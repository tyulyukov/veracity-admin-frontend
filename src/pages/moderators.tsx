import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useModerators, useCreateModerator, useDeleteModerator } from '@/hooks/use-admin-moderators';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ApiClientError } from '@/api/client';
import { Loader2, Search, Plus, Trash2, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Moderator } from '@/types';

const PAGE_SIZE = 10;

export function ModeratorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  const { data, isLoading } = useModerators({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const createModerator = useCreateModerator();
  const deleteModerator = useDeleteModerator();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createModerator.mutate(
      { email: newEmail, password: newPassword },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewEmail('');
          setNewPassword('');
        },
      }
    );
  };

  const handleDelete = (email: string) => {
    deleteModerator.mutate(email, {
      onSuccess: () => {
        setDeleteEmail(null);
      },
    });
  };

  const createErrorMessage =
    createModerator.error instanceof ApiClientError
      ? createModerator.error.message
      : createModerator.error?.message;

  const columns: ColumnDef<Moderator>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === 'owner' ? 'default' : 'secondary'}
          className={row.original.role === 'owner' ? 'bg-primary/10 text-primary' : ''}
        >
          {row.original.role === 'owner' ? 'Owner' : 'Moderator'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.role === 'owner') {
          return null;
        }
        return (
          <AlertDialog open={deleteEmail === row.original.email} onOpenChange={(open) => !open && setDeleteEmail(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteEmail(row.original.email)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Moderator</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-medium text-foreground">{row.original.email}</span>?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => handleDelete(row.original.email)}
                  disabled={deleteModerator.isPending}
                >
                  {deleteModerator.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Moderators</h1>
          <p className="text-muted-foreground">
            Manage admin access and create new moderator accounts
          </p>
        </div>
        <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <AlertDialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Moderator
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form onSubmit={handleCreate}>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Moderator</AlertDialogTitle>
                <AlertDialogDescription>
                  Create a new moderator account with admin access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                {createErrorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {createErrorMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="mod-email">Email</Label>
                  <Input
                    id="mod-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="moderator@veracity.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mod-password">Password</Label>
                  <Input
                    id="mod-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={createModerator.isPending}>
                  {createModerator.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Moderator'
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={data?.moderators ?? []} />

          {data && data.total > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, data.total)} of{' '}
                {data.total} moderators
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

