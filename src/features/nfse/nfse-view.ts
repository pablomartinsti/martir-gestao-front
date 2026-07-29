import type { AppState } from '../../app/app-state';
import type { NotaServico } from '../../domain/models';
import { escapeHtml } from '../../shared/utils/dom';
import {
  formatCurrency,
  formatDate,
  formatDocument,
  formatNumber,
  statusClass,
  statusLabel,
} from '../../shared/utils/formatters';
import { serviceOptionLabel } from '../services/service-labels';
import {
  clientName,
  filterNotes,
  filterNotesByDashboardPeriod,
  getDashboardDateRange,
  getDashboardMovement,
  serviceDetails,
} from './nfse-selectors';

export function renderDashboardView(state: AppState): string {
  const dashboardNotes = filterNotesByDashboardPeriod(state);
  const emittedCount = dashboardNotes.filter((nota) => nota.status === 'EMITIDA').length;

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">Painel</p>
        <h1>NFS-e</h1>
        <p>Acompanhe suas notas emitidas, faturamento e ultimas emissoes.</p>
      </div>
      <button class="primary-btn" data-action="switch-view" data-view="new-note">+ Emitir nota</button>
    </section>
    <section class="main-stack">
      ${renderDashboardPeriodFilter(state, emittedCount)}
      ${renderKpis(dashboardNotes)}
      <div class="split-grid">
        ${renderMovementChart(state, 'Faturamento por mes', dashboardNotes)}
        ${renderRecentActivity(state, dashboardNotes)}
      </div>
    </section>
  `;
}

export function renderNotesView(state: AppState): string {
  const filtered = filterNotes(state, state.notas);

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">NFS-e</p>
        <h1>Notas</h1>
        <p>${filtered.length} nota(s) encontrada(s).</p>
      </div>
      <button class="primary-btn" data-action="switch-view" data-view="new-note">+ Emitir nota</button>
    </section>
    ${renderNotesTable(state, filtered.slice().reverse(), true)}
  `;
}

