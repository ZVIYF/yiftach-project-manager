/**
 * Application environment configuration schema.
 */
export interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  isProduction: boolean;
}

/**
 * Loads and validates environment variables.
 * Safe across both browser (Vite import.meta.env) and Node CLI (process.env).
 *
 * @returns {AppConfig} Normalized configuration object.
 */
export function loadConfig(): AppConfig {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : undefined;

  const apiKey = metaEnv?.VITE_FIREBASE_API_KEY || procEnv?.VITE_FIREBASE_API_KEY || '';
  const authDomain = metaEnv?.VITE_FIREBASE_AUTH_DOMAIN || procEnv?.VITE_FIREBASE_AUTH_DOMAIN || 'gavstack.firebaseapp.com';
  const projectId = metaEnv?.VITE_FIREBASE_PROJECT_ID || procEnv?.VITE_FIREBASE_PROJECT_ID || 'gavstack';
  const storageBucket = metaEnv?.VITE_FIREBASE_STORAGE_BUCKET || procEnv?.VITE_FIREBASE_STORAGE_BUCKET || 'gavstack.firebasestorage.app';
  const senderId = metaEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID || procEnv?.VITE_FIREBASE_MESSAGING_SENDER_ID || '882939911940';
  const appId = metaEnv?.VITE_FIREBASE_APP_ID || procEnv?.VITE_FIREBASE_APP_ID || '1:882939911940:web:4a5194802dd55d1b317a51';
  const isProd = metaEnv?.PROD ?? (procEnv?.NODE_ENV === 'production');

  return {
    firebase: {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId: senderId,
      appId,
    },
    isProduction: Boolean(isProd),
  };
}

export const config = loadConfig();
