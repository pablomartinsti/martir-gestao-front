import type { AppDataState, AppView } from '../../types/app';
import type { NotaServico } from '../../types/models';
import { formatNumber } from '../../utils/formatters';
import { filterNotes } from '../../utils/nfseSelectors';
import { NotesTable } from '../../components/NotesTable';
import { Button, Eyebrow, SectionHead } from '../../components/ui';

interface NotesPageProps {
  state: AppDataState;
  search: string;
  onSearch: (search: string) => void;
  onNavigate: (view: AppView) => void;
  onShowDraft: (note: NotaServico) => void;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onRetryFailed: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
  onReplace: (note: NotaServico) => void;
  onCancel: (note: NotaServico) => Promise<void>;
}

export function NotesPage({
  state,
  search,
  onSearch,
  onNavigate,
  onShowDraft,
  onEmit,
  onDeleteDraft,
  onRetryFailed,
  onDownloadPdf,
  onReplace,
  onCancel,
}: NotesPageProps) {
  const filtered = filterNotes(state, state.notas, search).slice().reverse();

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>NFS-e</Eyebrow>
          <h1>Notas</h1>
          <p>{formatNumber(filtered.length)} nota(s) encontrada(s).</p>
        </div>
        <Button type="button" onClick={() => onNavigate('new-note')}>
          + Emitir nota
        </Button>
      </SectionHead>
      <NotesTable
        state={state}
        notas={filtered}
        search={search}
        withToolbar
        onSearch={onSearch}
        onShowDraft={onShowDraft}
        onEmit={onEmit}
        onDeleteDraft={onDeleteDraft}
        onRetryFailed={onRetryFailed}
        onDownloadPdf={onDownloadPdf}
        onReplace={onReplace}
        onCancel={onCancel}
      />
    </>
  );
}
