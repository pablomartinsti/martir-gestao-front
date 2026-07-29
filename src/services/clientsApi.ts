import type { Cliente } from '../types/models';
import type { ApiClient } from './httpClient';

export function createClient(api: ApiClient, body: Record<string, unknown>) {
  return api<Cliente>('/clientes', {
    method: 'POST',
    body,
  });
}

export function updateClient(api: ApiClient, clientId: string, body: Record<string, unknown>) {
  return api<Cliente>(`/clientes/${clientId}`, {
    method: 'PUT',
    body,
  });
}
