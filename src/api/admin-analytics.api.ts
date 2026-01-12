import { apiGet } from './client';
import type {
  AnalyticsOverview,
  AnalyticsDateRangeParams,
  UserGrowthDataPoint,
  ConnectionActivityDataPoint,
  ContentEngagementDataPoint,
  EventInterestDataPoint,
  TopInterest,
  UserRetentionDataPoint,
  SpeakerAnalytics,
} from '@/types';

export async function getOverview(): Promise<AnalyticsOverview> {
  return apiGet<AnalyticsOverview>('/admin/analytics/overview');
}

export async function getUserGrowth(params: AnalyticsDateRangeParams): Promise<UserGrowthDataPoint[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('startDate', params.startDate);
  searchParams.set('endDate', params.endDate);
  if (params.interval) searchParams.set('interval', params.interval);

  return apiGet<UserGrowthDataPoint[]>(`/admin/analytics/user-growth?${searchParams}`);
}

export async function getConnectionActivity(params: AnalyticsDateRangeParams): Promise<ConnectionActivityDataPoint[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('startDate', params.startDate);
  searchParams.set('endDate', params.endDate);
  if (params.interval) searchParams.set('interval', params.interval);

  return apiGet<ConnectionActivityDataPoint[]>(`/admin/analytics/connection-activity?${searchParams}`);
}

export async function getContentEngagement(params: AnalyticsDateRangeParams): Promise<ContentEngagementDataPoint[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('startDate', params.startDate);
  searchParams.set('endDate', params.endDate);
  if (params.interval) searchParams.set('interval', params.interval);

  return apiGet<ContentEngagementDataPoint[]>(`/admin/analytics/content-engagement?${searchParams}`);
}

export async function getEventInterest(year: number): Promise<EventInterestDataPoint[]> {
  return apiGet<EventInterestDataPoint[]>(`/admin/analytics/event-interest?year=${year}`);
}

export async function getTopInterests(limit?: number): Promise<TopInterest[]> {
  const searchParams = new URLSearchParams();
  if (limit !== undefined) searchParams.set('limit', String(limit));

  const query = searchParams.toString();
  return apiGet<TopInterest[]>(`/admin/analytics/top-interests${query ? `?${query}` : ''}`);
}

export async function getUserRetention(params: AnalyticsDateRangeParams): Promise<UserRetentionDataPoint[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('startDate', params.startDate);
  searchParams.set('endDate', params.endDate);
  if (params.interval) searchParams.set('interval', params.interval);

  return apiGet<UserRetentionDataPoint[]>(`/admin/analytics/user-retention?${searchParams}`);
}

export async function getSpeakerAnalytics(limit?: number): Promise<SpeakerAnalytics[]> {
  const searchParams = new URLSearchParams();
  if (limit !== undefined) searchParams.set('limit', String(limit));

  const query = searchParams.toString();
  return apiGet<SpeakerAnalytics[]>(`/admin/analytics/speaker-analytics${query ? `?${query}` : ''}`);
}
