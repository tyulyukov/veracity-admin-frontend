import { Link } from 'react-router';
import { useUsers } from '@/hooks/use-admin-users';
import { useAdminAuthStore } from '@/stores/admin-auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { getFullStorageUrl } from '@/lib/storage';

export function DashboardPage() {
  const { admin } = useAdminAuthStore();
  const { data: allUsers, isLoading: allLoading } = useUsers({ limit: 1 });
  const { data: pendingUsers, isLoading: pendingLoading } = useUsers({ status: 'pending', limit: 5 });
  const { data: activeUsers, isLoading: activeLoading } = useUsers({ status: 'active', limit: 1 });
  const { data: inactiveUsers, isLoading: inactiveLoading } = useUsers({ status: 'inactive', limit: 1 });

  const isLoading = allLoading || pendingLoading || activeLoading || inactiveLoading;

  const stats = [
    {
      title: 'Total Users',
      value: allUsers?.total ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Approval',
      value: pendingUsers?.total ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Active Users',
      value: activeUsers?.total ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers?.total ?? 0,
      icon: XCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="text-foreground">{admin?.email}</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="py-4">
                <CardContent className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingUsers && pendingUsers.total > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-lg">Pending Approvals</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/users?status=pending">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingUsers.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={getFullStorageUrl(user.avatarUrl)}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          seed={user.id}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingUsers && pendingUsers.total === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending user approvals at the moment.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

