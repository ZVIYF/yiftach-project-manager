import { authService } from '../../core/auth.service';
import { router } from '../../core/router';

/**
 * Renders and handles the user authentication screen.
 *
 * @param {HTMLElement} container - DOM container to mount the login form.
 */
export function renderLoginView(container: HTMLElement): void {
  container.innerHTML = `
    <div style="max-width: 420px; margin: 3rem auto; padding: 0 1rem;">
      <div class="card" style="box-shadow: var(--shadow-md);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="background: var(--color-primary); color: white; width: 48px; height: 48px; border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem;">י</div>
          <h2 style="font-size: 1.35rem; font-weight: 700;">כניסה למערכת</h2>
          <p style="color: var(--color-text-muted); font-size: 0.9rem;">יפתח - ניהול פרויקטים וכספים</p>
        </div>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label for="login-email" style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">דואר אלקטרוני</label>
            <input
              id="login-email"
              type="email"
              required
              autocomplete="email"
              placeholder="name@example.com"
              style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.95rem; direction: ltr; text-align: left;"
            />
          </div>

          <div>
            <label for="login-password" style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">סיסמה</label>
            <input
              id="login-password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              style="width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.95rem; direction: ltr; text-align: left;"
            />
          </div>

          <div id="login-error-container" style="display: none; background: var(--color-danger-bg); color: var(--color-danger); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.85rem;"></div>

          <button id="login-submit-btn" type="submit" class="btn btn-primary" style="margin-top: 0.5rem; width: 100%;">
            התחבר
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement | null;
  const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement | null;
  const errorContainer = document.getElementById('login-error-container') as HTMLElement | null;
  const submitBtn = document.getElementById('login-submit-btn') as HTMLButtonElement | null;

  if (!form || !emailInput || !passwordInput || !submitBtn) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'מתחבר...';
    if (errorContainer) errorContainer.style.display = 'none';

    const result = await authService.signIn(email, password);

    submitBtn.disabled = false;
    submitBtn.textContent = 'התחבר';

    if (result.success) {
      router.navigate('dashboard');
    } else if (errorContainer) {
      errorContainer.textContent = result.error;
      errorContainer.style.display = 'block';
    }
  });
}
