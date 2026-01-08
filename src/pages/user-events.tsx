import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { useUserEvents, useUser } from '@/hooks/use-admin-users';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Calendar, MapPin, Link as LinkIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserEventRelation, EventRelationType } from '@/types';

const PAGE_SIZE = 10;

const relationTypeConfig: Record<EventRelationType, { label: string; className: string }> = {
  created: { label: 'Created', className: 'bg-primary/10 text-primary' },
  registered: { label: 'Registered', className: 'bg-blue-500/10 text-blue-400' },
};

export function UserEventsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(0);

  const { data: user, isLoading: isLoadingUser } = useUser(userId);
  const { data, isLoading } = useUserEvents(userId, {
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground">This user may no longer exist.</p>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<UserEventRelation>[] = [
    {
      accessorKey: 'name',
      header: 'Event Name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'eventRelationType',
      header: 'Type',
      cell: ({ row }) => {
        const config = relationTypeConfig[row.original.eventRelationType];
        return (
          <Badge className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'eventDate',
      header: 'Event Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date(row.original.eventDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {row.original.isOnline ? (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>Online</span>
            </>
          ) : row.original.location ? (
            <>
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{row.original.location}</span>
            </>
          ) : (
            <span className="text-muted-foreground/50">N/A</span>
          )}
        </div>
      ),
    },
    {
      id: 'participants',
      header: 'Participants',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {row.original.participantCount}
            {row.original.limitParticipants && (
              <span className="text-muted-foreground">/{row.original.limitParticipants}</span>
            )}
          </span>
        </div>
      ),
    },
    {
      id: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.original.tags.length > 0 ? (
            row.original.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/50">No tags</span>
          )}
          {row.original.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.tags.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'registrationInfo',
      header: 'Registration',
      cell: ({ row }) => {
        if (row.original.eventRelationType === 'created') {
          return <span className="text-xs text-muted-foreground/50">-</span>;
        }
        return (
          <div className="text-xs text-muted-foreground">
            {row.original.registrationCreatedAt && (
              <div>
                {new Date(row.original.registrationCreatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
            {row.original.registrationComment && (
              <div className="truncate max-w-[150px] text-muted-foreground/70 mt-0.5">
                "{row.original.registrationComment}"
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        to={`/users/${userId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to user
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {user.firstName} {user.lastName} - Events
        </h1>
        <p className="text-muted-foreground">
          Events created and registered by this user
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {data && data.events.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">No events found</h2>
              <p className="text-muted-foreground">
                This user has not created or registered for any events yet.
              </p>
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={data?.events ?? []} />

              {data && data.total > PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, data.total)} of{' '}
                    {data.total} events
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
        </>
      )}
    </div>
  );
}
