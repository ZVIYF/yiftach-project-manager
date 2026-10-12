import './styles/main.css';
import { AppModule } from './modules/app';

/**
 * Application Entry Point.
 * Bootstraps the root application module on DOM content load.
 */
function bootstrap(): void {
  const rootElement = document.getElementById('app');
  if (!rootElement) {
    throw new Error('Fatal: #app root element not found in DOM.');
  }

  const app = new AppModule(rootElement);
  app.start();

  // Register PWA service worker for offline asset caching
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

