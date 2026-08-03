import type {
  AdminEmpresaOperacionalResumo,
  AdminEventoFiscalResumo,
  AdminNotaResumo,
  AmbienteFiscal,
  StatusEventoFiscal,
  StatusNota,
} from '../types/models';
import type { ApiClient } from './httpClient';

export interface AdminNotesFilters {
  ambienteFiscal?: AmbienteFiscal | '';
  busca?: string;
  criadoAte?: string;
  criadoDe?: string;
  empresaId?: string;
  limite?: number;
  status?: StatusNota | '';
}

export interface AdminEventsFilters {
  busca?: string;
  criadoAte?: string;
  criadoDe?: string;
  empresaId?: string;
  limite?: number;
  notaServicoId?: string;
  status?: StatusEventoFiscal | '';
  tipo?: string;
}

export async function listAdminNotes(api: ApiClient, filters: AdminNotesFilters = {}) {
  return api<AdminNotaResumo[]>(`/admin/notas${buildQuery(filters)}`);
}

export async function listAdminFiscalEvents(api: ApiClient, filters: AdminEventsFilters = {}) {
  return api<AdminEventoFiscalResumo[]>(`/admin/eventos-fiscais${buildQuery(filters)}`);
}

export async function listAdminCompanies(api: ApiClient) {
  return api<AdminEmpresaOperacionalResumo[]>('/admin/empresas');
}

export async function updateAdminCompanyIssuance(
  api: ApiClient,
  empresaId: string,
  emissaoHabilitada: boolean,
) {
  return api<AdminEmpresaOperacionalResumo>(`/admin/empresas/${empresaId}/emissao`, {
    body: { emissaoHabilitada },
    method: 'PATCH',
  });
}

function buildQuery(filters: object): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query ? `?${query}` : '';
}
