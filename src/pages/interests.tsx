import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useInterests, useCreateInterest, useUpdateInterest, useDeleteInterest } from '@/hooks/use-admin-interests';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2, Search, Plus, Trash2, Pencil, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import type { Interest } from '@/types';

const PAGE_SIZE = 20;

export function InterestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [deleteInterest, setDeleteInterest] = useState<Interest | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');

  const { data, isLoading } = useInterests({
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const createInterest = useCreateInterest();
  const updateInterest = useUpdateInterest();
  const deleteInterestMutation = useDeleteInterest();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const startEditing = (interest: Interest) => {
    setEditingInterest(interest);
    setEditName(interest.name);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createInterest.mutate(
      { name: newName },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setNewName('');
        },
      }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterest) return;
    updateInterest.mutate(
      { interestId: editingInterest.id, payload: { name: editName } },
      {
        onSuccess: () => {
          setEditingInterest(null);
          setEditName('');
        },
      }
    );
  };

  const handleDelete = (interest: Interest) => {
    deleteInterestMutation.mutate(interest.id, {
      onSuccess: () => {
        setDeleteInterest(null);
      },
    });
  };

  const createErrorMessage =
    createInterest.error instanceof ApiClientError
      ? createInterest.error.message
      : createInterest.error?.message;

  const updateErrorMessage =
    updateInterest.error instanceof ApiClientError
      ? updateInterest.error.message
      : updateInterest.error?.message;

  const columns: ColumnDef<Interest>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <AlertDialog open={editingInterest?.id === row.original.id} onOpenChange={(open) => !open && setEditingInterest(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => startEditing(row.original)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form onSubmit={handleUpdate}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Interest</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the name of this interest category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                  {updateErrorMessage && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {updateErrorMessage}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Interest name"
                      required
                      maxLength={255}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <Button type="submit" disabled={updateInterest.isPending}>
                    {updateInterest.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Interest'
                    )}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteInterest?.id === row.original.id} onOpenChange={(open) => !open && setDeleteInterest(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteInterest(row.original)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Interest</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-medium text-foreground">{row.original.name}</span>?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => handleDelete(row.original)}
                  disabled={deleteInterestMutation.isPending}
                >
                  {deleteInterestMutation.isPending ? (
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
        </div>
      ),
    },
  ];

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Interests</h1>
          <p className="text-muted-foreground">
            Manage user interest categories and tags
          </p>
        </div>
        <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <AlertDialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Interest
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form onSubmit={handleCreate}>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Interest</AlertDialogTitle>
                <AlertDialogDescription>
                  Create a new interest category for users to select.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                {createErrorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {createErrorMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="interest-name">Name</Label>
                  <Input
                    id="interest-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Interest name"
                    required
                    maxLength={255}
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={createInterest.isPending}>
                  {createInterest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Interest'
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
            placeholder="Search interests..."
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
          <DataTable columns={columns} data={data?.interests ?? []} />

          {data && data.total > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, data.total)} of{' '}
                {data.total} interests
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
