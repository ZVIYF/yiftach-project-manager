import { NavigationTab } from '../types/common.types';

export type RouteHandler = (params?: Record<string, string>) => void;

/**
 * Lightweight hash-based SPA router with Auth Guard support.
 */
export class AppRouter {
  private routes: Map<string, RouteHandler> = new Map();
  private authGuard: (() => boolean) | null = null;
  private defaultTab: NavigationTab = 'dashboard';

  /**
   * Registers a route path and handler.
   *
   * @param {string} path - URL hash path.
   * @param {RouteHandler} handler - Callback to execute on route match.
   */
  public register(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  /**
   * Sets the global authentication guard predicate.
   *
   * @param {() => boolean} guard - Function returning true if authenticated.
   */
  public setAuthGuard(guard: () => boolean): void {
    this.authGuard = guard;
  }

  /**
   * Navigates programmatically to a given tab or route.
   *
   * @param {string} path - Target path.
   */
  public navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Starts listening to hash changes and handles the initial route.
   */
  public init(): void {
    window.addEventListener('hashchange', () => this.handleCurrentRoute());
    this.handleCurrentRoute();
  }

  private handleCurrentRoute(): void {
    const rawHash = window.location.hash.slice(1) || this.defaultTab;
    const [path] = rawHash.split('?');
    const safePath = path || this.defaultTab;

    // Public routes (such as share links) bypass the auth guard
    const isPublicShare = safePath.startsWith('share');

    if (!isPublicShare && this.authGuard && !this.authGuard()) {
      const loginHandler = this.routes.get('login');
      if (loginHandler) {
        loginHandler();
        return;
      }
    }

    const matchedHandler = this.routes.get(safePath) || this.routes.get(this.defaultTab);
    if (matchedHandler) {
      matchedHandler();
    }
  }
}

export const router = new AppRouter();

