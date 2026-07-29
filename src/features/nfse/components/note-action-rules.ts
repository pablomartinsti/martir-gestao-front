import type { NotaServico } from '../../../domain/models';

export function canDownloadDanfse(nota: NotaServico): boolean {
  return (
    ['EMITIDA', 'SUBSTITUIDA', 'CANCELADA'].includes(nota.status) &&
    Boolean(nota.chaveAcesso)
  );
}
