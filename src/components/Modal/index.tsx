import { useState, type FormEvent } from 'react';
import styled from 'styled-components';

import type { AppDataState, AppModal } from '../../types/app';
import type { NotaServico } from '../../types/models';
import { formatCurrency, statusLabel } from '../../utils/formatters';
import { currencyInputValue } from '../../utils/forms';
import { clientName, serviceName } from '../../utils/nfseSelectors';
import { serviceOptionLabel } from '../../utils/serviceLabels';
import { canDownloadDanfse } from '../NoteActions';
import { MetaBox, MetaGrid } from '../MetaBox';
import { Button, Empty, Field, FormGrid, PanelTitle } from '../ui';

interface ModalProps {
  modal: AppModal;
  state: AppDataState;
  onClose: () => void;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
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
  onDownloadPdf,
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
              onDownloadPdf={onDownloadPdf}
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
  onDownloadPdf,
  onReplace,
  onCancel,
}: {
  state: AppDataState;
  note: NotaServico;
  onEmit: (note: NotaServico) => Promise<void>;
  onDeleteDraft: (note: NotaServico) => Promise<void>;
  onDownloadPdf: (note: NotaServico) => Promise<void>;
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
          <ErrorMessage>{note.mensagemErroFiscal || note.mensagemErro}</ErrorMessage>
        ) : null}
      </NoteCopy>
      <PanelTitle>
        <h3>Ações da nota</h3>
      </PanelTitle>
      <ActionRow>
        {note.status === 'RASCUNHO' ? (
          <>
            <BusyButton label="Emitir NFS-e" busyLabel="Emitindo..." onClick={() => onEmit(note)} />
            <BusyButton
              label="Excluir rascunho"
              busyLabel="Excluindo..."
              tone="danger"
              onClick={() => onDeleteDraft(note)}
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
      {note.status !== 'RASCUNHO' && !canDownloadDanfse(note) && note.status !== 'EMITIDA' ? (
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
  const activeServices = state.servicos.filter((servico) => servico.ativo);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmitReplacement(new FormData(event.currentTarget));
    } finally {
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
      <Field>
        Valor da nota substituta
        <input
          name="valorServico"
          inputMode="decimal"
          defaultValue={currencyInputValue(note.valorServico)}
          placeholder="Ex.: 200 ou 200,00"
          required
        />
      </Field>
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

  async function handleClick() {
    setBusy(true);
    try {
      await onClick();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" $tone={tone} disabled={busy} onClick={() => void handleClick()}>
      {busy ? busyLabel : label}
    </Button>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(7, 8, 43, 0.58);
  padding: 20px;
`;

const Dialog = styled.article`
  width: min(980px, 100%);
  max-height: min(92vh, 820px);
  overflow: auto;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
`;

const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  padding: 20px;

  h2 {
    margin: 0;
  }
`;

const Body = styled.div`
  padding: 20px;
`;

const DetailsStack = styled.div`
  display: grid;
  gap: 16px;
`;

const NoteCopy = styled.div`
  display: grid;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-soft);
  padding: 16px;

  small {
    color: var(--ink-500);
    font-weight: 900;
  }
`;

const ErrorMessage = styled.small`
  color: var(--red-600);
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;
