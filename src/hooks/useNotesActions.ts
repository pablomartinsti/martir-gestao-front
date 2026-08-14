import type { Dispatch, SetStateAction } from 'react';

import type { ApiClient } from '../services/httpClient';
import {
  cancelNfse,
  createNote,
  deleteDraftNote,
  downloadDanfsePdf,
  getReadiness,
  markNoteErrorResolved,
  replaceNfse,
  returnNoteToDraft,
  sendDps,
  updateDraftNote,
} from '../services/nfseApi';
import type { AppDataState, AppModal, AppView } from '../types/app';
import type { NotaServico } from '../types/models';
import {
  compactBody,
  dateInputValue,
  parseCurrencyField,
  sanitizeFileName,
  textField,
  triggerFileDownload,
} from '../utils/forms';
import { noteFiscalErrorMessage } from '../utils/formatters';
import { findClientFromSearch, formatFiscalPendencies, messageFromError } from './hookUtils';
import type { ShowToast } from './useToast';

interface UseNotesActionsParams {
  api: ApiClient;
  apiUrl: string;
  data: AppDataState;
  refreshResources: () => Promise<void>;
  setEditingDraftId: Dispatch<SetStateAction<string>>;
  setModal: Dispatch<SetStateAction<AppModal>>;
  setView: Dispatch<SetStateAction<AppView>>;
  showToast: ShowToast;
  token: string;
}