export function renderNewNoteView(state: AppState): string {
  const activeClients = state.clientes.filter((cliente) => cliente.ativo);
  const activeServices = state.servicos.filter((servico) => servico.ativo);
  const serieDps = state.configuracaoFiscal?.serieDpsPadrao || '1';
  const codigoMunicipioPrestacao = state.empresa?.codigoMunicipioIbge || '';

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">NFS-e</p>
        <h1>Emitir nota</h1>
        <p>Preencha os dados da prestacao de servico e emita a NFS-e.</p>
      </div>
    </section>
    <section class="form-panel">
      <form id="note-form" class="form-grid">
        <input type="hidden" name="serieDps" value="${escapeHtml(serieDps)}" />
        <input type="hidden" name="codigoMunicipioPrestacao" value="${escapeHtml(codigoMunicipioPrestacao)}" />
        <div class="form-grid two">
          <div class="field">
            <label for="clienteBusca">Cliente</label>
            <input id="clienteId" name="clienteId" type="hidden" />
            <input
              id="clienteBusca"
              name="clienteBusca"
              list="clientesOptions"
              data-client-search
              autocomplete="off"
              placeholder="Digite nome, CPF ou CNPJ"
              required
            />
            <datalist id="clientesOptions">
              ${activeClients.map((cliente) => `<option value="${escapeHtml(clientOptionLabel(cliente))}"></option>`).join('')}
            </datalist>
            <small class="field-help" data-client-search-status>Digite e escolha um cliente cadastrado.</small>
          </div>
          <div class="field">
            <label for="servicoId">Servico</label>
            <select id="servicoId" name="servicoId" required>
              <option value="">Selecione</option>
              ${activeServices.map((servico) => `<option value="${servico.id}">${escapeHtml(serviceOptionLabel(servico))}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid two">
          <div class="field">
            <label for="valorServico">Valor do servico</label>
            <input id="valorServico" name="valorServico" type="number" min="0.01" step="0.01" required />
          </div>
          <div class="field">
            <label for="dataCompetencia">Data de competencia</label>
            <input id="dataCompetencia" name="dataCompetencia" type="date" value="${todayInputValue()}" required />
          </div>
        </div>
        <div class="field">
          <label for="descricao">Descricao</label>
          <textarea id="descricao" name="descricao" required></textarea>
        </div>
        <button class="primary-btn" type="submit">Emitir nota</button>
      </form>
    </section>
  `;
}

function clientOptionLabel(cliente: AppState['clientes'][number]): string {
  return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
}

function todayInputValue(): string {
  const date = new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 10);
}

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
                    <th>N da Nota</th>
                    <th>Emissao</th>
                    <th>Cliente</th>
                    <th>Servico</th>
                    <th>Valor</th>
                    <th>ISS</th>
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

export function renderMetaBox(label: string, value: string): string {
  return `
    <div class="meta-box">
      <span>${label}</span>
      <strong>${escapeHtml(value || '-')}</strong>
    </div>
  `;
}

function renderNoteRow(state: AppState, nota: NotaServico): string {
  return `
    <tr>
      <td>${escapeHtml(nota.numeroNfse || nota.numeroDps || '-')}</td>
      <td>${formatDate(nota.dataEmissao || nota.dataCompetencia || nota.createdAt)}</td>
      <td>${escapeHtml(clientName(state, nota.clienteId))}</td>
      <td>${escapeHtml(serviceDetails(state, nota.servicoId))}</td>
      <td>${formatCurrency(nota.valorServico)}</td>
      <td>${formatCurrency(nota.valorIss)}</td>
      <td><span class="status ${statusClass(nota.status)}">${statusLabel(nota.status)}</span></td>
      <td>
        ${renderNoteActions(nota)}
      </td>
    </tr>
  `;
}

function renderNoteActions(nota: NotaServico): string {
  const actions = [
    `<button class="action-btn" data-action="show-note" data-id="${nota.id}">Ver</button>`,
  ];

  if (nota.status === 'RASCUNHO') {
    actions.push(`<button class="primary-btn compact" data-action="emit-note" data-id="${nota.id}">Emitir NFS-e</button>`);
  }

  if (nota.status === 'EMITIDA') {
    actions.push(`<button class="action-btn" data-action="replace-nfse" data-id="${nota.id}">Substituir</button>`);
    actions.push(`<button class="danger-btn compact" data-action="cancel-nfse" data-id="${nota.id}">Cancelar</button>`);
  }

  return `<div class="table-actions">${actions.join('')}</div>`;
}

function renderDashboardPeriodFilter(state: AppState, notesCount: number): string {
  const range = getDashboardDateRange(state);

  return `
    <section class="dashboard-filter">
      <div class="period-summary">
        <span>Periodo</span>
        <strong>${formatDateOnly(range.start)} a ${formatDateOnly(range.end)}</strong>
        <small>${formatNumber(notesCount)} nota(s) emitida(s) no periodo</small>
      </div>
      <form id="dashboard-range-form" class="date-range-form">
        <div class="field">
          <label for="dashboardStartDate">De</label>
          <input id="dashboardStartDate" name="dashboardStartDate" type="date" value="${escapeHtml(range.start)}" required />
        </div>
        <div class="field">
          <label for="dashboardEndDate">Ate</label>
          <input id="dashboardEndDate" name="dashboardEndDate" type="date" value="${escapeHtml(range.end)}" required />
        </div>
        <button class="ghost-btn" type="submit">Aplicar</button>
      </form>
    </section>
  `;
}

function formatDateOnly(value: string): string {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

function renderKpis(notas: NotaServico[]): string {
  const emitidas = notas.filter((nota) => nota.status === 'EMITIDA');
  const faturamento = emitidas.reduce((total, nota) => total + Number(nota.valorServico || 0), 0);
  const iss = emitidas.reduce((total, nota) => total + Number(nota.valorIss || 0), 0);
  const cards = [
    { label: 'Notas emitidas', value: formatNumber(emitidas.length), hint: 'no periodo', tone: 'green', symbol: 'NF' },
    { label: 'Faturamento', value: formatCurrency(faturamento), hint: 'notas emitidas', tone: 'amber', symbol: 'R$' },
    { label: 'ISS', value: formatCurrency(iss), hint: 'calculado nas notas', tone: '', symbol: 'IS' },
  ];

  return `
    <div class="kpi-grid">
      ${cards
        .map(
          (card) => `
            <article class="kpi-card">
              <span class="kpi-symbol ${card.tone}">${card.symbol}</span>
              <div>
                <span>${card.label}</span>
                <strong>${card.value}</strong>
                <small>${card.hint}</small>
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderMovementChart(state: AppState, title: string, notas = state.notas): string {
  const movement = getDashboardMovement(state, notas);
  const maxValue = Math.max(...movement.buckets.map((bucket) => bucket.totalValue), 1);

  return `
    <section class="chart-panel">
      <div class="panel-title">
        <h2>${title}</h2>
        <span class="status emitida">Emitidas</span>
      </div>
      <div class="movement-bars" aria-label="${title}">
        ${movement.buckets
          .map((bucket) => {
            const height = bucket.totalValue ? Math.max(12, Math.round((bucket.totalValue / maxValue) * 190)) : 3;
            const titleText = `${bucket.periodLabel}: ${formatCurrency(bucket.totalValue)} em ${bucket.count} nota(s) emitida(s)`;

            return `
              <div class="movement-bar-wrap" data-tooltip="${escapeHtml(titleText)}" aria-label="${escapeHtml(titleText)}" tabindex="0">
                <div class="movement-bar-track">
                  <div class="movement-bar-fill ${bucket.totalValue ? '' : 'empty'}" style="height: ${height}px"></div>
                </div>
                <span class="movement-bar-label">${escapeHtml(bucket.label)}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderRecentActivity(state: AppState, notas = state.notas): string {
  const recent = notas
    .filter((nota) => nota.status === 'EMITIDA')
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return `
    <section class="events-panel">
      <div class="panel-title">
        <h2>Notas emitidas recentes</h2>
        <button class="action-btn" data-action="switch-view" data-view="notes">Ver notas</button>
      </div>
      ${
        recent.length
          ? `<div class="event-list">
              ${recent
                .map(
                  (nota) => `
                    <div class="event-item">
                      <span class="dot ${nota.status === 'ERRO' ? 'red' : nota.status === 'RASCUNHO' ? 'amber' : ''}"></span>
                      <div>
                        <strong>${escapeHtml(statusLabel(nota.status))} - ${escapeHtml(nota.numeroNfse || nota.numeroDps || 'sem numero')}</strong>
                        <span>${escapeHtml(clientName(state, nota.clienteId))} · ${escapeHtml(formatCurrency(nota.valorServico))}</span>
                      </div>
                      <time>${formatDate(nota.updatedAt || nota.createdAt)}</time>
                    </div>
                  `,
                )
                .join('')}
            </div>`
          : '<div class="empty">Nenhuma nota emitida no periodo.</div>'
      }
    </section>
  `;
}
