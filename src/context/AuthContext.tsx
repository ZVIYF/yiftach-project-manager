import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '../core/firebase';
import { UserProfile, UserRole } from '../types/auth.types';

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (allowedRoles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication and RBAC Provider component.
 * Listens to Firebase auth state transitions and retrieves user roles from the 'users' collection.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        // Fetch user document from Firestore 'users' collection by uid
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const userRole = (data.role as UserRole) || 'member';
          const userProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: data.displayName || firebaseUser.displayName || undefined,
            role: userRole,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          setProfile(userProfile);
          setRole(userRole);
        } else {
          // Fallback to allowed_users collection if existing records use email keying
          const emailKey = (firebaseUser.email || '').toLowerCase().trim();
          const allowedDocRef = doc(db, 'allowed_users', emailKey);
          const allowedDocSnap = await getDoc(allowedDocRef);

          let fallbackRole: UserRole = 'member';
          if (allowedDocSnap.exists()) {
            const allowedData = allowedDocSnap.data();
            fallbackRole = (allowedData.role as UserRole) || 'partner';
          }

          const fallbackProfile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            role: fallbackRole,
          };

          setProfile(fallbackProfile);
          setRole(fallbackRole);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'שגיאה בטעינת הרשאות משתמש';
        setError(message);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null);
    const trimmedEmail = email ? email.trim() : '';
    if (!trimmedEmail || !password) {
      const errorMsg = 'נא למלא דואר אלקטרוני וסיסמה';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    const auth = getFirebaseAuth();
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'ההתחברות נכשלה';
      setError(errorMsg);
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    setError(null);
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(role);
  };

  const contextValue: AuthContextType = {
    user,
    profile,
    role,
    loading,
    error,
    signIn,
    signOut,
    hasRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Hook to consume AuthContext in React components.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

