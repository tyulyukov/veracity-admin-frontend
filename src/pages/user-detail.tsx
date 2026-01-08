import { useParams, Link } from 'react-router';
import { useUser, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/use-admin-users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Calendar, Mail, Briefcase, Loader2, CheckCircle, XCircle, Clock, ChevronDown, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import type { UserStatus, UserRole } from '@/types';
import { getFullStorageUrl } from '@/lib/storage';

const statusConfig: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: typeof CheckCircle }> = {
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  inactive: { label: 'Inactive', variant: 'destructive', icon: XCircle },
};


const roleConfig: Record<UserRole, { label: string }> = {
  standard_user: { label: 'User' },
  speaker: { label: 'Speaker' },
};

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, isError } = useUser(userId);
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  const handleStatusChange = (status: UserStatus) => {
    if (!userId) return;
    updateStatus.mutate({ userId, payload: { status } });
  };

  const handleRoleChange = (role: UserRole) => {
    if (!userId) return;
    updateRole.mutate({ userId, payload: { role } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-3xl mx-auto">
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

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const statusCfg = statusConfig[user.status];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/users/${userId}/events`}>
            <CalendarDays className="w-4 h-4 mr-2" />
            View Events
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-10 mb-8">
            <Avatar
              src={getFullStorageUrl(user.avatarUrl)}
              firstName={user.firstName}
              lastName={user.lastName}
              seed={user.id}
              size="lg"
              className="border-4 border-card w-20 h-20 text-xl"
            />

            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              {user.position && <p className="text-muted-foreground">{user.position}</p>}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={updateStatus.isPending}>
                    <Badge
                      variant={statusCfg.variant}
                      className={cn(
                        'mr-2',
                        user.status === 'active' && 'bg-emerald-500/10 text-emerald-500',
                        user.status === 'pending' && 'bg-amber-500/10 text-amber-500'
                      )}
                    >
                      {statusCfg.label}
                    </Badge>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('active')}
                    disabled={user.status === 'active'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange('inactive')}
                    disabled={user.status === 'inactive'}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-destructive" />
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={updateRole.isPending}>
                    <span className="mr-2 capitalize">{roleConfig[user.role]?.label ?? user.role}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('standard_user')}
                    disabled={user.role === 'standard_user'}
                  >
                    Set as User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('speaker')}
                    disabled={user.role === 'speaker'}
                  >
                    Set as Speaker
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Joined {joinDate}</span>
            </div>
            {user.position && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{user.position}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-foreground mb-3">Connection Statistics</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-500 mb-1">
                  {user.totalConnections ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Connections</div>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-500 mb-1">
                  {user.pendingSentCount ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending Sent</div>
              </div>
              <div className="bg-muted/40 border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {user.pendingReceivedCount ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending Received</div>
              </div>
            </div>
          </div>

          {user.shortDescription && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">{user.shortDescription}</p>
            </div>
          )}

          {user.interests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.contactInfo && Object.keys(user.contactInfo).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Contact Information</h3>
              <div className="grid gap-2">
                {Object.entries(user.contactInfo).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

