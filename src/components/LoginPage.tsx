import React, { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export interface LoginPageProps {
  onSuccess?: () => void;
}

/**
 * Responsive Login Page supporting email and password authentication with Firebase.
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (
    e?: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('נא למלא את כל השדות (דואר אלקטרוני וסיסמה)');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(trimmedEmail, password);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.hash = 'dashboard';
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      let friendlyError = 'פרטי התחברות שגויים או שגיאת תקשורת';
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        friendlyError = 'כתובת אימייל או סיסמה שגויים';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        friendlyError = 'יותר מדי נסיונות כושלים. אנא נסה שוב בעוד מספר דקות';
      } else if (firebaseError.code === 'auth/invalid-email') {
        friendlyError = 'כתובת אימייל לא חוקית';
      } else if (firebaseError.code === 'auth/network-request-failed') {
        friendlyError = 'שגיאת רשת: לא ניתן להתחבר לשרת Firebase';
      } else if (firebaseError.message) {
        friendlyError = firebaseError.message;
      }
      setErrorMessage(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only disable interaction during active credential submission
  const isPending = isSubmitting;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoBadgeStyle}>י</div>
          <h1 style={titleStyle}>יפתח - ניהול פרויקטים</h1>
          <p style={subtitleStyle}>התחברות למערכת ניהול פרויקטים וכספים</p>
        </div>

        {errorMessage && (
          <div role="alert" style={errorBannerStyle}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle} noValidate>
          <div style={inputGroupStyle}>
            <label htmlFor="login-email" style={labelStyle}>
              כתובת אימייל
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              disabled={isPending}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="login-password" style={labelStyle}>
              סיסמה
            </label>
            <div style={passwordWrapperStyle}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isPending}
                style={passwordInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={togglePasswordBtnStyle}
                aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            style={isPending ? buttonDisabledStyle : buttonStyle}
          >
            {isPending ? 'מתחבר למערכת...' : 'התחבר למערכת'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline design token styles ensuring complete encapsulation and zero broken imports
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  backgroundColor: '#f8fafc',
  direction: 'rtl',
  fontFamily: "'Heebo', sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  padding: '2.5rem',
  border: '1px solid #e2e8f0',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const logoBadgeStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '1.625rem',
  fontWeight: '700',
  color: '#0f172a',
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.925rem',
  color: '#64748b',
};

const errorBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  backgroundColor: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: '10px',
  padding: '0.875rem 1rem',
  marginBottom: '1.5rem',
  fontSize: '0.9rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  textAlign: 'right',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#334155',
};

const inputStyle: React.CSSProperties = {
  padding: '0.8rem 1rem',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const passwordWrapperStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const passwordInputStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '2.75rem',
};

const togglePasswordBtnStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.75rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.1rem',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.875rem 1.5rem',
  borderRadius: '10px',
  backgroundColor: '#1e3a8a',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)',
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.65,
  cursor: 'not-allowed',
};

