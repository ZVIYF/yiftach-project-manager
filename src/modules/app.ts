import { router } from '../core/router';

/**
 * Root Application Module.
 * Initializes the layout shell, top navigation, and view switching.
 */
export class AppModule {
  private container: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.container = rootElement;
  }

  /**
   * Initializes the application shell and route registrations.
   */
  public start(): void {
    this.renderShell();
    this.setupRoutes();
    router.init();
  }

  private renderShell(): void {
    this.container.innerHTML = `
      <header style="background: var(--color-primary); color: white; padding: 1rem 1.5rem; box-shadow: var(--shadow-sm);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="background: white; color: var(--color-primary); width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700;">י</div>
            <h1 style="font-size: 1.25rem; font-weight: 600;">יפתח פרויקטים</h1>
          </div>
          <nav style="display: flex; gap: 1rem;">
            <a href="#dashboard" style="color: white; text-decoration: none; font-weight: 500;">ראשי</a>
            <a href="#projects" style="color: rgba(255,255,255,0.8); text-decoration: none;">פרויקטים</a>
            <a href="#finances" style="color: rgba(255,255,255,0.8); text-decoration: none;">כספים</a>
            <a href="#debts" style="color: rgba(255,255,255,0.8); text-decoration: none;">חובות</a>
          </nav>
        </div>
      </header>
      <main id="main-content" class="container"></main>
    `;
  }

  private setupRoutes(): void {
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
          שלב 1 (Phase 1) הושלם בהצלחה: התשתית המודולרית הוגדרה עם TypeScript קפדני, Vite, ו-Cloudflare Pages.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <span class="badge badge-success">Vite 5.4</span>
          <span class="badge badge-success">Strict TypeScript</span>
          <span class="badge badge-success">Cloudflare Ready</span>
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

