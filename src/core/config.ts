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
 * Falls back to safe defaults to prevent runtime crash during initialization.
 *
 * @returns {AppConfig} Normalized configuration object.
 */
export function loadConfig(): AppConfig {
  const env = import.meta.env;

  return {
    firebase: {
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gavstack.firebaseapp.com',
      projectId: env.VITE_FIREBASE_PROJECT_ID || 'gavstack',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gavstack.firebasestorage.app',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '882939911940',
      appId: env.VITE_FIREBASE_APP_ID || '1:882939911940:web:4a5194802dd55d1b317a51',
    },
    isProduction: env.PROD || false,
  };
}

export const config = loadConfig();

