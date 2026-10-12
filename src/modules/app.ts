import { router } from '../core/router';
import { authService } from '../core/auth.service';
import { renderLoginView } from './auth/login.view';

/**
 * Root Application Module.
 * Initializes the layout shell, top navigation, authentication guard, and view switching.
 */
export class AppModule {
  private container: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.container = rootElement;
  }

  /**
   * Initializes the application shell, auth guard, and route registrations.
   */
  public start(): void {
    router.setAuthGuard(() => authService.isAuthorized());
    this.setupRoutes();
    router.init();

    authService.subscribe((state) => {
      this.renderShell();
      if (!state.currentUser && !window.location.hash.startsWith('#share')) {
        router.navigate('login');
      } else if (state.currentUser && window.location.hash === '#login') {
        router.navigate('dashboard');
      }
    });
  }

  private renderShell(): void {
    const user = authService.getCurrentUser();
    const isAuthed = authService.isAuthorized();

    if (!isAuthed && !window.location.hash.startsWith('#share')) {
      this.container.innerHTML = `<main id="main-content" class="container"></main>`;
      const main = document.getElementById('main-content');
      if (main) renderLoginView(main);
      return;
    }

    this.container.innerHTML = `
      <header style="background: var(--color-primary); color: white; padding: 0.85rem 1.5rem; box-shadow: var(--shadow-sm);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="background: white; color: var(--color-primary); width: 34px; height: 34px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700;">י</div>
            <h1 style="font-size: 1.15rem; font-weight: 600;">יפתח פרויקטים</h1>
          </div>
          <nav style="display: flex; align-items: center; gap: 1.25rem;">
            <a href="#dashboard" style="color: white; text-decoration: none; font-size: 0.95rem;">ראשי</a>
            <a href="#projects" style="color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem;">פרויקטים</a>
            <a href="#finances" style="color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem;">כספים</a>
            <a href="#debts" style="color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem;">חובות</a>
            ${user ? `
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-right: 0.5rem; padding-right: 0.75rem; border-right: 1px solid rgba(255,255,255,0.25);">
                <span style="font-size: 0.8rem; color: rgba(255,255,255,0.75);">${user.email}</span>
                <button id="logout-btn" class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: rgba(255,255,255,0.15); color: white;">התנתק</button>
              </div>
            ` : ''}
          </nav>
        </div>
      </header>
      <main id="main-content" class="container"></main>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authService.signOut().then(() => router.navigate('login'));
      });
    }
  }

  private setupRoutes(): void {
    router.register('login', () => {
      const main = document.getElementById('main-content');
      if (main) renderLoginView(main);
    });
    router.register('dashboard', () => this.renderDashboard());
    router.register('projects', () => this.renderProjectsPlaceholder());
    router.register('finances', () => this.renderFinancesPlaceholder());
    router.register('debts', () => this.renderDebtsPlaceholder());
  }

  private renderDashboard(): void {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card">
        <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">מערכת ניהול פרויקטים וכספים</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 1rem;">
          שלב 2 (Phase 2): מערכת האימות מאובטחת באמצעות Firebase Auth ואימות שרת מול רשימת משתמשים מורשים.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <span class="badge badge-success">Auth Guard Active</span>
          <span class="badge badge-success">Server Validated</span>
          <span class="badge badge-success">Normalized Schema</span>
        </div>
      </div>
    `;
  }

  private renderProjectsPlaceholder(): void {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = `<div class="card"><h2>פרויקטים</h2><p style="color: var(--color-text-muted);">מודול הפרויקטים ייבנה בשלב 3.</p></div>`;
  }

  private renderFinancesPlaceholder(): void {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = `<div class="card"><h2>כספים ותזרים</h2><p style="color: var(--color-text-muted);">מודול הכספים ייבנה בשלב 3.</p></div>`;
  }

  private renderDebtsPlaceholder(): void {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = `<div class="card"><h2>חובות</h2><p style="color: var(--color-text-muted);">מודול החובות ייבנה בשלב 3.</p></div>`;
  }
}
