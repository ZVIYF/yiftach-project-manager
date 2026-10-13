import { debtsService } from './debts.service';
import { DebtRecord, TransactionOwner } from '../../types/finance.types';
import { escapeHtml } from '../../core/security';

/**
 * Renders the Debts management view and status toggle actions.
 */
export async function renderDebtsView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 700;">מעקב חובות</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">ניהול חובות פתוחים והסדרים</p>
      </div>
      <button id="new-debt-btn" class="btn btn-primary">+ חוב חדש</button>
    </div>

    <div id="debts-list-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="color: var(--color-text-muted); text-align: center; padding: 2rem;">טוען חובות...</div>
    </div>

    <!-- New Debt Modal -->
    <div id="debt-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
      <div class="card" style="max-width: 440px; width: 100%; box-shadow: var(--shadow-md);">
        <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem;">רישום חוב חדש</h3>
        <form id="create-debt-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div><label style="font-size: 0.85rem;">תיאור החוב</label><input id="debt-desc" required style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" /></div>
          <div><label style="font-size: 0.85rem;">סכום (₪)</label><input id="debt-amount" type="number" required min="0" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" /></div>
          <div><label style="font-size: 0.85rem;">שיוך</label>
            <select id="debt-owner" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
              <option value="biz">העסק</option><option value="mandel">מנדל</option><option value="avrumi">אברומי</option>
            </select>
          </div>
          <div><label style="font-size: 0.85rem;">הערות</label><input id="debt-note" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" /></div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="button" id="close-debt-modal" class="btn" style="background: #e2e8f0;">ביטול</button>
            <button type="submit" class="btn btn-primary">שמור חוב</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const modal = document.getElementById('debt-modal')!;
  const newBtn = document.getElementById('new-debt-btn')!;
  const closeBtn = document.getElementById('close-debt-modal')!;
  const form = document.getElementById('create-debt-form') as HTMLFormElement;

  newBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = (document.getElementById('debt-desc') as HTMLInputElement).value.trim();
    const amount = Number((document.getElementById('debt-amount') as HTMLInputElement).value) || 0;
    const owner = (document.getElementById('debt-owner') as HTMLSelectElement).value as TransactionOwner;
    const note = (document.getElementById('debt-note') as HTMLInputElement).value.trim();

    await debtsService.createDebt({ description: desc, amount, owner, status: 'open', notes: note });
    modal.style.display = 'none';
    form.reset();
    await loadDebtsList();
  });

  await loadDebtsList();
}

async function loadDebtsList(): Promise<void> {
  const result = await debtsService.getDebts();
  const listContainer = document.getElementById('debts-list-container')!;

  if (!result.success || result.data.length === 0) {
    listContainer.innerHTML = '<div class="card" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">אין חובות רשומים.</div>';
    return;
  }

  listContainer.innerHTML = result.data.map(renderDebtCard).join('');

  listContainer.querySelectorAll('.settle-debt-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const debtId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (!debtId) return;
      await debtsService.setDebtStatus(debtId, 'settled');
      await loadDebtsList();
    });
  });
}

function renderDebtCard(debt: DebtRecord): string {
  const isSettled = debt.status === 'settled';

  return `
    <div class="card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; opacity: ${isSettled ? '0.6' : '1'};">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <h4 style="font-size: 1rem; font-weight: 600;">${escapeHtml(debt.description)}</h4>
          <span class="badge ${isSettled ? 'badge-success' : ''}" style="${!isSettled ? 'background:#fee2e2;color:#b91c1c;' : ''}">
            ${isSettled ? 'הוסדר' : 'פתוח'}
          </span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-text-muted);">${escapeHtml(debt.owner)} ${debt.notes ? `• ${escapeHtml(debt.notes)}` : ''}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <strong style="font-size: 1.1rem; color: var(--color-danger);">${debt.amount.toLocaleString()} ₪</strong>
        ${!isSettled ? `<button data-id="${debt.id}" class="settle-debt-btn btn" style="font-size: 0.8rem; padding: 0.35rem 0.65rem; background: var(--color-primary-light); color: var(--color-primary);">סמן כהוסדר</button>` : ''}
      </div>
    </div>
  `;
}
