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

export const STORAGE_BASE_URL = 'https://storage.veracity.tyulyukov.com';

