import { useEffect, useMemo, useRef, useState } from 'react';

import { Layout } from './components/Layout';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
import { DEFAULT_API_URL, STORAGE_KEYS } from './config';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Painel';
import { NotesPage } from './pages/Notas';
import { NewNotePage } from './pages/EmitirNota';
import { ClientsPage } from './pages/Clientes';
import { ServicesPage } from './pages/Servicos';
import { CertificatePage } from './pages/CertificadoDigital';
import { login, loginWithGoogle, onboard } from './services/authApi';
import { createClient, updateClient } from './services/clientsApi';
import { configureCertificateA1, updateFiscalConfig } from './services/companyApi';
import { createApiClient } from './services/httpClient';
import {
  cancelNfse,
  createNote,
  deleteDraftNote,
  downloadDanfsePdf,
  getReadiness,
  replaceNfse,
  sendDps,
} from './services/nfseApi';
import { fetchAppResources, fetchAuthenticatedProfile } from './services/resourcesApi';
import { createService, updateServiceStatus } from './services/servicesApi';
import { GlobalStyle } from './styles/GlobalStyle';
import type { AppDataState, AppModal, AppView, AuthMode, ToastState } from './types/app';
import type { Cliente, NotaServico } from './types/models';
import {
  compactBody,
  dateInputValue,
  fileToBase64,
  normalizeSearchText,
  onlyNumbers,
  parseCurrencyField,
  sanitizeFileName,
  textField,
  triggerFileDownload,
} from './utils/forms';
import { formatDocument } from './utils/formatters';

const initialData: AppDataState = {
  clientes: [],
  configuracaoFiscal: null,
  empresa: null,
  notas: [],
  servicos: [],
  usuario: null,
};

