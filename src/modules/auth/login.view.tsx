import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from '../../components/LoginPage';
import { router } from '../../core/router';

let activeRoot: Root | null = null;

/**
 * Mounts the React LoginPage within the global AuthProvider into the specified DOM container.
 *
 * @param {HTMLElement} container - DOM container element where the view should be mounted.
 */
export function renderLoginView(container: HTMLElement): void {
  // Clean up any previously mounted React root on the same or altered container
  if (activeRoot) {
    try {
      activeRoot.unmount();
    } catch {
      // Ignored if DOM container was already cleaned
    }
    activeRoot = null;
  }

  container.innerHTML = '';
  activeRoot = createRoot(container);
  activeRoot.render(
    <React.StrictMode>
      <AuthProvider>
        <LoginPage onSuccess={() => router.navigate('dashboard')} />
      </AuthProvider>
    </React.StrictMode>
  );
}

/**
 * Safely unmounts the active login React root if mounted.
 */
export function unmountLoginView(): void {
  if (activeRoot) {
    try {
      activeRoot.unmount();
    } catch {
      // Ignore unmount error
    }
    activeRoot = null;
  }
}