export function useNotesActions({
  api,
  apiUrl,
  data,
  refreshResources,
  setEditingDraftId,
  setModal,
  setView,
  showToast,
  token,
}: UseNotesActionsParams) {
  async function submitNote(formData: FormData) {
    const noteId = textField(formData, 'notaId');
    const clienteId =
      textField(formData, 'clienteId') ||
      findClientFromSearch(data.clientes, textField(formData, 'clienteBusca'))?.id ||
      '';

    if (!clienteId) {
      throw new Error('Escolha um cliente cadastrado na lista antes de gerar a nota.');
    }

    const payload = compactBody({
      clienteId,
      codigoMunicipioPrestacao: textField(formData, 'codigoMunicipioPrestacao'),
      dataCompetencia: textField(formData, 'dataCompetencia'),
      descricao: textField(formData, 'descricao'),
      numeroDps: textField(formData, 'numeroDps'),
      serieDps: textField(formData, 'serieDps'),
      servicoId: textField(formData, 'servicoId'),
      valorServico: parseCurrencyField(formData, 'valorServico'),
    });

    if (noteId) {
      const note = await updateDraftNote(api, noteId, payload);

      await refreshResources();
      setEditingDraftId('');
      setView('notes');
      setModal({
        note,
        title: 'Conferir rascunho atualizado',
        type: 'note',
      });
      showToast('Rascunho atualizado. Confira os dados antes de emitir.', 'success');
      return;
    }

    const note = await createNote(api, payload);

    await refreshResources();
    setView('notes');
    setModal({
      note,
      title: 'Conferir rascunho',
      type: 'note',
    });
    showToast('Rascunho criado. Confira os dados antes de emitir.', 'success');
  }

  async function emitRealNote(note: NotaServico) {
    const ambiente = note.ambienteFiscal === 'HOMOLOGACAO' ? 'homologacao' : 'producao';
    const complemento =
      note.ambienteFiscal === 'HOMOLOGACAO' ? ' Essa nota e apenas teste.' : '';

    if (!window.confirm(`Emitir esta NFS-e em ${ambiente} agora?${complemento}`)) {
      return;
    }

    await mutateNote(
      async () => {
        const readiness = await getReadiness(api, note.id);

        if (!readiness.pronto) {
          throw new Error(`Pendencias fiscais: ${formatFiscalPendencies(readiness.pendencias)}`);
        }

        return sendDpsAndValidate(note.id);
      },
      'NFS-e emitida.',
    );
  }

  async function retryFailedNote(note: NotaServico) {
    const ambiente = note.ambienteFiscal === 'HOMOLOGACAO' ? 'homologacao' : 'producao';
    const complemento =
      note.ambienteFiscal === 'HOMOLOGACAO' ? ' Essa nota e apenas teste.' : '';

    if (!window.confirm(`Tentar emitir esta NFS-e novamente em ${ambiente}?${complemento}`)) {
      return;
    }

    await mutateNote(
      async () => {
        const draft = await returnNoteToDraft(api, note.id);
        const readiness = await getReadiness(api, draft.id);

        if (!readiness.pronto) {
          throw new Error(`Pendencias fiscais: ${formatFiscalPendencies(readiness.pendencias)}`);
        }

        return sendDpsAndValidate(draft.id);
      },
      'NFS-e emitida.',
    );
  }

  async function resolveFailedNote(note: NotaServico) {
    if (
      !window.confirm(
        'Marcar este erro como resolvido? Use somente se voce ja emitiu outra nota correta para este servico.',
      )
    ) {
      return;
    }

    await mutateNote(
      () => markNoteErrorResolved(api, note.id),
      'Erro marcado como resolvido.',
    );
  }

  async function sendDpsAndValidate(noteId: string) {
    const result = await sendDps(api, noteId);

    if (result.status === 'ERRO') {
      throw new Error(noteFiscalErrorMessage(result));
    }

    return result;
  }

  async function cancelRealNote(note: NotaServico) {
    const motivo = window.prompt('Informe o motivo do cancelamento:', 'Erro na emissao da NFS-e');

    if (!motivo) {
      return;
    }

    if (motivo.trim().length < 15) {
      showToast('Motivo do cancelamento precisa ter pelo menos 15 caracteres.', 'error');
      return;
    }

    const ambiente = note.ambienteFiscal === 'HOMOLOGACAO' ? 'homologacao' : 'producao';
    const complemento =
      note.ambienteFiscal === 'HOMOLOGACAO' ? ' Essa nota e apenas teste.' : '';

    if (!window.confirm(`Cancelar esta NFS-e em ${ambiente}?${complemento}`)) {
      return;
    }

    await mutateNote(() => cancelNfse(api, note.id, motivo.trim()), 'Cancelamento enviado.');
  }

  async function deleteDraft(note: NotaServico) {
    if (!window.confirm('Excluir este rascunho? Essa acao nao pode ser desfeita.')) {
      return;
    }

    await mutateNote(() => deleteDraftNote(api, note.id), 'Rascunho excluido.');
  }

  async function downloadNotePdf(note: NotaServico) {
    if (!note.chaveAcesso) {
      throw new Error('Esta nota ainda nao possui chave de acesso para baixar o PDF.');
    }

    const pdf = await downloadDanfsePdf({ apiUrl, token }, note.id);
    triggerFileDownload(pdf, `nfse-${sanitizeFileName(note.numeroNfse || note.numeroDps || note.id)}.pdf`);
    showToast('PDF baixado.', 'success');
  }

  function createReplacementDraft(note: NotaServico) {
    setModal({
      note,
      title: `Substituir NFS-e ${note.numeroNfse || note.numeroDps || ''}`.trim(),
      type: 'replacement',
    });
  }

  function editDraft(note: NotaServico) {
    if (note.status !== 'RASCUNHO') {
      setModal({
        note,
        title: `Nota ${note.numeroNfse || note.numeroDps || note.id}`,
        type: 'note',
      });
      return;
    }

    setEditingDraftId(note.id);
    setModal(null);
    setView('new-note');
  }

  function cancelDraftEdit() {
    setEditingDraftId('');
    setView('notes');
  }

  async function submitReplacement(formData: FormData) {
    const noteId = textField(formData, 'notaId');
    const note = data.notas.find((item) => item.id === noteId);

    if (!note) {
      throw new Error('Nota original nao encontrada.');
    }

    const descricao = textField(formData, 'descricao');
    const servicoId = textField(formData, 'servicoId');
    const motivoSubstituicao = textField(formData, 'motivoSubstituicao');

    if (!servicoId) {
      throw new Error('Escolha o servico da nota substituta.');
    }

    if (!descricao) {
      throw new Error('Informe a descricao da nota substituta.');
    }

    if (motivoSubstituicao.length < 15) {
      throw new Error('Motivo da substituicao precisa ter pelo menos 15 caracteres.');
    }

    const replacement = await replaceNfse(api, noteId, {
      clienteId: note.clienteId,
      codigoMotivoSubstituicao: '99',
      codigoMunicipioPrestacao: note.codigoMunicipioPrestacao,
      dataCompetencia: dateInputValue(note.dataCompetencia || note.dataEmissao || note.createdAt),
      descricao,
      motivoSubstituicao,
      serieDps: note.serieDps,
      servicoId,
      valorServico: note.valorServico,
    });

    await refreshResources();
    setView('notes');
    setModal({
      note: replacement,
      title: 'Conferir rascunho de substituicao',
      type: 'note',
    });
    showToast('Rascunho de substituicao criado. Confira os dados antes de emitir.', 'success');
  }

  async function mutateNote(mutation: () => Promise<unknown>, successMessage: string) {
    try {
      await mutation();
      await refreshResources();
      setModal(null);
      showToast(successMessage, 'success');
    } catch (error) {
      await refreshResources().catch(() => undefined);
      showToast(messageFromError(error), 'error');
    }
  }

  return {
    cancelDraftEdit,
    cancelRealNote,
    createReplacementDraft,
    deleteDraft,
    downloadNotePdf,
    editDraft,
    emitRealNote,
    resolveFailedNote,
    retryFailedNote,
    submitNote,
    submitReplacement,
  };
}
