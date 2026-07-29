import type {
  NotaServico,
  ProntidaoFiscal,
} from '../../domain/models';
import type { ApiClient } from '../../shared/api/http-client';

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
