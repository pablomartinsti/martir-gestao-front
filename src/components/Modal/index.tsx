import { useRef, useState, type FormEvent } from 'react';

import type { AppDataState, AppModal } from '../../types/app';
import type { NotaServico } from '../../types/models';
import { formatCurrency, noteFiscalErrorMessage, statusLabel } from '../../utils/formatters';
import { clientName, serviceName } from '../../utils/nfseSelectors';
import { serviceOptionLabel } from '../../utils/serviceLabels';
import { canDownloadDanfse } from '../NoteActions';
import { MetaBox, MetaGrid } from '../MetaBox';
import { Button, Empty, Field, FormGrid, PanelTitle } from '../ui';
import { ActionRow, Backdrop, Body, DetailsStack, Dialog, ErrorMessage, Head, NoteCopy, ResolutionHint } from './styles';

interface ModalProps {
  modal: AppModal;
  state: AppDataState;
  onClose: () => void;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onRetryFailed: (note: NotaServico) => Promise<void>;
  onResolveError: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
  onEditDraft: (note: NotaServico) => void;
  onReplace: (note: NotaServico) => void;
  onCancel: (note: NotaServico) => Promise<void>;
  onSubmitReplacement: (formData: FormData) => Promise<void>;
}

export function Modal({
  modal,
  state,
  onClose,
  onEmit,
  onDeleteDraft,
  onRetryFailed,
  onResolveError,
  onDownloadPdf,
  onEditDraft,
  onReplace,
  onCancel,
  onSubmitReplacement,
}: ModalProps) {
  if (!modal) {
    return null;
  }

  return (
    <Backdrop>
      <Dialog>
        <Head>
          <h2>{modal.title}</h2>
          <Button type="button" $tone="icon" aria-label="Fechar" onClick={onClose}>
            x
          </Button>
        </Head>
        <Body>
          {modal.type === 'replacement' ? (
            <ReplacementForm
              state={state}
              note={modal.note}
              onSubmitReplacement={onSubmitReplacement}
              onClose={onClose}
            />
          ) : (
            <NoteDetails
              state={state}
              note={modal.note}
              onEmit={onEmit}
              onDeleteDraft={onDeleteDraft}
              onRetryFailed={onRetryFailed}
              onResolveError={onResolveError}
              onDownloadPdf={onDownloadPdf}
              onEditDraft={onEditDraft}
              onReplace={onReplace}
              onCancel={onCancel}
            />
          )}
        </Body>
      </Dialog>
    </Backdrop>
  );
}

