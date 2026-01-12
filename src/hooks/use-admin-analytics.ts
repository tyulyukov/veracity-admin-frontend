import { useQuery } from '@tanstack/react-query';
import * as adminAnalyticsApi from '@/api/admin-analytics.api';
import type { AnalyticsDateRangeParams } from '@/types';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => adminAnalyticsApi.getOverview(),
  });
}

export function useUserGrowth(params: AnalyticsDateRangeParams) {
  return useQuery({
    queryKey: ['analyticsUserGrowth', params],
    queryFn: () => adminAnalyticsApi.getUserGrowth(params),
  });
}

export function useConnectionActivity(params: AnalyticsDateRangeParams) {
  return useQuery({
    queryKey: ['analyticsConnectionActivity', params],
    queryFn: () => adminAnalyticsApi.getConnectionActivity(params),
  });
}

export function useContentEngagement(params: AnalyticsDateRangeParams) {
  return useQuery({
    queryKey: ['analyticsContentEngagement', params],
    queryFn: () => adminAnalyticsApi.getContentEngagement(params),
  });
}

export function useEventInterest(year: number) {
  return useQuery({
    queryKey: ['analyticsEventInterest', year],
    queryFn: () => adminAnalyticsApi.getEventInterest(year),
  });
}

export function useTopInterests(limit?: number) {
  return useQuery({
    queryKey: ['analyticsTopInterests', limit],
    queryFn: () => adminAnalyticsApi.getTopInterests(limit),
  });
}

export function useUserRetention(params: AnalyticsDateRangeParams) {
  return useQuery({
    queryKey: ['analyticsUserRetention', params],
    queryFn: () => adminAnalyticsApi.getUserRetention(params),
  });
}

export function useSpeakerAnalytics(limit?: number) {
  return useQuery({
    queryKey: ['analyticsSpeakerAnalytics', limit],
    queryFn: () => adminAnalyticsApi.getSpeakerAnalytics(limit),
  });
}
