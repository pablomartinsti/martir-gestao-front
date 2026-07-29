import type { AppState } from '../../app/app-state';
import type { NotaServico } from '../../domain/models';
import { serviceOptionLabel, serviceTitle } from '../services/service-labels';

export interface DashboardDateRange {
  start: string;
  end: string;
}

export interface DashboardMovementBucket {
  key: string;
  label: string;
  periodLabel: string;
  count: number;
  totalValue: number;
  totalIss: number;
}

export interface DashboardMovement {
  buckets: DashboardMovementBucket[];
  totalNotes: number;
  totalValue: number;
  totalIss: number;
}

export function clientName(state: AppState, id?: string): string {
  return state.clientes.find((cliente) => cliente.id === id)?.nomeRazaoSocial || id || '-';
}

export function serviceName(state: AppState, id?: string): string {
  const servico = state.servicos.find((item) => item.id === id);

  return servico ? serviceTitle(servico) : id || '-';
}

export function serviceDetails(state: AppState, id?: string): string {
  const servico = state.servicos.find((item) => item.id === id);

  return servico ? serviceOptionLabel(servico) : id || '-';
}

export function filterNotes(state: AppState, notas: NotaServico[]): NotaServico[] {
  const term = state.search.toLowerCase();

  if (!term) {
    return notas;
  }

  return notas.filter((nota) => {
    const haystack = [
      nota.numeroNfse,
      nota.numeroDps,
      nota.chaveAcesso,
      nota.status,
      clientName(state, nota.clienteId),
      serviceName(state, nota.servicoId),
      serviceDetails(state, nota.servicoId),
      nota.descricao,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function getSummary(state: AppState, notas = state.notas) {
  return {
    total: notas.length,
    emitidas: notas.filter((nota) => nota.status === 'EMITIDA').length,
    rascunhos: notas.filter((nota) => nota.status === 'RASCUNHO').length,
    erros: notas.filter((nota) => nota.status === 'ERRO').length,
    canceladas: notas.filter((nota) => nota.status === 'CANCELADA').length,
    substituidas: notas.filter((nota) => nota.status === 'SUBSTITUIDA').length,
  };
}

export function getDashboardDateRange(state: AppState): DashboardDateRange {
  if (state.dashboardStartDate && state.dashboardEndDate) {
    return {
      start: state.dashboardStartDate,
      end: state.dashboardEndDate,
    };
  }

  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(end),
  };
}

export function filterNotesByDashboardPeriod(state: AppState): NotaServico[] {
  return filterNotesByDateRange(state.notas, getDashboardDateRange(state));
}

export function filterNotesByDateRange(notas: NotaServico[], range: DashboardDateRange): NotaServico[] {
  const start = parseDateInput(range.start);
  const end = parseDateInput(range.end);

  if (!start || !end) {
    return notas;
  }

  end.setHours(23, 59, 59, 999);

  return notas.filter((nota) => {
    const date = getNoteDate(nota);

    return Boolean(date && date >= start && date <= end);
  });
}

export function getDashboardMovement(state: AppState, notas = state.notas): DashboardMovement {
  const range = getDashboardDateRange(state);
  const start = parseDateInput(range.start);
  const end = parseDateInput(range.end);
  const emittedNotes = notas.filter((nota) => nota.status === 'EMITIDA');

  if (!start || !end) {
    return buildMovement([], emittedNotes);
  }

  const buckets = buildYearMonthlyBuckets(start, end);
  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const nota of emittedNotes) {
    const date = getNoteDate(nota);

    if (!date) {
      continue;
    }

    const key = toMonthKey(date);
    const bucket = bucketByKey.get(key);

    if (bucket) {
      bucket.count += 1;
      bucket.totalValue += Number(nota.valorServico || 0);
      bucket.totalIss += Number(nota.valorIss || 0);
    }
  }

  return buildMovement(buckets, emittedNotes);
}

function buildMovement(
  buckets: DashboardMovementBucket[],
  notas: NotaServico[],
): DashboardMovement {
  return {
    buckets,
    totalNotes: notas.length,
    totalValue: buckets.reduce((total, bucket) => total + bucket.totalValue, 0),
    totalIss: buckets.reduce((total, bucket) => total + bucket.totalIss, 0),
  };
}

function buildYearMonthlyBuckets(start: Date, end: Date): DashboardMovementBucket[] {
  const buckets: DashboardMovementBucket[] = [];
  const cursor = new Date(start.getFullYear(), 0, 1);
  const lastMonth = new Date(end.getFullYear(), 11, 1);

  while (cursor <= lastMonth) {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: start.getFullYear() === end.getFullYear() ? undefined : '2-digit',
    });
    const label = formatter.format(cursor).replace('.', '');

    buckets.push({
      key: toMonthKey(cursor),
      label,
      periodLabel: label,
      count: 0,
      totalValue: 0,
      totalIss: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
}

function getNoteDate(nota: NotaServico): Date | null {
  const date = new Date(nota.dataEmissao || nota.dataCompetencia || nota.createdAt);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function toDateInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 10);
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
