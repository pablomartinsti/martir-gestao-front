import type { AppState } from '../../app/app-state';
import { filterNotes } from '../../utils/nfseSelectors';
import { renderNotesTable } from '../../components/NotesTable';

export function renderNotesView(state: AppState): string {
  const filtered = filterNotes(state, state.notas);

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">NFS-e</p>
        <h1>Notas</h1>
        <p>${filtered.length} nota(s) encontrada(s).</p>
      </div>
      <button class="primary-btn" data-action="switch-view" data-view="new-note">+ Nova nota</button>
    </section>
    ${renderNotesTable(state, filtered.slice().reverse(), true)}
  `;
}
