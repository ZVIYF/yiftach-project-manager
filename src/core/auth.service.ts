import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';
import { AppUser, AuthState, UserRole } from '../types/auth.types';
import { OperationResult } from '../types/common.types';

export type AuthStateListener = (state: AuthState) => void;

/**
 * Authentication Service with server-validated authorization checks.
 * Resolves the legacy client-side authorization bypass vulnerability.
 */
export class AuthService {
  private currentState: AuthState = {
    currentUser: null,
    isLoading: true,
    error: null,
  };
  private listeners: Set<AuthStateListener> = new Set();

  constructor() {
    this.initializeAuthListener();
  }

  /**
   * Subscribes to authentication state transitions.
   *
   * @param {AuthStateListener} listener - Callback invoked on auth state change.
   * @returns {() => void} Unsubscribe function.
   */
  public subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  /**
   * Retrieves the current authenticated user profile.
   */
  public getCurrentUser(): AppUser | null {
    return this.currentState.currentUser;
  }

  /**
   * Verifies if the active session is fully authorized to access business data.
   */
  public isAuthorized(): boolean {
    return Boolean(this.currentState.currentUser?.isAuthorized);
  }

  /**
   * Signs in an existing user with email and password credentials.
   *
   * @param {string} email - User email address.
   * @param {string} password - User password.
   */
  public async signIn(email: string, password: string): Promise<OperationResult<AppUser>> {
    const auth = getFirebaseAuth();
    this.updateState({ isLoading: true, error: null });

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const appUser = await this.verifyUserAuthorization(credential.user);

      if (!appUser.isAuthorized) {
        await firebaseSignOut(auth);
        const errorMsg = 'אין הרשאת גישה למערכת עבור משתמש זה';
        this.updateState({ currentUser: null, isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      this.updateState({ currentUser: appUser, isLoading: false, error: null });
      return { success: true, data: appUser };
    } catch (err: unknown) {
      const errorMsg = this.mapAuthErrorToHebrew(err);
      this.updateState({ currentUser: null, isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Signs out the current user session.
   */
  public async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    this.updateState({ currentUser: null, isLoading: false, error: null });
  }

  /**
   * Validates user membership and role from Firestore 'users' or 'allowed_users' collections.
   */
  private async verifyUserAuthorization(user: FirebaseUser): Promise<AppUser> {
    const db = getFirestoreDb();
    const normalizedEmail = (user.email || '').toLowerCase().trim();

    try {
      // 1. Check primary 'users' collection by uid (Role-Based Access Control)
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as { role?: UserRole; isActive?: boolean; displayName?: string };
        const isAllowed = data.isActive !== false;
        return {
          id: user.uid,
          email: normalizedEmail,
          displayName: data.displayName || user.displayName || undefined,
          role: data.role || 'member',
          isAuthorized: isAllowed,
        };
      }

      // 2. Fallback to 'allowed_users' collection by email (backward compatibility)
      const allowedDocRef = doc(db, 'allowed_users', normalizedEmail);
      const allowedDoc = await getDoc(allowedDocRef);

      if (allowedDoc.exists()) {
        const data = allowedDoc.data() as { role?: UserRole; isActive?: boolean; displayName?: string };
        const isAllowed = data.isActive !== false;
        return {
          id: user.uid,
          email: normalizedEmail,
          displayName: data.displayName || user.displayName || undefined,
          role: data.role || 'partner',
          isAuthorized: isAllowed,
        };
      }

      return {
        id: user.uid,
        email: normalizedEmail,
        role: 'viewer',
        isAuthorized: false,
      };
    } catch {
      // In strict security mode, any read error or missing record denies authorization
      return {
        id: user.uid,
        email: normalizedEmail,
        role: 'viewer',
        isAuthorized: false,
      };
    }
  }

  private initializeAuthListener(): void {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.updateState({ currentUser: null, isLoading: false, error: null });
        return;
      }

      const appUser = await this.verifyUserAuthorization(user);
      if (!appUser.isAuthorized) {
        await firebaseSignOut(auth);
        this.updateState({
          currentUser: null,
          isLoading: false,
          error: 'חשבון זה אינו מורשה לגשת למערכת',
        });
        return;
      }

      this.updateState({ currentUser: appUser, isLoading: false, error: null });
    });
  }

  private updateState(partialState: Partial<AuthState>): void {
    this.currentState = { ...this.currentState, ...partialState };
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  private mapAuthErrorToHebrew(err: unknown): string {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/invalid-email': return 'כתובת אימייל לא תקינה';
      case 'auth/user-disabled': return 'משתמש זה חסום במערכת';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'אימייל או סיסמה שגויים';
      case 'auth/too-many-requests': return 'ניסיונות התחברות רבים מדי. אנא נסה שוב בעוד מספר דקות';
      case 'auth/network-request-failed': return 'אין חיבור לרשת';
      default: return 'שגיאת אימות נתונים בהתחברות';
    }
  }
}

export const authService = new AuthService();
