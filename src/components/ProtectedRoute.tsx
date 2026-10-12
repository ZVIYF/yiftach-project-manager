import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';
import { LoginPage } from './LoginPage';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: ReactNode;
  unauthorizedFallback?: ReactNode;
  loginFallback?: ReactNode;
}

/**
 * Higher-order Route Guard component restricting access based on Firebase authentication and user roles.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  unauthorizedFallback,
  loginFallback,
}) => {
  const { user, role, loading, error, signOut } = useAuth();

  // 1. Loading state during auth verification
  if (loading) {
    return (
      <div style={centeredContainerStyle}>
        <div style={spinnerStyle} />
        <p style={loadingTextStyle}>מאמת הרשאות גישה...</p>
      </div>
    );
  }

  // 2. Unauthenticated user
  if (!user) {
    if (loginFallback) {
      return <>{loginFallback}</>;
    }
    return <LoginPage />;
  }

  // 3. User authenticated, check role-based access if allowedRoles defined
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = role !== null && allowedRoles.includes(role);

    if (!hasRequiredRole) {
      if (unauthorizedFallback) {
        return <>{unauthorizedFallback}</>;
      }

      return (
        <div style={centeredContainerStyle}>
          <div style={unauthorizedCardStyle}>
            <div style={iconBadgeStyle}>⛔</div>
            <h2 style={unauthorizedTitleStyle}>אין הרשאת גישה</h2>
            <p style={unauthorizedDescStyle}>
              אין לחשבונך הרשאה לגשת לעמוד זה.
              <br />
              תפקיד נוכחי: <strong>{role || 'ללא תפקיד מוגדר'}</strong>
            </p>
            {error && <p style={errorDetailStyle}>{error}</p>}
            <button
              type="button"
              onClick={() => signOut()}
              style={signOutButtonStyle}
            >
              התנתק מהחשבון
            </button>
          </div>
        </div>
      );
    }
  }

  // 4. Authorized - render children
  return <>{children}</>;
};

const centeredContainerStyle: React.CSSProperties = {
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  direction: 'rtl',
  fontFamily: "'Heebo', sans-serif",
};

const spinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#1e3a8a',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const loadingTextStyle: React.CSSProperties = {
  marginTop: '1rem',
  fontSize: '1rem',
  color: '#475569',
};

const unauthorizedCardStyle: React.CSSProperties = {
  maxWidth: '440px',
  width: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  border: '1px solid #fed7aa',
  padding: '2rem',
  textAlign: 'center',
};

const iconBadgeStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  marginBottom: '0.5rem',
};

const unauthorizedTitleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '1.4rem',
  color: '#9a3412',
};

const unauthorizedDescStyle: React.CSSProperties = {
  margin: '0 0 1.5rem 0',
  fontSize: '0.95rem',
  color: '#4b5563',
  lineHeight: 1.5,
};

const errorDetailStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#dc2626',
  marginBottom: '1rem',
};

const signOutButtonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  borderRadius: '8px',
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
};

