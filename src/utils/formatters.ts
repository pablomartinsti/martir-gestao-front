import type { NotaServico, StatusNota } from '../types/models';

export type CertificateExpirationStatus = 'ok' | 'warning' | 'expired' | 'missing';

export interface CertificateExpirationInfo {
  daysUntilExpiration?: number;
  detail: string;
  label: string;
  status: CertificateExpirationStatus;
}

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

export function formatDateOnly(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = parseDateAsLocalDay(value) || new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getCertificateExpirationInfo(
  configured?: boolean,
  expiresAt?: string,
): CertificateExpirationInfo {
  if (!configured) {
    return {
      detail: 'Envie o certificado A1 para liberar emissoes.',
      label: 'Nao configurado',
      status: 'missing',
    };
  }

  if (!expiresAt) {
    return {
      detail: 'Atualize o certificado para o sistema acompanhar o vencimento.',
      label: 'Validade nao informada',
      status: 'warning',
    };
  }

  const expirationDate = parseDateAsLocalDay(expiresAt);
  if (!expirationDate) {
    return {
      detail: 'A data salva nao pode ser lida pelo sistema.',
      label: 'Validade nao informada',
      status: 'warning',
    };
  }

  const today = startOfLocalDay(new Date());
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / 86_400_000);
  const formattedDate = formatDateOnly(expiresAt);

  if (daysUntilExpiration < 0) {
    return {
      daysUntilExpiration,
      detail: `Venceu em ${formattedDate}`,
      label: 'Certificado vencido',
      status: 'expired',
    };
  }

  if (daysUntilExpiration === 0) {
    return {
      daysUntilExpiration,
      detail: `Vence em ${formattedDate}`,
      label: 'Vence hoje',
      status: 'warning',
    };
  }

  if (daysUntilExpiration <= 30) {
    return {
      daysUntilExpiration,
      detail: `Vence em ${formattedDate}`,
      label: `Vence em ${daysUntilExpiration} dia${daysUntilExpiration === 1 ? '' : 's'}`,
      status: 'warning',
    };
  }

  return {
    daysUntilExpiration,
    detail: `Vence em ${formattedDate}`,
    label: 'Certificado valido',
    status: 'ok',
  };
}

export function certificateStatusBadge(status: CertificateExpirationStatus): StatusNota {
  if (status === 'ok') return 'EMITIDA';
  if (status === 'expired' || status === 'missing') return 'ERRO';
  return 'RASCUNHO';
}

function parseDateAsLocalDay(value: string): Date | null {
  const datePrefix = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (datePrefix) {
    const [, year, month, day] = datePrefix;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return startOfLocalDay(date);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
    RASCUNHO: 'Pendente',
    SUBSTITUIDA: 'Substituida',
  };

  return status ? labels[status] : '-';
}

const TEMPORARY_PORTAL_ERROR_MESSAGE =
  'Portal Nacional da NFS-e indisponivel no momento. Tente novamente em alguns minutos.';

export function noteFiscalErrorMessage(
  nota: Pick<NotaServico, 'mensagemErro' | 'mensagemErroFiscal'>,
): string {
  const message = (nota.mensagemErroFiscal || nota.mensagemErro || '').trim();

  if (isTemporaryPortalErrorMessage(message)) {
    return TEMPORARY_PORTAL_ERROR_MESSAGE;
  }

  return message || 'Nao foi possivel emitir esta nota.';
}

export function isTemporaryPortalError(
  nota: Pick<NotaServico, 'mensagemErro' | 'mensagemErroFiscal'>,
): boolean {
  return isTemporaryPortalErrorMessage(nota.mensagemErroFiscal || nota.mensagemErro);
}

function isTemporaryPortalErrorMessage(value?: string): boolean {
  const message = String(value || '').toLowerCase();

  return (
    message.includes('http 503') ||
    message.includes('service unavailable') ||
    message.includes('tempo limite excedido') ||
    message.includes('timeout') ||
    (message.includes('portal nacional') && message.includes('indispon'))
  );
}

export function readableEnum(value?: string): string {
  return String(value || '-')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
