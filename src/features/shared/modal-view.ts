import type { AppState } from '../../app/app-state';
import type {
  NotaServico,
  NotaServicoEventoFiscal,
  ProntidaoFiscal,
} from '../../domain/models';
import { escapeHtml } from '../../shared/utils/dom';
import { formatCurrency, formatDate, readableEnum, statusLabel } from '../../shared/utils/formatters';
import { clientName, serviceName } from '../nfse/nfse-selectors';
import { renderMetaBox } from '../nfse/nfse-view';
import { serviceOptionLabel } from '../services/service-labels';

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

  if (modal.type === 'replacement') {
    return renderReplacementModal(state, modal.data as NotaServico);
  }

  return '';
}

function renderNoteModal(state: AppState, nota: NotaServico): string {
  const showFiscalNumber = nota.status !== 'RASCUNHO' && nota.numeroNfse;

  return `
    <div class="meta-grid">
      ${renderMetaBox('Status', statusLabel(nota.status))}
      ${renderMetaBox('Cliente', clientName(state, nota.clienteId))}
      ${renderMetaBox('Valor do servico', formatCurrency(nota.valorServico))}
      ${showFiscalNumber ? renderMetaBox('NFS-e', nota.numeroNfse || '-') : ''}
    </div>
    <div class="modal-note-copy">
      <small>Servico</small>
      <strong>${escapeHtml(serviceName(state, nota.servicoId))}</strong>
      <small>Descricao</small>
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
    actions.push(`<button class="danger-btn" data-action="delete-draft-note" data-id="${nota.id}">Excluir rascunho</button>`);
  }

  if ((nota.status === 'EMITIDA' || nota.status === 'SUBSTITUIDA') && nota.chaveAcesso) {
    actions.push(`<button class="action-btn" data-action="download-danfse" data-id="${nota.id}">Baixar PDF</button>`);
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

function renderReplacementModal(state: AppState, nota: NotaServico): string {
  const activeServices = state.servicos.filter((servico) => servico.ativo);

  return `
    <form id="replacement-form" class="form-grid">
      <input type="hidden" name="notaId" value="${escapeHtml(nota.id)}" />
      <div class="meta-grid">
        ${renderMetaBox('Nota original', nota.numeroNfse || nota.numeroDps || '-')}
        ${renderMetaBox('Cliente', clientName(state, nota.clienteId))}
        ${renderMetaBox('Valor atual', formatCurrency(nota.valorServico))}
        ${renderMetaBox('Status', statusLabel(nota.status))}
      </div>
      <div class="field">
        <label for="replacementValorServico">Valor da nota substituta</label>
        <input
          id="replacementValorServico"
          name="valorServico"
          inputmode="decimal"
          value="${escapeHtml(currencyInputValue(nota.valorServico))}"
          placeholder="Ex.: 200 ou 200,00"
          required
        />
      </div>
      <div class="field">
        <label for="replacementServicoId">Servico da nota substituta</label>
        <select id="replacementServicoId" name="servicoId" required>
          <option value="">Selecione</option>
          ${activeServices
            .map(
              (servico) => `
                <option value="${escapeHtml(servico.id)}" ${servico.id === nota.servicoId ? 'selected' : ''}>
                  ${escapeHtml(serviceOptionLabel(servico))}
                </option>
              `,
            )
            .join('')}
        </select>
      </div>
      <div class="field">
        <label for="replacementDescricao">Descricao da nota substituta</label>
        <textarea id="replacementDescricao" name="descricao" required>${escapeHtml(nota.descricao || '')}</textarea>
      </div>
      <div class="field">
        <label for="replacementMotivo">Motivo da substituicao</label>
        <textarea id="replacementMotivo" name="motivoSubstituicao" minlength="15" required>Correcao de dados da NFS-e emitida</textarea>
      </div>
      <div class="toolbar">
        <button class="primary-btn" type="submit">Gerar rascunho de substituicao</button>
        <button class="ghost-btn" type="button" data-action="close-modal">Cancelar</button>
      </div>
    </form>
  `;
}

function currencyInputValue(value?: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
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
