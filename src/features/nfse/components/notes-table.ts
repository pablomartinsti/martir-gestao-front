import type { AppState } from '../../../app/app-state';
import type { NotaServico } from '../../../domain/models';
import { escapeHtml } from '../../../shared/utils/dom';
import {
  formatCurrency,
  formatDate,
  statusClass,
  statusLabel,
} from '../../../shared/utils/formatters';
import { clientName, serviceName } from '../nfse-selectors';
import { canDownloadDanfse } from './note-action-rules';

export function renderNotesTable(state: AppState, notas: NotaServico[], withToolbar: boolean): string {
  return `
    <section class="table-panel">
      <div class="panel-title">
        <h2>Notas</h2>
        ${withToolbar ? '' : '<button class="action-btn" data-action="switch-view" data-view="notes">Ver todas</button>'}
      </div>
      ${
        withToolbar
          ? `<form id="search-form" class="toolbar">
              <label class="search">
                <span>Buscar</span>
                <input name="search" value="${escapeHtml(state.search)}" placeholder="Numero, cliente, servico ou status" />
              </label>
              <button class="ghost-btn" type="submit">Aplicar</button>
            </form>`
          : ''
      }
      ${
        notas.length
          ? `<div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>NFS-e</th>
                    <th>Emissao</th>
                    <th>Cliente</th>
                    <th>Servico</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  ${notas.map((nota) => renderNoteRow(state, nota)).join('')}
                </tbody>
              </table>
            </div>`
          : '<div class="empty">Nenhuma nota encontrada.</div>'
      }
    </section>
  `;
}

function renderNoteRow(state: AppState, nota: NotaServico): string {
  return `
    <tr>
      <td>${escapeHtml(nota.numeroNfse || '-')}</td>
      <td>${nota.dataEmissao ? formatDate(nota.dataEmissao) : '-'}</td>
      <td>${escapeHtml(clientName(state, nota.clienteId))}</td>
      <td>${escapeHtml(serviceName(state, nota.servicoId))}</td>
      <td>${formatCurrency(nota.valorServico)}</td>
      <td><span class="status ${statusClass(nota.status)}">${statusLabel(nota.status)}</span></td>
      <td>
        ${renderNoteActions(nota)}
      </td>
    </tr>
  `;
}

function renderNoteActions(nota: NotaServico): string {
  const actions: string[] = [];

  if (nota.status === 'RASCUNHO') {
    actions.push(`<button class="action-btn" data-action="show-note" data-id="${nota.id}">Ver</button>`);
    actions.push(`<button class="primary-btn compact" data-action="emit-note" data-id="${nota.id}">Emitir NFS-e</button>`);
    actions.push(`<button class="danger-btn compact" data-action="delete-draft-note" data-id="${nota.id}">Excluir</button>`);
  }

  if (canDownloadDanfse(nota)) {
    actions.push(`<button class="action-btn" data-action="download-danfse" data-id="${nota.id}">PDF</button>`);
  }

  if (nota.status === 'EMITIDA') {
    actions.push(`<button class="action-btn" data-action="replace-nfse" data-id="${nota.id}">Substituir</button>`);
    actions.push(`<button class="danger-btn compact" data-action="cancel-nfse" data-id="${nota.id}">Cancelar</button>`);
  }

  return `<div class="table-actions">${actions.length ? actions.join('') : '<span class="muted-action">-</span>'}</div>`;
}
