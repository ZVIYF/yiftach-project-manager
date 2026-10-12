import { Identifiable } from './common.types';

/**
 * Access levels within the application for Role-Based Access Control (RBAC).
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'partner' | 'viewer';

/**
 * User profile document stored in the Firestore 'users' collection (docId = uid).
 */
export interface UserProfile extends Identifiable {
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

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