function NoteDetails({
  state,
  note,
  onEmit,
  onDeleteDraft,
  onRetryFailed,
  onResolveError,
  onDownloadPdf,
  onEditDraft,
  onReplace,
  onCancel,
}: {
  state: AppDataState;
  note: NotaServico;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onRetryFailed: (note: NotaServico) => Promise<void>;
  onResolveError: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
  onEditDraft: (note: NotaServico) => void;
  onReplace: (note: NotaServico) => void;
  onCancel: (note: NotaServico) => Promise<void>;
}) {
  const showFiscalNumber = note.status !== 'RASCUNHO' && note.numeroNfse;

  return (
    <DetailsStack>
      <MetaGrid>
        <MetaBox label="Status" value={statusLabel(note.status)} />
        <MetaBox label="Cliente" value={clientName(state, note.clienteId)} />
        <MetaBox label="Valor do serviço" value={formatCurrency(note.valorServico)} />
        {showFiscalNumber ? <MetaBox label="NFS-e" value={note.numeroNfse || '-'} /> : null}
      </MetaGrid>
      <NoteCopy>
        <small>Serviço</small>
        <strong>{serviceName(state, note.servicoId)}</strong>
        <small>Descrição</small>
        <span>{note.descricao || '-'}</span>
        {note.mensagemErroFiscal || note.mensagemErro ? (
          <ErrorMessage>{noteFiscalErrorMessage(note)}</ErrorMessage>
        ) : null}
      </NoteCopy>
      <PanelTitle>
        <h3>Ações da nota</h3>
      </PanelTitle>
      <ActionRow>
        {note.status === 'RASCUNHO' ? (
          <>
            <Button type="button" $tone="action" onClick={() => onEditDraft(note)}>
              Editar rascunho
            </Button>
            <BusyButton label="Emitir NFS-e" busyLabel="Emitindo..." onClick={() => onEmit(note)} />
            <BusyButton
              label="Excluir rascunho"
              busyLabel="Excluindo..."
              tone="danger"
              onClick={() => onDeleteDraft(note)}
            />
          </>
        ) : null}
        {note.status === 'ERRO' ? (
          <>
            <ResolutionHint>
              Se voce corrigiu o cadastro e ainda nao emitiu outra nota para este servico, tente emitir esta nota. Se ja emitiu outra nota correta, marque este erro como resolvido.
            </ResolutionHint>
            <BusyButton label="Tentar emitir esta nota" busyLabel="Tentando..." onClick={() => onRetryFailed(note)} />
            <BusyButton
              label="Ja emiti outra nota"
              busyLabel="Salvando..."
              tone="ghost"
              onClick={() => onResolveError(note)}
            />
          </>
        ) : null}
        {canDownloadDanfse(note) ? (
          <BusyButton
            label="Baixar PDF"
            busyLabel="Baixando..."
            tone="action"
            onClick={() => onDownloadPdf(note)}
          />
        ) : null}
        {note.status === 'EMITIDA' ? (
          <>
            <Button type="button" $tone="action" onClick={() => onReplace(note)}>
              Substituir
            </Button>
            <BusyButton label="Cancelar" busyLabel="Cancelando..." tone="danger" onClick={() => onCancel(note)} />
          </>
        ) : null}
      </ActionRow>
      {note.status !== 'RASCUNHO' && note.status !== 'ERRO' && !canDownloadDanfse(note) && note.status !== 'EMITIDA' ? (
        <Empty $compact>Nenhuma ação disponível para esta nota.</Empty>
      ) : null}
    </DetailsStack>
  );
}

function ReplacementForm({
  state,
  note,
  onSubmitReplacement,
  onClose,
}: {
  state: AppDataState;
  note: NotaServico;
  onSubmitReplacement: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const activeServices = state.servicos.filter((servico) => servico.ativo);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await onSubmitReplacement(new FormData(event.currentTarget));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <FormGrid onSubmit={handleSubmit}>
      <input type="hidden" name="notaId" value={note.id} />
      <MetaGrid>
        <MetaBox label="Nota original" value={note.numeroNfse || note.numeroDps || '-'} />
        <MetaBox label="Cliente" value={clientName(state, note.clienteId)} />
        <MetaBox label="Valor atual" value={formatCurrency(note.valorServico)} />
      </MetaGrid>
      <ResolutionHint>
        Na substituicao, cliente, competencia e valor permanecem iguais aos da nota original. Para corrigir valor, cancele esta NFS-e e emita uma nova.
      </ResolutionHint>
      <Field>
        Serviço da nota substituta
        <select name="servicoId" defaultValue={note.servicoId} required>
          <option value="">Selecione</option>
          {activeServices.map((servico) => (
            <option key={servico.id} value={servico.id}>
              {serviceOptionLabel(servico)}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        Descrição da nota substituta
        <textarea name="descricao" defaultValue={note.descricao || ''} required />
      </Field>
      <Field>
        Motivo da substituicao
        <textarea name="motivoSubstituicao" minLength={15} defaultValue="Correção de dados da NFS-e emitida" required />
      </Field>
      <ActionRow>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Gerando rascunho...' : 'Gerar rascunho de substituicao'}
        </Button>
        <Button type="button" $tone="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </ActionRow>
    </FormGrid>
  );
}

function BusyButton({
  label,
  busyLabel,
  tone,
  onClick,
}: {
  label: string;
  busyLabel: string;
  tone?: 'primary' | 'ghost' | 'danger' | 'action';
  onClick: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  async function handleClick() {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      await onClick();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Button type="button" $tone={tone} disabled={busy} onClick={() => void handleClick()}>
      {busy ? busyLabel : label}
    </Button>
  );
}
