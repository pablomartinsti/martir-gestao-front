import type { NotaServico } from '../../types/models';

export function canDownloadDanfse(nota: NotaServico): boolean {
  return ['EMITIDA', 'SUBSTITUIDA', 'CANCELADA'].includes(nota.status) && Boolean(nota.chaveAcesso);
}
