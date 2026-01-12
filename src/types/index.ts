export type AdminRole = 'moderator' | 'owner';

export interface AdminInfo {
  email: string;
  role: AdminRole;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export type UserStatus = 'pending' | 'active' | 'inactive';
export type UserRole = 'standard_user' | 'speaker';

export interface Interest {
  id: string;
  name: string;
}

export interface InterestsQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedInterestsResponse {
  interests: Interest[];
  total: number;
}

export interface CreateInterestPayload {
  name: string;
}

export interface UpdateInterestPayload {
  name: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  position: string | null;
  contactInfo: Record<string, string> | null;
  shortDescription: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  lastActivityAt: string | null;
  interests: Interest[];
  totalConnections?: number;
  pendingSentCount?: number;
  pendingReceivedCount?: number;
}

export interface UsersQueryParams {
  offset?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

export interface Moderator {
  email: string;
  role: AdminRole;
}

export interface ModeratorsQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedModeratorsResponse {
  moderators: Moderator[];
  total: number;
}

export interface CreateModeratorPayload {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export type EventRelationType = 'created' | 'registered';

export interface UserEventRelation {
  userId: string;
  eventRelationType: EventRelationType;
  eventId: string;
  name: string;
  isOnline: boolean;
  eventDate: string;
  location: string | null;
  link: string | null;
  description: string | null;
  imageUrls: string[];
  tags: string[];
  limitParticipants: number | null;
  participantCount: number;
  createdAt: string;
  registrationComment: string | null;
  registrationCreatedAt: string | null;
}

export interface EventsQueryParams {
  offset?: number;
  limit?: number;
}

export interface PaginatedEventsResponse {
  events: UserEventRelation[];
  total: number;
}

export interface PostAuthor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface Post {
  id: string;
  text: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: PostAuthor;
}

export interface PostsQueryParams {
  offset?: number;
  limit?: number;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  total: number;
}

export type ActivityType = 'post_created' | 'post_deleted' | 'liked' | 'commented';
export type EntityType = 'post' | 'comment' | 'post_like';

export interface UserActivity {
  userId: string;
  activityType: ActivityType;
  entityId: string;
  entityType: EntityType;
  contentPreview: string | null;
  activityAt: string;
  imageUrls?: string[];
}

export interface ActivityQueryParams {
  offset?: number;
  limit?: number;
}

export interface PaginatedActivityResponse {
  activities: UserActivity[];
  total: number;
}

export const STORAGE_BASE_URL = 'https://storage.veracity.tyulyukov.com';

export type AnalyticsInterval = 'day' | 'week' | 'month';

export interface AnalyticsDateRangeParams {
  startDate: string;
  endDate: string;
  interval?: AnalyticsInterval;
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalConnections: number;
  pendingConnections: number;
  avgConnectionsPerUser: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalEvents: number;
  totalEventRegistrations: number;
  totalSpeakers: number;
}

export interface UserGrowthDataPoint {
  date: string;
  userCount: number;
}

export interface ConnectionActivityDataPoint {
  date: string;
  sentCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export interface ContentEngagementDataPoint {
  date: string;
  postsCount: number;
  likesCount: number;
  commentsCount: number;
}

export interface EventInterestDataPoint {
  month: number;
  registrationsCount: number;
  eventsCount: number;
}

export interface TopInterest {
  interestId: string;
  interestName: string;
  userCount: number;
}

export interface UserRetentionDataPoint {
  date: string;
  activeUsers: number;
  totalUsers: number;
  retentionRate: number;
}

export interface SpeakerAnalytics {
  speakerId: string;
  firstName: string;
  lastName: string;
  eventsCount: number;
  totalRegistrations: number;
  avgRegistrationsPerEvent: number;
}