export function App() {
  const apiUrl = DEFAULT_API_URL;
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [view, setView] = useState<AppView>('dashboard');
  const [data, setData] = useState<AppDataState>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dashboardStartDate, setDashboardStartDate] = useState('');
  const [dashboardEndDate, setDashboardEndDate] = useState('');
  const [editingClientId, setEditingClientId] = useState('');
  const [modal, setModal] = useState<AppModal>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeout = useRef<number | null>(null);
  const api = useMemo(() => createApiClient(() => ({ apiUrl, token })), [apiUrl, token]);

  useEffect(() => {
    if (token) {
      void bootAuthenticatedArea(token);
    }
  }, []);

  async function bootAuthenticatedArea(authToken = token) {
    setLoading(true);

    try {
      const authApi = createApiClient(() => ({ apiUrl, token: authToken }));
      const profile = await fetchAuthenticatedProfile(authApi);
      const resources = await fetchAppResources(authApi);

      setData({
        clientes: resources.clientes,
        configuracaoFiscal: resources.configuracaoFiscal,
        empresa: resources.empresa || profile.empresa,
        notas: resources.notas,
        servicos: resources.servicos,
        usuario: profile.usuario,
      });
    } catch (error) {
      clearSession();
      showToast(messageFromError(error) || 'Sessao expirada. Faca login novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function refreshResources(authToken = token) {
    const authApi = createApiClient(() => ({ apiUrl, token: authToken }));
    const resources = await fetchAppResources(authApi);

    setData((current) => ({
      ...current,
      clientes: resources.clientes,
      configuracaoFiscal: resources.configuracaoFiscal,
      empresa: resources.empresa || current.empresa,
      notas: resources.notas,
      servicos: resources.servicos,
    }));
  }

  async function submitLogin(formData: FormData) {
    const result = await login(api, formData.get('email'), formData.get('senha'));

    localStorage.setItem(STORAGE_KEYS.token, result.token);
    setToken(result.token);
    setData((current) => ({ ...current, usuario: result.usuario }));
    await bootAuthenticatedArea(result.token);
    showToast('Login realizado.', 'success');
  }

  async function submitGoogleLogin(credential: string) {
    const result = await loginWithGoogle(api, credential);

    localStorage.setItem(STORAGE_KEYS.token, result.token);
    setToken(result.token);
    setData((current) => ({ ...current, usuario: result.usuario }));
    await bootAuthenticatedArea(result.token);
    showToast('Login com Google realizado.', 'success');
  }

  async function submitOnboarding(formData: FormData) {
    await onboard(api, {
      empresa: compactBody({
        bairro: textField(formData, 'bairro'),
        cep: textField(formData, 'cep'),
        cidade: textField(formData, 'cidade'),
        cnpj: textField(formData, 'cnpj'),
        codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
        email: textField(formData, 'empresaEmail'),
        endereco: textField(formData, 'endereco'),
        inscricaoMunicipal: textField(formData, 'inscricaoMunicipal'),
        nomeFantasia: textField(formData, 'nomeFantasia'),
        numero: textField(formData, 'numero'),
        razaoSocial: textField(formData, 'razaoSocial'),
        regimeEspecialTributacao: 'NENHUM',
        regimeTributario: textField(formData, 'regimeTributario') || 'SIMPLES_NACIONAL',
        telefone: textField(formData, 'telefone'),
        uf: textField(formData, 'uf').toUpperCase(),
      }),
      proprietario: {
        email: formData.get('email'),
        nome: formData.get('nome'),
        senha: formData.get('senha'),
      },
    });

    setAuthMode('login');
    showToast('Cadastro criado. Faca login para continuar.', 'success');
  }

  async function submitNote(formData: FormData) {
    const clienteId = textField(formData, 'clienteId') || findClientFromSearch(textField(formData, 'clienteBusca'))?.id || '';

    if (!clienteId) {
      throw new Error('Escolha um cliente cadastrado na lista antes de gerar a nota.');
    }

    const note = await createNote(
      api,
      compactBody({
        clienteId,
        codigoMunicipioPrestacao: textField(formData, 'codigoMunicipioPrestacao'),
        dataCompetencia: textField(formData, 'dataCompetencia'),
        descricao: textField(formData, 'descricao'),
        serieDps: textField(formData, 'serieDps'),
        servicoId: textField(formData, 'servicoId'),
        valorServico: parseCurrencyField(formData, 'valorServico'),
      }),
    );

    await refreshResources();
    setView('notes');
    setModal({
      note,
      title: 'Conferir rascunho',
      type: 'note',
    });
    showToast('Rascunho criado. Confira os dados antes de emitir.', 'success');
  }

  function submitDashboardRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      showToast('Informe a data inicial e final do periodo.', 'error');
      return;
    }

    if (startDate > endDate) {
      showToast('A data inicial nao pode ser maior que a data final.', 'error');
      return;
    }

    setDashboardStartDate(startDate);
    setDashboardEndDate(endDate);
  }

  async function submitClient(formData: FormData) {
    const document = textField(formData, 'cpfCnpj');
    const documentDigits = onlyNumbers(document);

    if (!editingClientId && documentDigits.length !== 11 && documentDigits.length !== 14) {
      throw new Error('Informe um CPF com 11 digitos ou CNPJ com 14 digitos.');
    }

    const payload = compactBody({
      bairro: textField(formData, 'bairro'),
      cep: textField(formData, 'cep'),
      cidade: textField(formData, 'cidade'),
      codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
      email: textField(formData, 'email'),
      endereco: textField(formData, 'endereco'),
      nomeRazaoSocial: textField(formData, 'nomeRazaoSocial'),
      numero: textField(formData, 'numero'),
      telefone: textField(formData, 'telefone'),
      uf: textField(formData, 'uf').toUpperCase(),
    });

    if (editingClientId) {
      await updateClient(api, editingClientId, payload);
      setEditingClientId('');
      await refreshResources();
      showToast('Cliente atualizado.', 'success');
      return;
    }

    await createClient(api, {
      ...payload,
      cpfCnpj: document,
    });
    await refreshResources();
    showToast('Cliente cadastrado.', 'success');
  }

  async function submitService(formData: FormData) {
    await createService(
      api,
      compactBody({
        aliquotaIss: Number(formData.get('aliquotaIss')),
        codigoServico: textField(formData, 'codigoServico'),
        codigoTributacaoNacional: textField(formData, 'codigoTributacaoNacional'),
        descricao: textField(formData, 'descricao'),
      }),
    );

    await refreshResources();
    showToast('Servico cadastrado.', 'success');
  }

  async function changeServiceStatus(serviceId: string, ativo: boolean) {
    if (!ativo && !window.confirm('Desativar este servico? Ele deixara de aparecer na nova nota.')) {
      return;
    }

    await updateServiceStatus(api, serviceId, ativo);
    await refreshResources();
    showToast(ativo ? 'Servico ativado.' : 'Servico desativado.', 'success');
  }

  async function submitFiscalConfig(formData: FormData) {
    await updateFiscalConfig(api, {
      ambienteFiscalPadrao: data.configuracaoFiscal?.ambienteFiscalPadrao || 'PRODUCAO',
      serieDpsPadrao: data.configuracaoFiscal?.serieDpsPadrao || '1',
    });

    const certificateFile = formData.get('certificadoA1Arquivo');

    if (certificateFile instanceof File && certificateFile.size > 0) {
      const certificatePassword = textField(formData, 'certificadoA1Senha');

      if (!certificatePassword) {
        throw new Error('Informe a senha do certificado A1.');
      }

      await configureCertificateA1(api, {
        certificadoA1Base64: await fileToBase64(certificateFile),
        certificadoA1NomeArquivo: certificateFile.name,
        certificadoA1Senha: certificatePassword,
      });
    }

    await refreshResources();
    showToast('Certificado salvo.', 'success');
  }

  async function removeCertificateA1() {
    if (!data.configuracaoFiscal?.certificadoA1Configurado && !data.configuracaoFiscal?.certificadoA1SenhaConfigurada) {
      showToast('Nao ha certificado configurado para remover.', 'error');
      return;
    }

    if (
      !window.confirm(
        'Remover o certificado A1 salvo? Para emitir novas notas sera necessario enviar outro certificado.',
      )
    ) {
      return;
    }

    await updateFiscalConfig(api, {
      ambienteFiscalPadrao: data.configuracaoFiscal.ambienteFiscalPadrao || 'PRODUCAO',
      removerCertificadoA1: true,
      serieDpsPadrao: data.configuracaoFiscal.serieDpsPadrao || '1',
    });

    await refreshResources();
    showToast('Certificado removido do banco.', 'success');
  }

  async function emitRealNote(note: NotaServico) {
    if (!window.confirm('Emitir esta NFS-e em producao agora?')) {
      return;
    }

    await mutateNote(
      async () => {
        const readiness = await getReadiness(api, note.id);

        if (!readiness.pronto) {
          throw new Error(`Pendencias fiscais: ${formatFiscalPendencies(readiness.pendencias)}`);
        }

        return sendDps(api, note.id);
      },
      'NFS-e enviada para emissao.',
    );
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

    if (!window.confirm('Cancelar esta NFS-e em producao?')) {
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
      valorServico: parseCurrencyField(formData, 'valorServico'),
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
      showToast(messageFromError(error), 'error');
    }
  }

  function navigate(nextView: AppView) {
    setView(nextView);
    setModal(null);
    if (nextView !== 'clients') {
      setEditingClientId('');
    }
  }

  function clearSession() {
    setToken('');
    setData(initialData);
    setModal(null);
    setView('dashboard');
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  function showToast(message: string, type: NonNullable<ToastState>['type'] = '') {
    setToast({ message, type });

    if (toastTimeout.current) {
      window.clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = window.setTimeout(() => {
      setToast(null);
    }, 3600);
  }

  async function safely(operation: () => Promise<void>) {
    try {
      await operation();
    } catch (error) {
      showToast(messageFromError(error), 'error');
    }
  }

  function renderView() {
    switch (view) {
      case 'notes':
        return (
          <NotesPage
            state={data}
            search={search}
            onSearch={setSearch}
            onNavigate={navigate}
            onShowDraft={(note) =>
              setModal({
                note,
                title: note.status === 'RASCUNHO' ? 'Conferir rascunho' : `Nota ${note.numeroNfse || note.numeroDps || note.id}`,
                type: 'note',
              })
            }
            onEmit={(note) => safely(() => emitRealNote(note))}
            onDeleteDraft={(note) => safely(() => deleteDraft(note))}
            onDownloadPdf={(note) => safely(() => downloadNotePdf(note))}
            onReplace={createReplacementDraft}
            onCancel={(note) => safely(() => cancelRealNote(note))}
          />
        );
      case 'new-note':
        return <NewNotePage state={data} onSubmit={(formData) => safely(() => submitNote(formData))} />;
      case 'clients':
        return (
          <ClientsPage
            state={data}
            editingClientId={editingClientId}
            onEditClient={(clientId) => setEditingClientId(clientId)}
            onCancelEdit={() => setEditingClientId('')}
            onSubmit={(formData) => safely(() => submitClient(formData))}
          />
        );
      case 'services':
        return (
          <ServicesPage
            state={data}
            onSubmit={(formData) => safely(() => submitService(formData))}
            onChangeStatus={(serviceId, ativo) => safely(() => changeServiceStatus(serviceId, ativo))}
          />
        );
      case 'company':
        return (
          <CertificatePage
            state={data}
            onSubmit={(formData) => safely(() => submitFiscalConfig(formData))}
            onRemoveCertificate={() => safely(removeCertificateA1)}
          />
        );
      default:
        return (
          <DashboardPage
            state={data}
            dashboardStartDate={dashboardStartDate}
            dashboardEndDate={dashboardEndDate}
            onNavigate={navigate}
            onDashboardRange={submitDashboardRange}
          />
        );
    }
  }

  return (
    <>
      <GlobalStyle />
      {token ? (
        <Layout state={data} view={view} loading={loading} onNavigate={navigate} onLogout={clearSession}>
          {renderView()}
        </Layout>
      ) : (
        <LoginPage
          authMode={authMode}
          onAuthModeChange={setAuthMode}
          onLogin={(formData) => safely(() => submitLogin(formData))}
          onGoogleLogin={(credential) => safely(() => submitGoogleLogin(credential))}
          onOnboard={(formData) => safely(() => submitOnboarding(formData))}
        />
      )}
      <Modal
        modal={modal}
        state={data}
        onClose={() => setModal(null)}
        onEmit={(note) => safely(() => emitRealNote(note))}
        onDeleteDraft={(note) => safely(() => deleteDraft(note))}
        onDownloadPdf={(note) => safely(() => downloadNotePdf(note))}
        onReplace={createReplacementDraft}
        onCancel={(note) => safely(() => cancelRealNote(note))}
        onSubmitReplacement={(formData) => safely(() => submitReplacement(formData))}
      />
      <Toast toast={toast} />
    </>
  );

  function findClientFromSearch(value: string): Cliente | null {
    const term = value.trim();

    if (!term) {
      return null;
    }

    const activeClients = data.clientes.filter((cliente) => cliente.ativo);
    const exact = activeClients.find(
      (cliente) =>
        normalizeSearchText(clientSearchLabel(cliente)) === normalizeSearchText(term) ||
        onlyNumbers(cliente.cpfCnpj) === onlyNumbers(term),
    );

    if (exact) {
      return exact;
    }

    const matches = findClientSearchMatches(activeClients, term);

    return matches.length === 1 ? matches[0] : null;
  }
}

function findClientSearchMatches(clients: Cliente[], value: string): Cliente[] {
  const term = normalizeSearchText(value);
  const documentDigits = onlyNumbers(value);

  if (term.length < 2 && documentDigits.length < 3) {
    return [];
  }

  return clients.filter((cliente) => {
    const label = normalizeSearchText(clientSearchLabel(cliente));
    const document = onlyNumbers(cliente.cpfCnpj);

    return label.includes(term) || Boolean(documentDigits && document.includes(documentDigits));
  });
}

function clientSearchLabel(cliente: Cliente): string {
  return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
}

function formatFiscalPendencies(pendencies: string[]) {
  if (!pendencies.length) {
    return 'revise os dados da nota';
  }

  const labels: Record<string, string> = {
    'producaoReal.certificadoA1Empresa': 'certificado digital A1 da empresa nao configurado',
    'producaoReal.permissao': 'emissao em producao ainda nao liberada na API',
    'producaoReal.regimeTributario': 'regime tributario ainda nao suportado para emissao real',
    'producaoReal.urlSefinProducao': 'URL de producao da prefeitura nao configurada',
    'producaoReal.xsdDps': 'arquivo XSD da DPS nao configurado na API',
    'producaoReal.xsdEvento': 'arquivo XSD de eventos nao configurado na API',
  };

  return pendencies.map((pendency) => labels[pendency] || pendency).join(', ');
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}
