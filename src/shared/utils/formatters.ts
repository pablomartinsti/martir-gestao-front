import type { StatusNota } from '../../domain/models';

export function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(value?: number): string {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(Number(value || 0));
}

export function formatNumber(value?: number): string {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
}

export function formatPercent(value?: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))}%`;
}

export function percent(value: number, total: number, label = 'do total'): string {
  if (!total) {
    return `0% ${label}`;
  }

  return `${formatPercent((value / total) * 100)} ${label}`;
}

export function formatDocument(value?: string): string {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return value || '';
}

export function getInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function statusClass(status?: StatusNota): string {
  return String(status || '').toLowerCase();
}

export function statusLabel(status?: StatusNota): string {
  const labels: Record<StatusNota, string> = {
    CANCELADA: 'Cancelada',
    EMITIDA: 'Emitida',
    ERRO: 'Erro',
    PROCESSANDO: 'Processando',
    RASCUNHO: 'Rascunho',
    SUBSTITUIDA: 'Substituida',
  };

  return status ? labels[status] : '-';
}

export function readableEnum(value?: string): string {
  return String(value || '-')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
