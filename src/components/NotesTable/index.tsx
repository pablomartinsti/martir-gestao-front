import { useState, type FormEvent } from 'react';

import type { AppDataState, AppView } from '../../types/app';
import type { NotaServico } from '../../types/models';
import { formatCurrency, formatDate, statusLabel } from '../../utils/formatters';
import { clientName, serviceName } from '../../utils/nfseSelectors';
import { canDownloadDanfse } from '../NoteActions';
import { Button, Empty, Panel, PanelTitle, StatusBadge, Toolbar } from '../ui';
import { Actions, Muted, SearchBox, TableScroll } from './styles';

interface NotesTableProps {
  state: AppDataState;
  notas: NotaServico[];
  search?: string;
  withToolbar?: boolean;
  onSearch?: (search: string) => void;
  onNavigate?: (view: AppView) => void;
  onShowDraft: (note: NotaServico) => void;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onRetryFailed: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
  onReplace: (note: NotaServico) => void;
  onCancel: (note: NotaServico) => Promise<void>;
}

export function NotesTable({
  state,
  notas,
  search = '',
  withToolbar = false,
  onSearch,
  onNavigate,
  onShowDraft,
  onEmit,
  onDeleteDraft,
  onRetryFailed,
  onDownloadPdf,
  onReplace,
  onCancel,
}: NotesTableProps) {
  const [busyAction, setBusyAction] = useState<string | null>(null);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSearch?.(String(formData.get('search') || '').trim());
  }

  async function runAction(label: string, note: NotaServico, action: (note: NotaServico) => Promise<void>) {
    const key = actionKey(label, note);

    if (busyAction) {
      return;
    }

    setBusyAction(key);

    try {
      await action(note);
    } finally {
      setBusyAction(null);
    }
  }

  function isBusy(label: string, note: NotaServico): boolean {
    return busyAction === actionKey(label, note);
  }

  return (
    <Panel>
      <PanelTitle>
        <h2>Notas</h2>
        {!withToolbar && onNavigate ? (
          <Button type="button" $tone="action" onClick={() => onNavigate('notes')}>
            Ver todas
          </Button>
        ) : null}
      </PanelTitle>
      {withToolbar ? (
        <Toolbar as="form" onSubmit={handleSearch}>
          <SearchBox>
            <span>Buscar</span>
            <input name="search" defaultValue={search} placeholder="Número, cliente, serviço ou status" />
          </SearchBox>
          <Button type="submit" $tone="ghost">
            Aplicar
          </Button>
        </Toolbar>
      ) : null}
      {notas.length ? (
        <TableScroll>
          <table>
            <thead>
              <tr>
                <th>NFS-e</th>
                <th>Emissão</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => (
                <tr key={nota.id}>
                  <td>{nota.numeroNfse || '-'}</td>
                  <td>{nota.dataEmissao ? formatDate(nota.dataEmissao) : '-'}</td>
                  <td>{clientName(state, nota.clienteId)}</td>
                  <td>{serviceName(state, nota.servicoId)}</td>
                  <td>{formatCurrency(nota.valorServico)}</td>
                  <td>
                    <StatusBadge $status={nota.status}>{statusLabel(nota.status)}</StatusBadge>
                  </td>
                  <td>
                    <Actions>
                      {nota.status === 'RASCUNHO' ? (
                        <>
                          <Button type="button" $tone="action" onClick={() => onShowDraft(nota)}>
                            Ver
                          </Button>
                          <Button
                            type="button"
                            $compact
                            disabled={Boolean(busyAction)}
                            onClick={() => void runAction('emit', nota, onEmit)}
                          >
                            {isBusy('emit', nota) ? 'Emitindo...' : 'Emitir NFS-e'}
                          </Button>
                          <Button
                            type="button"
                            $tone="danger"
                            $compact
                            disabled={Boolean(busyAction)}
                            onClick={() => void runAction('delete', nota, onDeleteDraft)}
                          >
                            {isBusy('delete', nota) ? 'Excluindo...' : 'Excluir'}
                          </Button>
                        </>
                      ) : null}
                      {nota.status === 'ERRO' ? (
                        <>
                          <Button type="button" $tone="action" onClick={() => onShowDraft(nota)}>
                            Ver erro
                          </Button>
                          <Button
                            type="button"
                            $compact
                            disabled={Boolean(busyAction)}
                            onClick={() => void runAction('retry', nota, onRetryFailed)}
                          >
                            {isBusy('retry', nota) ? 'Tentando...' : 'Tentar novamente'}
                          </Button>
                        </>
                      ) : null}
                      {canDownloadDanfse(nota) ? (
                        <Button
                          type="button"
                          $tone="action"
                          disabled={Boolean(busyAction)}
                          onClick={() => void runAction('pdf', nota, onDownloadPdf)}
                        >
                          {isBusy('pdf', nota) ? 'Baixando...' : 'PDF'}
                        </Button>
                      ) : null}
                      {nota.status === 'EMITIDA' ? (
                        <>
                          <Button type="button" $tone="action" onClick={() => onReplace(nota)}>
                            Substituir
                          </Button>
                          <Button
                            type="button"
                            $tone="danger"
                            $compact
                            disabled={Boolean(busyAction)}
                            onClick={() => void runAction('cancel', nota, onCancel)}
                          >
                            {isBusy('cancel', nota) ? 'Cancelando...' : 'Cancelar'}
                          </Button>
                        </>
                      ) : null}
                      {nota.status !== 'RASCUNHO' && nota.status !== 'ERRO' && !canDownloadDanfse(nota) && nota.status !== 'EMITIDA' ? (
                        <Muted>-</Muted>
                      ) : null}
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      ) : (
        <Empty>Nenhuma nota encontrada.</Empty>
      )}
    </Panel>
  );
}

function actionKey(label: string, note: NotaServico): string {
  return `${label}:${note.id}`;
}
