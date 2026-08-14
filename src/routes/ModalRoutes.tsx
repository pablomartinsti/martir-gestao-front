import { Modal } from '../components/Modal';
import type { AppState } from '../hooks/useAppState';

interface ModalRoutesProps {
  app: AppState;
}

export function ModalRoutes({ app }: ModalRoutesProps) {
  const { actions } = app;

  return (
    <Modal
      modal={app.modal}
      state={app.data}
      onClose={actions.closeModal}
      onEmit={(note) => actions.safely(() => actions.emitRealNote(note))}
      onDeleteDraft={(note) => actions.safely(() => actions.deleteDraft(note))}
      onRetryFailed={(note) => actions.safely(() => actions.retryFailedNote(note))}
      onResolveError={(note) => actions.safely(() => actions.resolveFailedNote(note))}
      onDownloadPdf={(note) => actions.safely(() => actions.downloadNotePdf(note))}
      onEditDraft={actions.editDraft}
      onReplace={actions.createReplacementDraft}
      onCancel={(note) => actions.safely(() => actions.cancelRealNote(note))}
      onSubmitReplacement={(formData) => actions.safely(() => actions.submitReplacement(formData))}
    />
  );
}
