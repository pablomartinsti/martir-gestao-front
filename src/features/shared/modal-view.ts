import type { AppState } from '../../app/app-state';
import type {
  NotaServico,
  NotaServicoEventoFiscal,
  ProntidaoFiscal,
} from '../../domain/models';
import { escapeHtml } from '../../shared/utils/dom';
import { formatCurrency, formatDate, readableEnum, statusLabel } from '../../shared/utils/formatters';
import { clientName, serviceDetails } from '../nfse/nfse-selectors';
import { renderMetaBox } from '../nfse/nfse-view';

export function renderModal(state: AppState): string {
  if (!state.modal) {
    return '';
  }

  const title = state.modal.title || 'Detalhes';
  return `
    <div class="modal-backdrop">
      <article class="modal">
        <header class="modal-head">
          <h2>${escapeHtml(title)}</h2>
          <button class="icon-btn" data-action="close-modal" aria-label="Fechar">×</button>
        </header>
        <div class="modal-body">${renderModalBody(state)}</div>
      </article>
    </div>
  `;
}

function renderModalBody(state: AppState): string {
  const modal = state.modal;

  if (!modal) {
    return '';
  }

  if (modal.type === 'note') {
    return renderNoteModal(state, modal.data as NotaServico);
  }

  if (modal.type === 'text') {
    return `<pre>${escapeHtml(String(modal.data || ''))}</pre>`;
  }

  if (modal.type === 'events') {
    return renderEventsModal(modal.data as NotaServicoEventoFiscal[]);
  }

  if (modal.type === 'readiness') {
    return renderReadinessModal(modal.data as ProntidaoFiscal);
  }

  return '';
}

function renderNoteModal(state: AppState, nota: NotaServico): string {
  return `
    <div class="meta-grid">
      ${renderMetaBox('Status', statusLabel(nota.status))}
      ${renderMetaBox('Cliente', clientName(state, nota.clienteId))}
      ${renderMetaBox('Valor', formatCurrency(nota.valorServico))}
      ${renderMetaBox('ISS', formatCurrency(nota.valorIss))}
      ${renderMetaBox('Competencia', formatDate(nota.dataCompetencia || nota.createdAt))}
      ${renderMetaBox('DPS', [nota.serieDps, nota.numeroDps].filter(Boolean).join(' / ') || '-')}
      ${renderMetaBox('NFS-e', nota.numeroNfse || '-')}
      ${renderMetaBox('Ambiente', readableEnum(nota.ambienteFiscal))}
    </div>
    <div class="modal-note-copy">
      <strong>${escapeHtml(serviceDetails(state, nota.servicoId))}</strong>
      <span>${escapeHtml(nota.descricao || '-')}</span>
      ${nota.mensagemErroFiscal || nota.mensagemErro ? `<small>${escapeHtml(nota.mensagemErroFiscal || nota.mensagemErro || '')}</small>` : ''}
    </div>
    <div class="panel-title modal-actions-title">
      <h3>Acoes da nota</h3>
    </div>
    ${renderNoteActions(nota)}
  `;
}

function renderNoteActions(nota: NotaServico): string {
  const actions: string[] = [];

  if (nota.status === 'RASCUNHO') {
    actions.push(`<button class="primary-btn" data-action="emit-note" data-id="${nota.id}">Emitir NFS-e</button>`);
  }

  if (nota.status === 'EMITIDA') {
    actions.push(`<button class="action-btn" data-action="replace-nfse" data-id="${nota.id}">Substituir</button>`);
    actions.push(`<button class="danger-btn" data-action="cancel-nfse" data-id="${nota.id}">Cancelar</button>`);
  }

  if (!actions.length) {
    return '<div class="empty compact-empty">Nenhuma acao disponivel para esta nota.</div>';
  }

  return `<div class="toolbar">${actions.join('')}</div>`;
}

function renderEventsModal(events: NotaServicoEventoFiscal[]): string {
  if (!events.length) {
    return '<div class="empty">Nenhum evento fiscal encontrado.</div>';
  }

  return `
    <div class="compact-list">
      ${events
        .map(
          (event) => `
            <div class="list-item">
              <strong>${escapeHtml(readableEnum(event.tipo))} · ${escapeHtml(event.status)}</strong>
              <span>${escapeHtml(event.mensagem || 'Sem mensagem')} · ${formatDate(event.createdAt)}</span>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderReadinessModal(data: ProntidaoFiscal): string {
  return `
    <div class="meta-grid">
      ${renderMetaBox('Pronta', data.pronto ? 'Sim' : 'Nao')}
      ${renderMetaBox('Pendencias', String(data.pendencias?.length || 0))}
      ${renderMetaBox('Producao real', data.producaoReal ? 'Validada' : 'Nao aplicavel')}
    </div>
    <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
  `;
}
