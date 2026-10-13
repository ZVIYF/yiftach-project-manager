import { financesService } from './finances.service';
import { FinancialTransaction, TransactionType, TransactionOwner } from '../../types/finance.types';
import { escapeHtml } from '../../core/security';

/**
 * Renders the Finances & Cashflow dashboard view.
 */
export async function renderFinancesView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 700;">ניהול כספים ותזרים</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">מעקב הכנסות, הוצאות, גבייה וחלוקת שותפים</p>
      </div>
      <button id="new-tx-btn" class="btn btn-primary">+ תנועה חדשה</button>
    </div>

    <!-- Summary Metrics Cards -->
    <div id="finance-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
      <div class="card"><span style="color: var(--color-text-muted); font-size: 0.85rem;">הכנסות</span><h3 id="m-income" style="color: var(--color-success); font-size: 1.4rem;">0 ₪</h3></div>
      <div class="card"><span style="color: var(--color-text-muted); font-size: 0.85rem;">הוצאות עסק</span><h3 id="m-expenses" style="color: var(--color-danger); font-size: 1.4rem;">0 ₪</h3></div>
      <div class="card"><span style="color: var(--color-text-muted); font-size: 0.85rem;">הוצאות שעברו (Pass-Through)</span><h3 id="m-passthru" style="color: var(--color-warning); font-size: 1.4rem;">0 ₪</h3></div>
      <div class="card"><span style="color: var(--color-text-muted); font-size: 0.85rem;">רווח נקי</span><h3 id="m-profit" style="color: var(--color-primary); font-size: 1.4rem;">0 ₪</h3></div>
    </div>

    <!-- Partner Splits -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">משיכות שותפים</h3>
      <div style="display: flex; gap: 2rem;">
        <div><span style="color: var(--color-text-muted); font-size: 0.85rem;">מנדל:</span> <strong id="m-mandel">0 ₪</strong></div>
        <div><span style="color: var(--color-text-muted); font-size: 0.85rem;">אברומי:</span> <strong id="m-avrumi">0 ₪</strong></div>
      </div>
    </div>

    <div id="tx-list-container" class="card">
      <div style="color: var(--color-text-muted); text-align: center; padding: 1.5rem;">טוען תנועות...</div>
    </div>

    <!-- New Transaction Modal -->
    <div id="tx-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
      <div class="card" style="max-width: 480px; width: 100%; box-shadow: var(--shadow-md);">
        <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem;">הזנת תנועה כספית</h3>
        <form id="create-tx-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div><label style="font-size: 0.85rem;">תיאור</label><input id="tx-desc" required style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" /></div>
          <div><label style="font-size: 0.85rem;">סכום (₪)</label><input id="tx-amount" type="number" required min="0" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" /></div>
          <div><label style="font-size: 0.85rem;">סוג תנועה</label>
            <select id="tx-type" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
              <option value="expense">הוצאה</option><option value="income">הכנסה</option><option value="withdrawal">משיכת שותף</option>
            </select>
          </div>
          <div><label style="font-size: 0.85rem;">שיוך / שותף</label>
            <select id="tx-owner" style="width: 100%; padding: 0.45rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
              <option value="biz">העסק</option><option value="mandel">מנדל</option><option value="avrumi">אברומי</option>
            </select>
          </div>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-top: 0.25rem;">
            <input type="checkbox" id="tx-passthru" /> הוצאה עבור לקוח שאינה נספרת ברווח (Pass-Through)
          </label>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="button" id="close-tx-modal" class="btn" style="background: #e2e8f0;">ביטול</button>
            <button type="submit" class="btn btn-primary">שמור תנועה</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupFinancesEvents();
  await loadFinancesData();
}

function setupFinancesEvents(): void {
  const modal = document.getElementById('tx-modal')!;
  const newBtn = document.getElementById('new-tx-btn')!;
  const closeBtn = document.getElementById('close-tx-modal')!;
  const form = document.getElementById('create-tx-form') as HTMLFormElement;

  newBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = (document.getElementById('tx-desc') as HTMLInputElement).value.trim();
    const amount = Number((document.getElementById('tx-amount') as HTMLInputElement).value) || 0;
    const type = (document.getElementById('tx-type') as HTMLSelectElement).value as TransactionType;
    const owner = (document.getElementById('tx-owner') as HTMLSelectElement).value as TransactionOwner;
    const passThrough = (document.getElementById('tx-passthru') as HTMLInputElement).checked;

    await financesService.createTransaction({
      description: desc,
      amount,
      type,
      owner,
      passThrough,
      date: new Date().toISOString().split('T')[0] || '',
    });

    modal.style.display = 'none';
    form.reset();
    await loadFinancesData();
  });
}

async function loadFinancesData(): Promise<void> {
  const result = await financesService.getTransactions();
  if (!result.success) return;

  const transactions = result.data;
  const metrics = financesService.calculateMetrics(transactions);

  document.getElementById('m-income')!.textContent = `${metrics.totalIncome.toLocaleString()} ₪`;
  document.getElementById('m-expenses')!.textContent = `${metrics.realExpenses.toLocaleString()} ₪`;
  document.getElementById('m-passthru')!.textContent = `${metrics.passThroughExpenses.toLocaleString()} ₪`;
  document.getElementById('m-profit')!.textContent = `${metrics.netProfit.toLocaleString()} ₪`;
  document.getElementById('m-mandel')!.textContent = `${(metrics.partnerWithdrawals['mandel'] || 0).toLocaleString()} ₪`;
  document.getElementById('m-avrumi')!.textContent = `${(metrics.partnerWithdrawals['avrumi'] || 0).toLocaleString()} ₪`;

  const listContainer = document.getElementById('tx-list-container')!;
  if (transactions.length === 0) {
    listContainer.innerHTML = '<div style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">אין תנועות כספיות רשומות.</div>';
    return;
  }

  listContainer.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.9rem;">
      <thead>
        <tr style="border-bottom: 2px solid var(--color-border); color: var(--color-text-muted);">
          <th style="padding: 0.5rem;">תאריך</th>
          <th style="padding: 0.5rem;">תיאור</th>
          <th style="padding: 0.5rem;">שיוך</th>
          <th style="padding: 0.5rem; text-align: left;">סכום</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.slice(0, 50).map(renderTxRow).join('')}
      </tbody>
    </table>
  `;
}

function renderTxRow(tx: FinancialTransaction): string {
  const isIncome = tx.type === 'income';
  const color = isIncome ? 'var(--color-success)' : 'var(--color-text-main)';
  const prefix = isIncome ? '+' : '-';

  return `
    <tr style="border-bottom: 1px solid var(--color-border);">
      <td style="padding: 0.5rem; color: var(--color-text-muted);">${tx.date}</td>
      <td style="padding: 0.5rem;">${escapeHtml(tx.description)} ${tx.passThrough ? '<span class="badge" style="background:#fef3c7;color:#b45309;font-size:0.7rem;">מעבר</span>' : ''}</td>
      <td style="padding: 0.5rem; font-size: 0.85rem;">${escapeHtml(tx.owner)}</td>
      <td style="padding: 0.5rem; text-align: left; font-weight: 600; color: ${color};">${prefix}${tx.amount.toLocaleString()} ₪</td>
    </tr>
  `;
}
