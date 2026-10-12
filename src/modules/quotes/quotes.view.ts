import { quotesService } from './quotes.service';
import { QuoteItem } from '../../types/project.types';

/**
 * Renders the Quote generator and pricing calculator view.
 */
export function renderQuotesView(container: HTMLElement): void {
  const currentItems: QuoteItem[] = [
    { id: '1', description: 'הריסת קירות ופינוי פסולת', unit: 'מ"ר', quantity: 25, unitPrice: 120, totalPrice: 3000 },
    { id: '2', description: 'ריצוף גרניט פורצלן כולל רובה', unit: 'מ"ר', quantity: 60, unitPrice: 180, totalPrice: 10800 },
    { id: '3', description: 'עבודות צבע ושפכטל אמריקאי', unit: 'מ"ר', quantity: 150, unitPrice: 70, totalPrice: 10500 },
  ];
  let includeVat = true;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 700;">מחולל הצעות מחיר</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">עריכת כמויות, תמחור והפקה לוואטסאפ</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button id="add-item-btn" class="btn" style="background: var(--color-primary-light); color: var(--color-primary);">+ הוסף סעיף</button>
        <button id="share-wa-btn" class="btn btn-primary">שתף בוואטסאפ</button>
      </div>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <div style="margin-bottom: 1rem;">
        <label style="font-size: 0.85rem; font-weight: 600;">כותרת הפרויקט / הצעה</label>
        <input id="quote-title" value="שיפוץ כללי דירת 4 חדרים" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 1rem;" />
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-border); color: var(--color-text-muted);">
              <th style="padding: 0.5rem;">תיאור הסעיף</th>
              <th style="padding: 0.5rem; width: 80px;">יח'</th>
              <th style="padding: 0.5rem; width: 90px;">כמות</th>
              <th style="padding: 0.5rem; width: 110px;">מחיר ליח' (₪)</th>
              <th style="padding: 0.5rem; width: 110px; text-align: left;">סה"כ</th>
            </tr>
          </thead>
          <tbody id="quote-tbody"></tbody>
        </table>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: flex-end;">
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
          <input type="checkbox" id="vat-toggle" checked /> כולל מע"מ (18%)
        </label>
        <div style="text-align: left; display: flex; flex-direction: column; gap: 0.25rem;">
          <div><span style="color: var(--color-text-muted);">סה"כ לפני מע"מ:</span> <strong id="q-subtotal">0 ₪</strong></div>
          <div id="vat-row"><span style="color: var(--color-text-muted);">מע"מ (18%):</span> <span id="q-vat">0 ₪</span></div>
          <div style="font-size: 1.2rem; color: var(--color-primary); margin-top: 0.25rem;"><span>סה"כ לתשלום:</span> <strong id="q-total">0 ₪</strong></div>
        </div>
      </div>
    </div>
  `;

  function updateView(): void {
    const tbody = document.getElementById('quote-tbody')!;
    tbody.innerHTML = currentItems.map((item, idx) => `
      <tr style="border-bottom: 1px solid var(--color-border);">
        <td style="padding: 0.4rem;"><input data-idx="${idx}" data-field="description" value="${item.description}" style="width:100%;border:none;background:transparent;padding:0.25rem;" /></td>
        <td style="padding: 0.4rem;"><input data-idx="${idx}" data-field="unit" value="${item.unit}" style="width:100%;border:none;background:transparent;padding:0.25rem;" /></td>
        <td style="padding: 0.4rem;"><input type="number" data-idx="${idx}" data-field="quantity" value="${item.quantity}" style="width:100%;padding:0.25rem;border:1px solid var(--color-border);border-radius:4px;" /></td>
        <td style="padding: 0.4rem;"><input type="number" data-idx="${idx}" data-field="unitPrice" value="${item.unitPrice}" style="width:100%;padding:0.25rem;border:1px solid var(--color-border);border-radius:4px;" /></td>
        <td style="padding: 0.4rem; text-align: left; font-weight: 600;">${(item.quantity * item.unitPrice).toLocaleString()} ₪</td>
      </tr>
    `).join('');

    attachInputHandlers();
    const { subtotal, vatAmount, totalWithVat } = quotesService.calculateQuoteTotals(currentItems, includeVat);
    document.getElementById('q-subtotal')!.textContent = `${subtotal.toLocaleString()} ₪`;
    document.getElementById('q-vat')!.textContent = `${vatAmount.toLocaleString()} ₪`;
    document.getElementById('q-total')!.textContent = `${totalWithVat.toLocaleString()} ₪`;
    document.getElementById('vat-row')!.style.display = includeVat ? 'block' : 'none';
  }

  function attachInputHandlers(): void {
    document.querySelectorAll('#quote-tbody input').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const idx = Number(target.getAttribute('data-idx'));
        const field = target.getAttribute('data-field') as keyof QuoteItem;
        if (field === 'quantity' || field === 'unitPrice') {
          (currentItems[idx] as unknown as Record<string, unknown>)[field] = Number(target.value) || 0;
          updateView();
        } else {
          (currentItems[idx] as unknown as Record<string, unknown>)[field] = target.value;
        }
      });
    });
  }

  document.getElementById('vat-toggle')!.addEventListener('change', (e) => {
    includeVat = (e.target as HTMLInputElement).checked;
    updateView();
  });

  document.getElementById('add-item-btn')!.addEventListener('click', () => {
    currentItems.push({
      id: String(Date.now()),
      description: 'סעיף חדש',
      unit: 'יח\'',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    });
    updateView();
  });

  document.getElementById('share-wa-btn')!.addEventListener('click', () => {
    const title = (document.getElementById('quote-title') as HTMLInputElement).value.trim();
    const encoded = quotesService.formatQuoteForWhatsApp(title, currentItems, includeVat);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  });

  updateView();
}
