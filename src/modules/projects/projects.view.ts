import { projectsService } from './projects.service';
import { Project } from '../../types/project.types';
import { escapeHtml } from '../../core/security';

/**
 * Renders the Projects management view and modals.
 *
 * @param {HTMLElement} container - DOM container to render into.
 */
export async function renderProjectsView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 700;">ניהול פרויקטים</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem;">מעקב שלבים, לקוחות ותקציבים</p>
      </div>
      <button id="new-project-btn" class="btn btn-primary">+ פרויקט חדש</button>
    </div>

    <div id="projects-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="text-align: center; color: var(--color-text-muted); padding: 2rem;">טוען פרויקטים...</div>
    </div>

    <div id="project-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
      <div class="card" style="max-width: 500px; width: 100%; box-shadow: var(--shadow-md);">
        <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem;">יצירת פרויקט חדש</h3>
        <form id="create-project-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">שם הפרויקט</label>
            <input id="proj-name" required class="input" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" placeholder="שיפוץ דירה / וילה" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">שם לקוח</label>
            <input id="proj-client" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" placeholder="ישראל ישראלי" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">טלפון</label>
            <input id="proj-phone" type="tel" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" placeholder="050-0000000" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">תקציב כולל (₪)</label>
            <input id="proj-budget" type="number" min="0" value="0" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm);" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="button" id="close-modal-btn" class="btn" style="background: #e2e8f0;">ביטול</button>
            <button type="submit" class="btn btn-primary">שמור פרויקט</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const listContainer = document.getElementById('projects-list-container')!;
  const modal = document.getElementById('project-modal')!;
  const newBtn = document.getElementById('new-project-btn')!;
  const closeBtn = document.getElementById('close-modal-btn')!;
  const form = document.getElementById('create-project-form') as HTMLFormElement;

  newBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (document.getElementById('proj-name') as HTMLInputElement).value.trim();
    const clientName = (document.getElementById('proj-client') as HTMLInputElement).value.trim();
    const clientPhone = (document.getElementById('proj-phone') as HTMLInputElement).value.trim();
    const budgetTotal = Number((document.getElementById('proj-budget') as HTMLInputElement).value) || 0;

    const res = await projectsService.createProject({
      name,
      clientName,
      clientPhone,
      budgetTotal,
      status: 'active',
      phases: [],
    });

    if (res.success) {
      modal.style.display = 'none';
      form.reset();
      renderProjectsCards(listContainer);
    }
  });

  await renderProjectsCards(listContainer);
}

async function renderProjectsCards(container: HTMLElement): Promise<void> {
  const result = await projectsService.getProjects();
  if (!result.success || result.data.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">
        אין פרויקטים להצגה. לחץ על "+ פרויקט חדש" כדי להתחיל.
      </div>
    `;
    return;
  }

  container.innerHTML = result.data.map(renderSingleProjectCard).join('');
}

function renderSingleProjectCard(project: Project): string {
  const statusLabels: Record<string, string> = {
    active: 'פעיל',
    draft: 'טיוטה',
    completed: 'הושלם',
    paused: 'מושהה',
  };

  return `
    <div class="card" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 600;">${escapeHtml(project.name)}</h3>
          <span class="badge badge-success">${escapeHtml(statusLabels[project.status] || project.status)}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--color-text-muted);">
          לקוח: ${escapeHtml(project.clientName)} ${project.clientPhone ? `• ${escapeHtml(project.clientPhone)}` : ''}
        </p>
      </div>
      <div style="text-align: left;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted); display: block;">תקציב</span>
        <strong style="font-size: 1.1rem;">${project.budgetTotal.toLocaleString()} ₪</strong>
      </div>
    </div>
  `;
}
