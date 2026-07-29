import type { ConfiguracaoFiscalEmpresa } from '../types/models';
import type { ApiClient } from './httpClient';

export function updateFiscalConfig(api: ApiClient, body: Record<string, unknown>) {
  return api<ConfiguracaoFiscalEmpresa>('/empresa/configuracao-fiscal', {
    method: 'PUT',
    body,
  });
}

export function configureCertificateA1(api: ApiClient, body: Record<string, unknown>) {
  return api<ConfiguracaoFiscalEmpresa>('/empresa/configuracao-fiscal/certificado-a1', {
    method: 'POST',
    body,
  });
}
