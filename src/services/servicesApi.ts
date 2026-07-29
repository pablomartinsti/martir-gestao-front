import type { Servico } from '../types/models';
import type { ApiClient } from './httpClient';

export function createService(api: ApiClient, body: Record<string, unknown>) {
  return api<Servico>('/servicos', {
    method: 'POST',
    body,
  });
}

export function updateServiceStatus(api: ApiClient, serviceId: string, ativo: boolean) {
  return api<Servico>(`/servicos/${serviceId}/status`, {
    method: 'PATCH',
    body: { ativo },
  });
}
