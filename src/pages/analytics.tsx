import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAnalyticsOverview,
  useUserGrowth,
  useConnectionActivity,
  useContentEngagement,
  useEventInterest,
  useTopInterests,
  useUserRetention,
  useSpeakerAnalytics,
} from '@/hooks/use-admin-analytics';
import type { AnalyticsInterval } from '@/types';
import {
  Users,
  UserCheck,
  Clock,
  Link2,
  FileText,
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  Mic,
  Loader2,
  Activity,
} from 'lucide-react';

const CHART_COLORS = {
  primary: 'oklch(0.78 0.12 75)',
  secondary: 'oklch(0.65 0.15 250)',
  tertiary: 'oklch(0.70 0.18 150)',
  quaternary: 'oklch(0.65 0.20 320)',
  success: 'oklch(0.70 0.17 145)',
  warning: 'oklch(0.75 0.15 85)',
  danger: 'oklch(0.60 0.20 25)',
  muted: 'oklch(0.50 0.02 250)',
};

const GRADIENT_IDS = {
  userGrowth: 'userGrowthGradient',
  connections: 'connectionsGradient',
  retention: 'retentionGradient',
  posts: 'postsGradient',
  likes: 'likesGradient',
  comments: 'commentsGradient',
};

function formatDate(dateStr: string, interval: AnalyticsInterval): string {
  const date = new Date(dateStr);
  if (interval === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (interval === 'week') {
    return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatMonth(month: number): string {
  return new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'short' });
}

interface DateRangeConfig {
  startDate: string;
  endDate: string;
  interval: AnalyticsInterval;
  label: string;
}

function getDateRangeConfig(range: string): DateRangeConfig {
  const end = new Date();
  const start = new Date();
  let interval: AnalyticsInterval;
  let label: string;

  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7);
      interval = 'day';
      label = 'Daily';
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      interval = 'day';
      label = 'Daily';
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      interval = 'week';
      label = 'Weekly';
      break;
    case '1y':
      start.setFullYear(end.getFullYear() - 1);
      interval = 'month';
      label = 'Monthly';
      break;
    default:
      start.setDate(end.getDate() - 30);
      interval = 'day';
      label = 'Daily';
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    interval,
    label,
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  suffix,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  suffix?: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className={`absolute inset-0 ${bgColor} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const currentYear = new Date().getFullYear();

  const { startDate, endDate, interval, label: intervalLabel } = useMemo(
    () => getDateRangeConfig(dateRange),
    [dateRange]
  );
  const dateParams = useMemo(
    () => ({ startDate, endDate, interval }),
    [startDate, endDate, interval]
  );

  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth(dateParams);
  const { data: connectionActivity, isLoading: connectionLoading } = useConnectionActivity(dateParams);
  const { data: contentEngagement, isLoading: contentLoading } = useContentEngagement(dateParams);
  const { data: eventInterest, isLoading: eventLoading } = useEventInterest(currentYear);
  const { data: topInterests, isLoading: interestsLoading } = useTopInterests(10);
  const { data: userRetention, isLoading: retentionLoading } = useUserRetention(dateParams);
  const { data: speakerAnalytics, isLoading: speakersLoading } = useSpeakerAnalytics(10);

  const isLoading = overviewLoading;

  const formattedUserGrowth = useMemo(
    () =>
      userGrowth?.map((d) => ({
        ...d,
        formattedDate: formatDate(d.date, interval),
      })) ?? [],
    [userGrowth, interval]
  );

  const formattedConnectionActivity = useMemo(
    () =>
      connectionActivity?.map((d) => ({
        ...d,
        formattedDate: formatDate(d.date, interval),
      })) ?? [],
    [connectionActivity, interval]
  );

  const formattedContentEngagement = useMemo(
    () =>
      contentEngagement?.map((d) => ({
        ...d,
        formattedDate: formatDate(d.date, interval),
      })) ?? [],
    [contentEngagement, interval]
  );

  const formattedEventInterest = useMemo(
    () =>
      eventInterest?.map((d) => ({
        ...d,
        formattedMonth: formatMonth(d.month),
      })) ?? [],
    [eventInterest]
  );

  const formattedRetention = useMemo(
    () =>
      userRetention?.map((d) => ({
        ...d,
        formattedDate: formatDate(d.date, interval),
      })) ?? [],
    [userRetention, interval]
  );

  const interestColors = useMemo(() => {
    const colors = [
      CHART_COLORS.primary,
      CHART_COLORS.secondary,
      CHART_COLORS.tertiary,
      CHART_COLORS.quaternary,
      CHART_COLORS.success,
      CHART_COLORS.warning,
    ];
    return (topInterests ?? []).map((_, i) => colors[i % colors.length]);
  }, [topInterests]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Platform insights and performance metrics</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground px-3 py-2 rounded-md bg-muted/30 border border-border">
            {intervalLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={overview?.totalUsers ?? 0}
          icon={Users}
          color="text-primary"
          bgColor="bg-primary"
        />
        <StatCard
          title="Active Users"
          value={overview?.activeUsers ?? 0}
          icon={UserCheck}
          color="text-emerald-500"
          bgColor="bg-emerald-500"
        />
        <StatCard
          title="Pending"
          value={overview?.pendingUsers ?? 0}
          icon={Clock}
          color="text-amber-500"
          bgColor="bg-amber-500"
        />
        <StatCard
          title="Connections"
          value={overview?.totalConnections ?? 0}
          icon={Link2}
          color="text-blue-500"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Events"
          value={overview?.totalEvents ?? 0}
          icon={Calendar}
          color="text-purple-500"
          bgColor="bg-purple-500"
        />
        <StatCard
          title="Speakers"
          value={overview?.totalSpeakers ?? 0}
          icon={Mic}
          color="text-rose-500"
          bgColor="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Posts"
          value={overview?.totalPosts ?? 0}
          icon={FileText}
          color="text-cyan-500"
          bgColor="bg-cyan-500"
        />
        <StatCard
          title="Total Likes"
          value={overview?.totalLikes ?? 0}
          icon={Heart}
          color="text-rose-500"
          bgColor="bg-rose-500"
        />
        <StatCard
          title="Total Comments"
          value={overview?.totalComments ?? 0}
          icon={MessageSquare}
          color="text-violet-500"
          bgColor="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth">
          {growthLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formattedUserGrowth}>
                <defs>
                  <linearGradient id={GRADIENT_IDS.userGrowth} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="userCount"
                  name="Users"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill={`url(#${GRADIENT_IDS.userGrowth})`}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="User Retention">
          {retentionLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formattedRetention}>
                <defs>
                  <linearGradient id={GRADIENT_IDS.retention} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl">
                        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Active:</span>
                            <span className="font-medium text-foreground">{data.activeUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium text-foreground">{data.totalUsers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-border">
                            <span className="text-muted-foreground">Retention:</span>
                            <span className="font-medium text-emerald-500">{data.retentionRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="retentionRate"
                  name="Retention Rate"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2}
                  fill={`url(#${GRADIENT_IDS.retention})`}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Connection Activity">
        {connectionLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedConnectionActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
              <Bar
                dataKey="sentCount"
                name="Sent"
                fill={CHART_COLORS.secondary}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              <Bar
                dataKey="acceptedCount"
                name="Accepted"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
              <Bar
                dataKey="rejectedCount"
                name="Rejected"
                fill={CHART_COLORS.danger}
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Content Engagement">
          {contentLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedContentEngagement}>
                <defs>
                  <linearGradient id={GRADIENT_IDS.posts} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="postsCount"
                  name="Posts"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: CHART_COLORS.primary }}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="likesCount"
                  name="Likes"
                  stroke={CHART_COLORS.danger}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: CHART_COLORS.danger }}
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="commentsCount"
                  name="Comments"
                  stroke={CHART_COLORS.tertiary}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: CHART_COLORS.tertiary }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title={`Event Interest (${currentYear})`}>
          {eventLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedEventInterest}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
                <XAxis
                  dataKey="formattedMonth"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Bar
                  dataKey="eventsCount"
                  name="Events"
                  fill={CHART_COLORS.quaternary}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="registrationsCount"
                  name="Registrations"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Interests">
          {interestsLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topInterests} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="interestName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'oklch(0.85 0.02 250)', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl">
                        <p className="text-sm font-medium text-foreground mb-1">{data.interestName}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-foreground font-medium">{data.userCount.toLocaleString()}</span> users
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="userCount" name="Users" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {(topInterests ?? []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={interestColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Speakers">
          {speakersLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : speakerAnalytics && speakerAnalytics.length > 0 ? (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {speakerAnalytics.map((speaker, index) => (
                <div
                  key={speaker.speakerId}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {speaker.firstName} {speaker.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {speaker.eventsCount} events
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {speaker.totalRegistrations} registrations
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{speaker.avgRegistrationsPerEvent.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">avg/event</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
              <Mic className="w-12 h-12 mb-3 opacity-50" />
              <p>No speaker data available</p>
            </div>
          )}
        </ChartCard>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-transparent to-transparent border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">Platform Health</h3>
              <p className="text-muted-foreground">
                <span className="text-primary font-medium">{((overview?.avgConnectionsPerUser ?? 0)).toFixed(1)}</span> avg connections per user
                {' • '}
                <span className="text-primary font-medium">{overview?.pendingConnections ?? 0}</span> pending connection requests
                {' • '}
                <span className="text-primary font-medium">{overview?.totalEventRegistrations ?? 0}</span> total event registrations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
