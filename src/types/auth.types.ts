import { Identifiable } from './common.types';

/**
 * Access levels within the application.
 */
export type UserRole = 'admin' | 'partner' | 'viewer';

/**
 * Authenticated user profile.
 */
export interface AppUser extends Identifiable {
  email: string;
  displayName?: string;
  role: UserRole;
  isAuthorized: boolean;
}

/**
 * Authentication and session lifecycle state.
 */
export interface AuthState {
  currentUser: AppUser | null;
  isLoading: boolean;
  error: string | null;
}

