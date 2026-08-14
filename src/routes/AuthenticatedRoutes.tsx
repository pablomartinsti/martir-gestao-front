import { Layout } from '../components/Layout';
import type { AppState } from '../hooks/useAppState';
import { ClientsPage } from '../pages/Clientes';
import { CertificatePage } from '../pages/CertificadoDigital';
import { NewNotePage } from '../pages/EmitirNota';
import { NotesPage } from '../pages/Notas';
import { OperationalPage } from '../pages/Operacional';
import { ServicesPage } from '../pages/Servicos';
import { DashboardRoute } from './DashboardRoute';

interface AuthenticatedRoutesProps {
  app: AppState;
}

export function AuthenticatedRoutes({ app }: AuthenticatedRoutesProps) {
  return (
    <Layout
      state={app.data}
      view={app.view}
      loading={app.loading}
      onNavigate={app.actions.navigate}
      onLogout={app.actions.clearSession}
    >
      <ActivePage app={app} />
    </Layout>
  );
}

function ActivePage({ app }: AuthenticatedRoutesProps) {
  const { actions } = app;

  switch (app.view) {
    case 'notes':
      return (
        <NotesPage
          state={app.data}
          search={app.search}
          onSearch={actions.setSearch}
          onNavigate={actions.navigate}
          onShowDraft={actions.editDraft}
          onEmit={(note) => actions.safely(() => actions.emitRealNote(note))}
          onDeleteDraft={(note) => actions.safely(() => actions.deleteDraft(note))}
          onDownloadPdf={(note) => actions.safely(() => actions.downloadNotePdf(note))}
          onReplace={actions.createReplacementDraft}
          onCancel={(note) => actions.safely(() => actions.cancelRealNote(note))}
        />
      );
    case 'new-note':
      return (
        <NewNotePage
          state={app.data}
          draft={app.editingDraft}
          onCancelEdit={actions.cancelDraftEdit}
          onSubmit={(formData) => actions.safely(() => actions.submitNote(formData))}
        />
      );
    case 'clients':
      return (
        <ClientsPage
          state={app.data}
          editingClientId={app.editingClientId}
          onEditClient={actions.setEditingClientId}
          onCancelEdit={() => actions.setEditingClientId('')}
          onSubmit={(formData) => actions.safely(() => actions.submitClient(formData))}
        />
      );
    case 'services':
      return (
        <ServicesPage
          state={app.data}
          onSubmit={(formData) => actions.safely(() => actions.submitService(formData))}
          onChangeStatus={(serviceId, ativo) =>
            actions.safely(() => actions.changeServiceStatus(serviceId, ativo))
          }
        />
      );
    case 'company':
      return (
        <CertificatePage
          state={app.data}
          onSubmit={(formData) => actions.safely(() => actions.submitFiscalConfig(formData))}
          onRemoveCertificate={() => actions.safely(actions.removeCertificateA1)}
        />
      );
    case 'operational-admin':
      return app.data.usuario?.perfil === 'ADMIN_SISTEMA' ? (
        <OperationalPage api={app.api} />
      ) : (
        <DashboardRoute app={app} />
      );
    default:
      return <DashboardRoute app={app} />;
  }
}
