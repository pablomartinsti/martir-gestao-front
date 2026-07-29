import './styles.css';
import type { AppState } from '../../app/app-state';
import type { NotaServico } from '../../types/models';
import { escapeHtml } from '../../utils/dom';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  statusLabel,
} from '../../utils/formatters';
import {
  clientName,
  filterNotesByDashboardPeriod,
  getDashboardDateRange,
  getDashboardMovement,
} from '../../utils/nfseSelectors';

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
      <button class="primary-btn" data-action="switch-view" data-view="new-note">+ Nova nota</button>
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
  const cards = [
    {
      label: 'Emitidas',
      value: notas.filter((nota) => nota.status === 'EMITIDA').length,
      hint: 'notas autorizadas',
      tone: 'green',
      symbol: 'EM',
    },
    {
      label: 'Canceladas',
      value: notas.filter((nota) => nota.status === 'CANCELADA').length,
      hint: 'notas canceladas',
      tone: 'gray',
      symbol: 'CA',
    },
    {
      label: 'Substituidas',
      value: notas.filter((nota) => nota.status === 'SUBSTITUIDA').length,
      hint: 'notas substituidas',
      tone: 'amber',
      symbol: 'SU',
    },
    {
      label: 'Erros',
      value: notas.filter((nota) => nota.status === 'ERRO').length,
      hint: 'precisam de atencao',
      tone: 'red',
      symbol: 'ER',
    },
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
                <strong>${formatNumber(card.value)}</strong>
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
                        <span>${escapeHtml(clientName(state, nota.clienteId))} - ${escapeHtml(formatCurrency(nota.valorServico))}</span>
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
