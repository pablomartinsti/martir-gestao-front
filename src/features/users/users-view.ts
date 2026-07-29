import type { AppState } from '../../app/app-state';
import { escapeHtml } from '../../shared/utils/dom';
import { renderCompactList } from '../shared/list-view';

export function renderUsersView(state: AppState): string {
  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">Usuarios</p>
        <h1>Equipe</h1>
        <p>${state.usuario?.perfil || ''}</p>
      </div>
    </section>
    <section class="panel">
      <div class="panel-title"><h2>Usuarios cadastrados</h2></div>
      ${
        state.usuariosErro
          ? `<div class="empty">${escapeHtml(state.usuariosErro)}</div>`
          : renderCompactList(
              state.usuarios,
              (usuario) => usuario.nome,
              (usuario) => `${usuario.email} · ${usuario.perfil} · ${usuario.ativo ? 'Ativo' : 'Inativo'}`,
            )
      }
    </section>
  `;
}
