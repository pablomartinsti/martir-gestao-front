import type { Servico } from '../types/models';
import { formatPercent } from './formatters';

export function shortServiceId(servico: Servico): string {
  return servico.id.slice(0, 8);
}

export function serviceTitle(servico: Servico): string {
  return servico.descricao || 'Servico sem descricao';
}

export function serviceFiscalSummary(servico: Servico): string {
  const parts = [
    `Item ${servico.codigoServico}`,
    servico.codigoTributacaoNacional
      ? `Trib. ${servico.codigoTributacaoNacional}`
      : 'Trib. nacional nao informada',
    servico.codigoTributacaoMunicipal ? `Mun. ${servico.codigoTributacaoMunicipal}` : undefined,
    `ISS ${formatPercent(servico.aliquotaIss)}`,
    servico.codigoNbs ? `NBS ${servico.codigoNbs}` : 'Sem NBS',
    `ID ${shortServiceId(servico)}`,
  ];

  return parts.filter(Boolean).join(' - ');
}

export function serviceOptionLabel(servico: Servico): string {
  return `${serviceTitle(servico)} | ${serviceFiscalSummary(servico)}`;
}
