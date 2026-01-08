import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useUserEvents, useUser } from '@/hooks/use-admin-users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, Calendar, MapPin, Link as LinkIcon, Users, MessageSquare, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserEventRelation, EventRelationType } from '@/types';

const PAGE_SIZE = 10;

const relationTypeConfig: Record<EventRelationType, { label: string; className: string; bgClassName: string }> = {
  created: { label: 'Created by User', className: 'bg-primary/10 text-primary border-primary/20', bgClassName: 'bg-primary/5' },
  registered: { label: 'Registered to Attend', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', bgClassName: 'bg-blue-500/5' },
};

function EventCard({ event, isExpanded, onToggle }: { event: UserEventRelation; isExpanded: boolean; onToggle: () => void }) {
  const config = relationTypeConfig[event.eventRelationType];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <Card className={cn('overflow-hidden transition-all', config.bgClassName)}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('border', config.className)}>
                {config.label}
              </Badge>
              {event.isOnline && (
                <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                  <LinkIcon className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              {event.name}
            </h3>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-foreground">
              {event.participantCount}
              {event.limitParticipants && (
                <span className="text-muted-foreground">/{event.limitParticipants}</span>
              )}
            </span>
            <span className="text-muted-foreground/70">participants</span>
          </div>

          {!event.isOnline && event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.isOnline && event.link && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {event.link}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Created {new Date(event.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {event.eventRelationType === 'registered' && (event.registrationComment || event.registrationCreatedAt) && (
          <>
            <Separator className="my-4" />
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-400 mb-1">Registration Info</p>
                  {event.registrationCreatedAt && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Registered on {new Date(event.registrationCreatedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {event.registrationComment && (
                    <p className="text-sm text-foreground italic">"{event.registrationComment}"</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {event.description && (
          <>
            <Separator className="my-4" />
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="mb-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Description
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Description
                  </>
                )}
              </Button>

              {isExpanded && (
                <div
                  className="prose prose-invert prose-sm max-w-none text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              )}
              {!isExpanded && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {stripHtmlTags(event.description)}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export function UserEventsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [page, setPage] = useState(0);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const { data: user, isLoading: isLoadingUser } = useUser(userId);
  const { data, isLoading } = useUserEvents(userId, {
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

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

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="max-w-5xl mx-auto">
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
        {data && data.total > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {data.total} {data.total === 1 ? 'event' : 'events'} total
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {data && data.events.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">No events found</h2>
              <p className="text-muted-foreground">
                This user has not created or registered for any events yet.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.events.map((event) => (
                  <EventCard
                    key={event.eventId}
                    event={event}
                    isExpanded={expandedEvents.has(event.eventId)}
                    onToggle={() => toggleExpanded(event.eventId)}
                  />
                ))}
              </div>

              {data && data.total > PAGE_SIZE && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-lg p-4">
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
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-foreground px-2">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
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
