import { router } from '../core/router';
import { authService } from '../core/auth.service';
import { renderLoginView } from './auth/login.view';
import { renderProjectsView } from './projects/projects.view';
import { renderFinancesView } from './finances/finances.view';
import { renderDebtsView } from './debts/debts.view';
import { renderQuotesView } from './quotes/quotes.view';
import { renderPublicShareView } from './share/share.view';

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

    // Check URL parameters for public shared view (e.g. ?shareId=TOKEN)
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('shareId') || urlParams.get('share');
    if (shareParam) {
      router.navigate(`share?token=${shareParam}`);
      return;
    }

    authService.subscribe((state) => {
      this.renderShell();
      const currentHash = window.location.hash;
      if (!state.currentUser && !currentHash.startsWith('#share')) {
        router.navigate('login');
      } else if (state.currentUser && (currentHash === '#login' || !currentHash)) {
        router.navigate('dashboard');
      }
    });
  }

  private renderShell(): void {
    const user = authService.getCurrentUser();
    const isAuthed = authService.isAuthorized();
    const currentHash = window.location.hash;

    if (!isAuthed && !currentHash.startsWith('#share')) {
      const existingMain = document.getElementById('main-content');
      // Preserve active login form and avoid unmounting DOM nodes while credentials are being validated
      if (existingMain && (currentHash === '#login' || !currentHash)) {
        return;
      }

      this.container.innerHTML = `<main id="main-content" class="container"></main>`;
      const main = document.getElementById('main-content');
      if (main) renderLoginView(main);
      return;
    }

    if (currentHash.startsWith('#share')) {
      this.container.innerHTML = `<main id="main-content" class="container"></main>`;
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
            <a href="#quotes" style="color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem;">הצעות מחיר</a>
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

    router.register('projects', () => {
      const main = document.getElementById('main-content');
      if (main) renderProjectsView(main);
    });

    router.register('finances', () => {
      const main = document.getElementById('main-content');
      if (main) renderFinancesView(main);
    });

    router.register('debts', () => {
      const main = document.getElementById('main-content');
      if (main) renderDebtsView(main);
    });

    router.register('quotes', () => {
      const main = document.getElementById('main-content');
      if (main) renderQuotesView(main);
    });

    router.register('share', () => {
      const main = document.getElementById('main-content');
      if (!main) return;
      const hash = window.location.hash;
      const tokenMatch = hash.match(/token=([^&]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      if (token) {
        renderPublicShareView(main, token);
      } else {
        main.innerHTML = '<div class="card" style="text-align:center;padding:2rem;">חסר מזהה שיתוף תקין.</div>';
      }
    });
  }

  private renderDashboard(): void {
    const main = document.getElementById('main-content');
    if (!main) return;

    main.innerHTML = `
      <div class="card">
        <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">מערכת ניהול פרויקטים וכספים</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 1rem;">
          שלב 3 (Phase 3): כל מודולי הליבה פועלים (פרויקטים, כספים ותזרים, חובות, מחולל הצעות מחיר, נקודות קצה Cloudflare ופונקציית שיתוף ציבורית).
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="#projects" class="btn btn-primary" style="text-decoration:none;">לניהול פרויקטים</a>
          <a href="#finances" class="btn" style="background:#e0e7ff;color:#4338ca;text-decoration:none;">לניהול כספים</a>
          <a href="#debts" class="btn" style="background:#fee2e2;color:#b91c1c;text-decoration:none;">למעקב חובות</a>
          <a href="#quotes" class="btn" style="background:#ecfdf5;color:#047857;text-decoration:none;">מחולל הצעות</a>
        </div>
      </div>
    `;
  }
}
