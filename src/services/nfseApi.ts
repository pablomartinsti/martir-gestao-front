import type {
  NotaServico,
  ProntidaoFiscal,
} from '../types/models';
import type { ApiClient } from './httpClient';

export function createNote(api: ApiClient, body: Record<string, unknown>) {
  return api<NotaServico>('/notas-servico', {
    method: 'POST',
    body,
  });
}

export interface ReplaceNoteBody {
  clienteId: string;
  servicoId: string;
  valorServico: number;
  descricao: string;
  serieDps?: string;
  dataCompetencia?: string;
  codigoMunicipioPrestacao?: string;
  codigoMotivoSubstituicao: '99';
  motivoSubstituicao: string;
}

export function sendDps(api: ApiClient, noteId: string) {
  return api<NotaServico>(`/notas-servico/${noteId}/enviar-dps`, {
    method: 'POST',
    body: {},
  });
}

export function deleteDraftNote(api: ApiClient, noteId: string) {
  return api<void>(`/notas-servico/${noteId}`, {
    method: 'DELETE',
  });
}

export async function downloadDanfsePdf(
  context: { apiUrl: string; token: string },
  noteId: string,
): Promise<Blob> {
  const baseUrl = context.apiUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/notas-servico/${noteId}/danfse`, {
    headers: {
      Authorization: `Bearer ${context.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await extractPdfErrorMessage(response));
  }

  return response.blob();
}

export function cancelNfse(api: ApiClient, noteId: string, motivo: string) {
  return api<{ nota: NotaServico }>(`/notas-servico/${noteId}/cancelar-nfse`, {
    method: 'POST',
    body: {
      codigoMotivo: '1',
      motivo,
    },
  });
}

export function replaceNfse(api: ApiClient, noteId: string, body: ReplaceNoteBody) {
  return api<NotaServico>(`/notas-servico/${noteId}/substituir`, {
    method: 'POST',
    body,
  });
}

export function getReadiness(api: ApiClient, noteId: string) {
  return api<ProntidaoFiscal>(`/notas-servico/${noteId}/prontidao-fiscal`);
}

async function extractPdfErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await response.json();

    if (
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) {
      return payload.message;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'erros' in payload &&
      Array.isArray(payload.erros) &&
      payload.erros.length
    ) {
      return String(payload.erros[0]);
    }
  }

  const text = await response.text();

  return text || `Erro ${response.status} ao baixar PDF.`;
}
