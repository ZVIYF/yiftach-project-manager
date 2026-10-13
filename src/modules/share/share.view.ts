import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../../core/firebase';
import { escapeHtml } from '../../core/security';

interface ShareSnapshotData {
  name: string;
  clientName: string;
  budgetTotal: number;
  phases?: Array<{ name: string; isCompleted: boolean }>;
  quotes?: Array<{ title: string; totalAmount: number }>;
}

/**
 * Renders the unauthenticated, read-only public project share view for customers.
 *
 * @param {HTMLElement} container - DOM container to mount the share view.
 * @param {string} shareToken - Public access token.
 */
export async function renderPublicShareView(container: HTMLElement, shareToken: string): Promise<void> {
  container.innerHTML = `
    <div style="max-width: 650px; margin: 2rem auto; padding: 0 1rem;">
      <div class="card" id="share-card" style="box-shadow: var(--shadow-md);">
        <div style="text-align: center; color: var(--color-text-muted); padding: 2rem;">
          טוען נתוני פרויקט...
        </div>
      </div>
    </div>
  `;

  const card = document.getElementById('share-card')!;

  try {
    const db = getFirestoreDb();
    const shareRef = doc(db, 'publicShares', shareToken);
    const snap = await getDoc(shareRef);

    if (!snap.exists()) {
      card.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h3 style="color: var(--color-danger); margin-bottom: 0.5rem;">קישור לא נמצא</h3>
          <p style="color: var(--color-text-muted); font-size: 0.9rem;">קישור זה אינו תקף או שהוסר על ידי מנהל הפרויקט.</p>
        </div>
      `;
      return;
    }

    const rawData = snap.data();
    const data: ShareSnapshotData = (rawData?.snapshot as ShareSnapshotData) || (rawData as ShareSnapshotData);

    card.innerHTML = `
      <div style="border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1.5rem; text-align: center;">
        <span style="font-size: 0.8rem; background: var(--color-primary-light); color: var(--color-primary); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-weight: 600;">סטטוס פרויקט לקוח</span>
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-top: 0.5rem;">${data.name ? escapeHtml(data.name) : 'פרויקט שיפוצים'}</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">עבור: ${data.clientName ? escapeHtml(data.clientName) : 'לקוח יקר'}</p>
      </div>

      <!-- Phases checklist -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">שלבי ביצוע</h4>
        ${Array.isArray(data.phases) && data.phases.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${data.phases.map((p) => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--color-bg-body); border-radius: var(--radius-sm);">
                <span>${escapeHtml(p.name)}</span>
                <span class="badge ${p.isCompleted ? 'badge-success' : ''}" style="${!p.isCompleted ? 'background:#e2e8f0;color:#64748b;' : ''}">
                  ${p.isCompleted ? 'הושלם' : 'בתהליך'}
                </span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: var(--color-text-muted); font-size: 0.85rem;">אין שלבים מוגדרים להצגה.</p>'}
      </div>

      <div style="border-top: 1px solid var(--color-border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.9rem; color: var(--color-text-muted);">תקציב הפרויקט:</span>
        <strong style="font-size: 1.25rem; color: var(--color-primary);">${(data.budgetTotal || 0).toLocaleString()} ₪</strong>
      </div>
    `;
  } catch (err: unknown) {
    card.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-danger);">
        שגיאה בטעינת נתוני הפרויקט. אנא נסה שוב מאוחר יותר.
      </div>
    `;
  }
}
