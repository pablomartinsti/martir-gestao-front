import { login, loginWithGoogle, onboard } from '../features/auth/auth-api';
import { renderAuth } from '../features/auth/auth-view';
import type { Cliente } from '../domain/models';
import { fetchAddressByCep } from '../features/clients/cep-api';
import { fetchCompanyByCnpj } from '../features/clients/cnpj-api';
import { createClient, updateClient } from '../features/clients/clients-api';
import { renderClientsView } from '../features/clients/clients-view';
import { configureCertificateA1, updateFiscalConfig } from '../features/company/company-api';
import { renderCompanyView } from '../features/company/company-view';
import { renderAppShell } from '../features/layout/layout-view';
import {
  cancelNfse,
  createNote,
  getReadiness,
  replaceNfse,
  sendDps,
} from '../features/nfse/nfse-api';
import {
  renderDashboardView,
  renderNewNoteView,
  renderNotesView,
} from '../features/nfse/nfse-view';
import { createService, updateServiceStatus } from '../features/services/services-api';
import { renderServicesView } from '../features/services/services-view';
import { renderModal } from '../features/shared/modal-view';
import { renderToast } from '../features/shared/toast-view';
import { DEFAULT_API_URL, GOOGLE_CLIENT_ID, STORAGE_KEYS } from '../shared/config';
import { createApiClient } from '../shared/api/http-client';
import { compactBody } from '../shared/utils/dom';
import { formatDocument } from '../shared/utils/formatters';
import { createInitialState, type AppView, type ToastState } from './app-state';
import { loadAuthenticatedProfile, loadResources } from './resource-loader';

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

export function createMartirApp(root: HTMLDivElement) {
  const state = createInitialState();
  const api = createApiClient(() => ({
    apiUrl: state.apiUrl,
    token: state.token,
  }));
  let toastTimeout = 0;

  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!button) {
      return;
    }

    event.preventDefault();
    void handleAction(button);
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleSubmit(event.target as HTMLFormElement);
  });

  root.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;

    if (
      input instanceof HTMLInputElement &&
      input.dataset.clientSearch !== undefined &&
      input.form?.id === 'note-form'
    ) {
      syncNoteClientSearch(input.form, input.value);
    }
  });

  root.addEventListener('focusout', (event) => {
    const input = event.target as HTMLInputElement;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (input.form?.id === 'onboarding-form') {
      if (input.name === 'cep') {
        void fillCompanyAddressFromCep(input.form, input.value);
        return;
      }

      if (input.name === 'cnpj') {
        void fillCompanyFromCnpj(input.form);
      }
      return;
    }

    if (input.form?.id === 'client-form') {
      if (input.name === 'cep') {
        void fillClientAddressFromCep(input.form, input.value);
        return;
      }

      if (input.name === 'cpfCnpj') {
        void fillClientFromCnpj(input.form);
      }
    }
  });

  async function init() {
    if (!state.token) {
      render();
      return;
    }

    await bootAuthenticatedArea();
  }

  async function bootAuthenticatedArea() {
    state.loading = true;
    render();

    try {
      await loadAuthenticatedProfile(api, state);
      await loadResources(api, state);
    } catch (error) {
      clearSession();
      showToast(messageFromError(error) || 'Sessao expirada. Faca login novamente.', 'error');
    } finally {
      state.loading = false;
      render();
    }
  }

  function render() {
    if (!state.token) {
      root.innerHTML = `${renderAuth(state)}${renderToast(state)}`;
      window.setTimeout(mountGoogleLogin, 0);
      return;
    }

    root.innerHTML = `${renderAppShell(state, renderView())}${renderModal(state)}${renderToast(state)}`;
  }

  function renderView(): string {
    switch (state.view) {
      case 'notes':
        return renderNotesView(state);
      case 'new-note':
        return renderNewNoteView(state);
      case 'clients':
        return renderClientsView(state);
      case 'services':
        return renderServicesView(state);
      case 'company':
        return renderCompanyView(state);
      default:
        return renderDashboardView(state);
    }
  }

  async function handleAction(button: HTMLButtonElement) {
    const action = button.dataset.action;

    if (action === 'auth-mode') {
      state.authMode = button.dataset.mode === 'onboarding' ? 'onboarding' : 'login';
      render();
      return;
    }

    if (action === 'switch-view' || action === 'open-module') {
      state.view = (button.dataset.view || 'dashboard') as AppView;
      state.modal = null;
      if (state.view !== 'clients') {
        state.editingClientId = '';
      }
      render();
      return;
    }

    if (action === 'future-module') {
      showToast('Modulo preparado para uma proxima etapa.', 'success');
      return;
    }

    if (action === 'logout') {
      clearSession();
      render();
      return;
    }

    if (action === 'refresh') {
      await bootAuthenticatedArea();
      showToast('Dados atualizados.', 'success');
      return;
    }

    if (action === 'toggle-password') {
      togglePasswordVisibility(button);
      return;
    }

    if (action === 'remove-certificate-a1') {
      await removeCertificateA1();
      return;
    }

    if (action === 'close-modal') {
      state.modal = null;
      render();
      return;
    }

    if (action === 'service-status') {
      await changeServiceStatus(button);
      return;
    }

    if (action === 'client-fetch-cnpj') {
      const form = button.closest<HTMLFormElement>('form');

      if (form) {
        await fillClientFromCnpj(form, true);
      }
      return;
    }

    if (action === 'client-edit') {
      state.editingClientId = button.dataset.id || '';
      state.view = 'clients';
      render();
      return;
    }

    if (action === 'client-cancel-edit') {
      state.editingClientId = '';
      render();
      return;
    }

    const noteId = button.dataset.id;
    if (!noteId) {
      return;
    }

    if (action === 'show-note') {
      const note = state.notas.find((item) => item.id === noteId);
      if (note) {
        state.modal = {
          type: 'note',
          title: `Nota ${note.numeroNfse || note.numeroDps || note.id}`,
          data: note,
        };
        render();
      }
      return;
    }

    if (action === 'emit-note') {
      await emitRealNote(noteId);
      return;
    }

    if (action === 'cancel-nfse') {
      await cancelRealNote(noteId);
      return;
    }

    if (action === 'replace-nfse') {
      await createReplacementDraft(noteId);
      return;
    }
  }

  async function handleSubmit(form: HTMLFormElement) {
    const formData = new FormData(form);

    try {
      if (form.id === 'login-form') {
        await submitLogin(formData);
        return;
      }

      if (form.id === 'onboarding-form') {
        await submitOnboarding(formData);
        return;
      }

      if (form.id === 'search-form') {
        state.search = String(formData.get('search') || '').trim();
        render();
        return;
      }

      if (form.id === 'dashboard-range-form') {
        submitDashboardRange(formData);
        return;
      }

      if (form.id === 'note-form') {
        await submitNote(formData);
        return;
      }

      if (form.id === 'client-form') {
        await submitClient(formData);
        return;
      }

      if (form.id === 'service-form') {
        await submitService(formData);
        return;
      }

      if (form.id === 'fiscal-config-form') {
        await submitFiscalConfig(formData);
      }
    } catch (error) {
      showToast(messageFromError(error) || 'Nao foi possivel concluir a operacao.', 'error');
    }
  }

  async function submitLogin(formData: FormData) {
    state.apiUrl = DEFAULT_API_URL;
    localStorage.removeItem(STORAGE_KEYS.apiUrl);

    const result = await login(api, formData.get('email'), formData.get('senha'));

    state.token = result.token;
    state.usuario = result.usuario;
    localStorage.setItem(STORAGE_KEYS.token, result.token);

    await bootAuthenticatedArea();
    showToast('Login realizado.', 'success');
  }

  async function submitGoogleLogin(credential: string) {
    try {
      state.apiUrl = DEFAULT_API_URL;
      localStorage.removeItem(STORAGE_KEYS.apiUrl);

      const result = await loginWithGoogle(api, credential);

      state.token = result.token;
      state.usuario = result.usuario;
      localStorage.setItem(STORAGE_KEYS.token, result.token);

      await bootAuthenticatedArea();
      showToast('Login com Google realizado.', 'success');
    } catch (error) {
      showToast(messageFromError(error) || 'Nao foi possivel entrar com Google.', 'error');
    }
  }

  async function submitOnboarding(formData: FormData) {
    state.apiUrl = DEFAULT_API_URL;
    localStorage.removeItem(STORAGE_KEYS.apiUrl);

    await onboard(api, {
      empresa: compactBody({
        razaoSocial: textField(formData, 'razaoSocial'),
        nomeFantasia: textField(formData, 'nomeFantasia'),
        cnpj: textField(formData, 'cnpj'),
        inscricaoMunicipal: textField(formData, 'inscricaoMunicipal'),
        regimeTributario: textField(formData, 'regimeTributario') || 'SIMPLES_NACIONAL',
        regimeEspecialTributacao: 'NENHUM',
        email: textField(formData, 'empresaEmail'),
        telefone: textField(formData, 'telefone'),
        cep: textField(formData, 'cep'),
        endereco: textField(formData, 'endereco'),
        numero: textField(formData, 'numero'),
        bairro: textField(formData, 'bairro'),
        cidade: textField(formData, 'cidade'),
        uf: textField(formData, 'uf').toUpperCase(),
        codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
      }),
      proprietario: {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
      },
    });

    state.authMode = 'login';
    render();
    showToast('Cadastro criado. Faca login para continuar.', 'success');
  }

  async function submitNote(formData: FormData) {
    const clienteId =
      textField(formData, 'clienteId') ||
      findClientFromSearch(textField(formData, 'clienteBusca'))?.id ||
      '';

    if (!clienteId) {
      throw new Error('Escolha um cliente cadastrado na lista antes de emitir a nota.');
    }

    const note = await createNote(
      api,
      compactBody({
        clienteId,
        servicoId: formData.get('servicoId'),
        valorServico: parseCurrencyField(formData, 'valorServico'),
        descricao: formData.get('descricao'),
        serieDps: formData.get('serieDps'),
        dataCompetencia: formData.get('dataCompetencia'),
        codigoMunicipioPrestacao: formData.get('codigoMunicipioPrestacao'),
      }),
    );

    await emitCreatedNote(note.id);
  }

  async function emitCreatedNote(noteId: string) {
    try {
      const readiness = await getReadiness(api, noteId);

      if (!readiness.pronto) {
        throw new Error(
          `Pendencias fiscais: ${readiness.pendencias.join(', ') || 'revise a nota'}`,
        );
      }

      await sendDps(api, noteId);
      await loadResources(api, state);
      state.view = 'dashboard';
      render();
      showToast('Nota enviada para emissao.', 'success');
    } catch (error) {
      await loadResources(api, state);
      state.view = 'notes';
      render();
      throw new Error(`A nota foi criada, mas nao foi emitida. ${messageFromError(error)}`);
    }
  }

  function submitDashboardRange(formData: FormData) {
    const startDate = textField(formData, 'dashboardStartDate');
    const endDate = textField(formData, 'dashboardEndDate');

    if (!startDate || !endDate) {
      throw new Error('Informe a data inicial e final do periodo.');
    }

    if (startDate > endDate) {
      throw new Error('A data inicial nao pode ser maior que a data final.');
    }

    state.dashboardStartDate = startDate;
    state.dashboardEndDate = endDate;
    render();
  }

  function syncNoteClientSearch(form: HTMLFormElement, value: string) {
    const cliente = findClientFromSearch(value);
    const idInput = form.elements.namedItem('clienteId');

    if (idInput instanceof HTMLInputElement) {
      idInput.value = cliente?.id || '';
    }

    const status = form.querySelector<HTMLElement>('[data-client-search-status]');
    if (!status) {
      return;
    }

    const term = value.trim();
    const matches = findClientSearchMatches(term);

    if (!term) {
      status.textContent = 'Digite e escolha um cliente cadastrado.';
      status.dataset.status = '';
      return;
    }

    if (cliente) {
      status.textContent = `Cliente selecionado: ${formatDocument(cliente.cpfCnpj)}`;
      status.dataset.status = 'success';
      return;
    }

    if (matches.length > 1) {
      status.textContent = `${matches.length} clientes encontrados. Escolha uma opcao da lista.`;
      status.dataset.status = '';
      return;
    }

    status.textContent = 'Nenhum cliente encontrado.';
    status.dataset.status = 'error';
  }

  async function submitClient(formData: FormData) {
    const document = textField(formData, 'cpfCnpj');
    const documentDigits = onlyNumbers(document);

    if (!state.editingClientId && documentDigits.length !== 11 && documentDigits.length !== 14) {
      throw new Error('Informe um CPF com 11 digitos ou CNPJ com 14 digitos.');
    }

    const payload = compactBody({
      nomeRazaoSocial: textField(formData, 'nomeRazaoSocial'),
      cidade: textField(formData, 'cidade'),
      uf: textField(formData, 'uf').toUpperCase(),
      email: textField(formData, 'email'),
      telefone: textField(formData, 'telefone'),
      cep: textField(formData, 'cep'),
      endereco: textField(formData, 'endereco'),
      numero: textField(formData, 'numero'),
      bairro: textField(formData, 'bairro'),
      codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
    }) as Record<string, unknown>;

    if (state.editingClientId) {
      await updateClient(api, state.editingClientId, payload);
      state.editingClientId = '';
      await loadResources(api, state);
      render();
      showToast('Cliente atualizado.', 'success');
      return;
    }

    await createClient(api, {
      ...payload,
      cpfCnpj: document,
    });

    await loadResources(api, state);
    render();
    showToast('Cliente cadastrado.', 'success');
  }

  async function fillClientFromCnpj(form: HTMLFormElement, force = false) {
    const document = getClientField(form, 'cpfCnpj');
    const digits = document.replace(/\D/g, '');

    if (!digits) {
      setClientLookupStatus(form, 'cnpj', '', '');
      return;
    }

    if (digits.length === 11) {
      setClientLookupStatus(
        form,
        'cnpj',
        'CPF aceito. Preencha os dados manualmente.',
        'success',
      );
      return;
    }

    if (digits.length !== 14) {
      if (force || digits.length > 11) {
        setClientLookupStatus(
          form,
          'cnpj',
          'Informe CPF com 11 digitos ou CNPJ com 14 digitos.',
          'error',
        );
      }
      return;
    }

    setClientLookupStatus(form, 'cnpj', 'Buscando CNPJ...', '');

    try {
      const company = await fetchCompanyByCnpj(digits);

      setClientField(form, 'cpfCnpj', company.cnpj);
      setClientField(form, 'nomeRazaoSocial', company.nomeRazaoSocial);
      setClientField(form, 'email', company.email);
      setClientField(form, 'telefone', company.telefone);
      setClientField(form, 'cep', company.cep);
      setClientField(form, 'endereco', company.endereco);
      setClientField(form, 'numero', company.numero);
      setClientField(form, 'bairro', company.bairro);
      setClientField(form, 'cidade', company.cidade);
      setClientField(form, 'uf', company.uf);
      setClientLookupStatus(form, 'cnpj', 'Dados preenchidos pelo CNPJ.', 'success');

      if (company.cep) {
        await fillClientAddressFromCep(form, company.cep);
      }
    } catch (error) {
      setClientLookupStatus(form, 'cnpj', messageFromError(error), 'error');
    }
  }

  async function fillCompanyFromCnpj(form: HTMLFormElement) {
    const cnpj = getClientField(form, 'cnpj');
    const digits = cnpj.replace(/\D/g, '');

    if (!digits) {
      setCompanyLookupStatus(form, 'cnpj', '', '');
      return;
    }

    if (digits.length !== 14) {
      setCompanyLookupStatus(form, 'cnpj', 'CNPJ precisa ter 14 digitos.', 'error');
      return;
    }

    setCompanyLookupStatus(form, 'cnpj', 'Buscando CNPJ...', '');

    try {
      const company = await fetchCompanyByCnpj(digits);

      setClientField(form, 'cnpj', company.cnpj);
      setClientField(form, 'razaoSocial', company.nomeRazaoSocial);
      setClientField(form, 'empresaEmail', company.email);
      setClientField(form, 'telefone', company.telefone);
      setClientField(form, 'cep', company.cep);
      setClientField(form, 'endereco', company.endereco);
      setClientField(form, 'numero', company.numero);
      setClientField(form, 'bairro', company.bairro);
      setClientField(form, 'cidade', company.cidade);
      setClientField(form, 'uf', company.uf);
      setCompanyLookupStatus(form, 'cnpj', 'Dados preenchidos pelo CNPJ.', 'success');

      if (company.cep) {
        await fillCompanyAddressFromCep(form, company.cep);
      }
    } catch (error) {
      setCompanyLookupStatus(form, 'cnpj', messageFromError(error), 'error');
    }
  }

  async function fillClientAddressFromCep(form: HTMLFormElement, cep: string) {
    const digits = cep.replace(/\D/g, '');

    if (!digits) {
      setClientLookupStatus(form, 'cep', '', '');
      return;
    }

    if (digits.length !== 8) {
      setClientLookupStatus(form, 'cep', 'CEP precisa ter 8 digitos.', 'error');
      return;
    }

    setClientLookupStatus(form, 'cep', 'Buscando CEP...', '');

    try {
      const address = await fetchAddressByCep(digits);

      if (!address) {
        setClientLookupStatus(form, 'cep', 'CEP nao encontrado.', 'error');
        return;
      }

      setClientField(form, 'cep', address.cep);
      setClientField(form, 'endereco', address.endereco);
      setClientField(form, 'bairro', address.bairro);
      setClientField(form, 'cidade', address.cidade);
      setClientField(form, 'uf', address.uf);
      setClientField(form, 'codigoMunicipioIbge', address.codigoMunicipioIbge);
      setClientLookupStatus(form, 'cep', 'Endereco preenchido pelo CEP.', 'success');
    } catch (error) {
      setClientLookupStatus(form, 'cep', messageFromError(error), 'error');
    }
  }

  async function fillCompanyAddressFromCep(form: HTMLFormElement, cep: string) {
    const digits = cep.replace(/\D/g, '');

    if (!digits) {
      setCompanyLookupStatus(form, 'cep', '', '');
      return;
    }

    if (digits.length !== 8) {
      setCompanyLookupStatus(form, 'cep', 'CEP precisa ter 8 digitos.', 'error');
      return;
    }

    setCompanyLookupStatus(form, 'cep', 'Buscando CEP...', '');

    try {
      const address = await fetchAddressByCep(digits);

      if (!address) {
        setCompanyLookupStatus(form, 'cep', 'CEP nao encontrado.', 'error');
        return;
      }

      setClientField(form, 'cep', address.cep);
      setClientField(form, 'endereco', address.endereco);
      setClientField(form, 'bairro', address.bairro);
      setClientField(form, 'cidade', address.cidade);
      setClientField(form, 'uf', address.uf);
      setClientField(form, 'codigoMunicipioIbge', address.codigoMunicipioIbge);
      setCompanyLookupStatus(form, 'cep', 'Endereco preenchido pelo CEP.', 'success');
    } catch (error) {
      setCompanyLookupStatus(form, 'cep', messageFromError(error), 'error');
    }
  }

  async function submitService(formData: FormData) {
    await createService(
      api,
      compactBody({
        descricao: formData.get('descricao'),
        codigoServico: formData.get('codigoServico'),
        aliquotaIss: Number(formData.get('aliquotaIss')),
        codigoTributacaoNacional: formData.get('codigoTributacaoNacional'),
      }),
    );

    await loadResources(api, state);
    render();
    showToast('Servico cadastrado.', 'success');
  }

  async function changeServiceStatus(button: HTMLButtonElement) {
    const serviceId = button.dataset.id;
    const ativo = button.dataset.active === 'true';

    if (!serviceId) {
      return;
    }

    if (!ativo && !confirm('Desativar este servico? Ele deixara de aparecer na nova nota.')) {
      return;
    }

    await updateServiceStatus(api, serviceId, ativo);
    await loadResources(api, state);
    render();
    showToast(ativo ? 'Servico ativado.' : 'Servico desativado.', 'success');
  }

  async function submitFiscalConfig(formData: FormData) {
    await updateFiscalConfig(api, {
      ambienteFiscalPadrao:
        state.configuracaoFiscal?.ambienteFiscalPadrao || 'HOMOLOGACAO',
      serieDpsPadrao: state.configuracaoFiscal?.serieDpsPadrao || '1',
    });

    const certificateFile = formData.get('certificadoA1Arquivo');

    if (certificateFile instanceof File && certificateFile.size > 0) {
      const certificatePassword = textField(formData, 'certificadoA1Senha');

      if (!certificatePassword) {
        throw new Error('Informe a senha do certificado A1.');
      }

      await configureCertificateA1(api, {
        certificadoA1NomeArquivo: certificateFile.name,
        certificadoA1Base64: await fileToBase64(certificateFile),
        certificadoA1Senha: certificatePassword,
      });
    }

    await loadResources(api, state);
    render();
    showToast('Configuracao fiscal atualizada.', 'success');
  }

  async function removeCertificateA1() {
    if (!state.configuracaoFiscal?.certificadoA1Configurado) {
      showToast('Nao ha certificado configurado para remover.', 'error');
      return;
    }

    if (
      !confirm(
        'Remover o certificado A1 salvo? Para emitir novas notas sera necessario enviar outro certificado.',
      )
    ) {
      return;
    }

    await updateFiscalConfig(api, {
      ambienteFiscalPadrao:
        state.configuracaoFiscal.ambienteFiscalPadrao || 'HOMOLOGACAO',
      serieDpsPadrao: state.configuracaoFiscal.serieDpsPadrao || '1',
      removerCertificadoA1: true,
    });

    await loadResources(api, state);
    render();
    showToast('Certificado removido do banco.', 'success');
  }

  async function emitRealNote(noteId: string) {
    const note = state.notas.find((item) => item.id === noteId);

    if (!note) {
      return;
    }

    if (!confirm('Emitir esta NFS-e em producao agora?')) {
      return;
    }

    await mutateNote(
      noteId,
      async () => {
        const readiness = await getReadiness(api, noteId);

        if (!readiness.pronto) {
          throw new Error(`Pendencias fiscais: ${readiness.pendencias.join(', ') || 'revise a nota'}`);
        }

        return sendDps(api, noteId);
      },
      'NFS-e enviada para emissao.',
    );
  }

  async function cancelRealNote(noteId: string) {
    const motivo = prompt('Informe o motivo do cancelamento:', 'Erro na emissao da NFS-e');

    if (!motivo) {
      return;
    }

    if (motivo.trim().length < 15) {
      showToast('Motivo do cancelamento precisa ter pelo menos 15 caracteres.', 'error');
      return;
    }

    if (!confirm('Cancelar esta NFS-e em producao?')) {
      return;
    }

    await mutateNote(
      noteId,
      () => cancelNfse(api, noteId, motivo.trim()),
      'Cancelamento enviado.',
    );
  }

  async function createReplacementDraft(noteId: string) {
    const note = state.notas.find((item) => item.id === noteId);

    if (!note) {
      return;
    }

    const valorServico = prompt('Valor da nota substituta:', String(note.valorServico));
    if (!valorServico) {
      return;
    }

    const descricao = prompt('Descricao da nota substituta:', note.descricao);
    if (!descricao) {
      return;
    }

    const dataCompetencia = prompt(
      'Data de competencia da nota substituta:',
      toDateInputValue(note.dataCompetencia || note.dataEmissao || note.createdAt),
    );
    if (!dataCompetencia) {
      return;
    }

    const motivoSubstituicao = prompt(
      'Motivo da substituicao:',
      'Correcao de dados da NFS-e emitida',
    );
    if (!motivoSubstituicao) {
      return;
    }

    if (motivoSubstituicao.trim().length < 15) {
      showToast('Motivo da substituicao precisa ter pelo menos 15 caracteres.', 'error');
      return;
    }

    const replacement = await replaceNfse(api, noteId, {
      clienteId: note.clienteId,
      servicoId: note.servicoId,
      valorServico: parseCurrencyValue(valorServico),
      descricao: descricao.trim(),
      serieDps: note.serieDps,
      dataCompetencia,
      codigoMunicipioPrestacao: note.codigoMunicipioPrestacao,
      codigoMotivoSubstituicao: '99',
      motivoSubstituicao: motivoSubstituicao.trim(),
    });

    await loadResources(api, state);
    state.modal = {
      type: 'note',
      title: `Substituicao DPS ${replacement.numeroDps || replacement.id}`,
      data: replacement,
    };
    render();
    showToast('Nota de substituicao criada. Confira e emita.', 'success');
  }

  async function mutateNote(noteId: string, mutation: () => Promise<unknown>, successMessage: string) {
    try {
      await mutation();
      await loadResources(api, state);

      const note = state.notas.find((item) => item.id === noteId);
      state.modal = note
        ? {
            type: 'note',
            title: `Nota ${note.numeroNfse || note.numeroDps || note.id}`,
            data: note,
          }
        : null;
      render();
      showToast(successMessage, 'success');
    } catch (error) {
      showToast(messageFromError(error), 'error');
    }
  }

  function clearSession() {
    state.token = '';
    state.usuario = null;
    state.empresa = null;
    state.notas = [];
    state.clientes = [];
    state.servicos = [];
    state.modal = null;
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  function showToast(message: string, type: ToastState['type'] = '') {
    state.toast = { message, type };
    render();

    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      state.toast = null;
      render();
    }, 3600);
  }

  function messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro inesperado.';
  }

  function togglePasswordVisibility(button: HTMLButtonElement) {
    const targetId = button.dataset.target;
    const input = targetId ? root.querySelector<HTMLInputElement>(`#${targetId}`) : null;

    if (!input) {
      return;
    }

    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button.textContent = shouldShow ? 'Ocultar' : 'Ver';
    button.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
    button.title = shouldShow ? 'Ocultar senha' : 'Mostrar senha';
  }

  function mountGoogleLogin() {
    const container = root.querySelector<HTMLElement>('#google-login-button');
    const status = root.querySelector<HTMLElement>('[data-google-login-status]');

    if (!container) {
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    if (container.dataset.ready === 'true') {
      return;
    }

    container.dataset.ready = 'true';
    loadGoogleScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          throw new Error('Google Identity indisponivel.');
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              void submitGoogleLogin(response.credential);
            }
          },
        });
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 360,
        });

        if (status) {
          status.textContent = '';
        }
      })
      .catch(() => {
        container.dataset.ready = '';

        if (status) {
          status.textContent = 'Nao foi possivel carregar o login Google.';
        }
      });
  }

  function loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (googleScriptPromise) {
      return googleScriptPromise;
    }

    googleScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');

      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(), { once: true });
      document.head.appendChild(script);
    });

    return googleScriptPromise;
  }

  function toDateInputValue(value?: string): string {
    if (!value) {
      return '';
    }

    return value.slice(0, 10);
  }

  function findClientFromSearch(value: string): Cliente | null {
    const term = value.trim();

    if (!term) {
      return null;
    }

    const activeClients = state.clientes.filter((cliente) => cliente.ativo);
    const exact = activeClients.find(
      (cliente) =>
        normalizeSearchText(clientSearchLabel(cliente)) === normalizeSearchText(term) ||
        onlyNumbers(cliente.cpfCnpj) === onlyNumbers(term),
    );

    if (exact) {
      return exact;
    }

    const matches = findClientSearchMatches(term);

    return matches.length === 1 ? matches[0] : null;
  }

  function findClientSearchMatches(value: string): Cliente[] {
    const term = normalizeSearchText(value);
    const documentDigits = onlyNumbers(value);

    if (term.length < 2 && documentDigits.length < 3) {
      return [];
    }

    return state.clientes
      .filter((cliente) => cliente.ativo)
      .filter((cliente) => {
        const label = normalizeSearchText(clientSearchLabel(cliente));
        const document = onlyNumbers(cliente.cpfCnpj);

        return label.includes(term) || Boolean(documentDigits && document.includes(documentDigits));
      });
  }

  function clientSearchLabel(cliente: Cliente): string {
    return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
  }

  function normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function onlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }

  function textField(formData: FormData, field: string): string {
    return String(formData.get(field) || '').trim();
  }

  function parseCurrencyField(formData: FormData, field: string): number {
    return parseCurrencyValue(textField(formData, field));
  }

  function parseCurrencyValue(value: string): number {
    const cleanValue = value
      .replace(/[^\d,.-]/g, '')
      .trim();
    const normalized = cleanValue.includes(',')
      ? cleanValue.replace(/\./g, '').replace(',', '.')
      : normalizeCurrencyWithDot(cleanValue);
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error('Informe um valor de servico valido.');
    }

    return parsed;
  }

  function normalizeCurrencyWithDot(value: string): string {
    const parts = value.split('.');

    if (parts.length === 2 && parts[1].length === 3) {
      return parts.join('');
    }

    return value;
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        const result = String(reader.result || '');
        resolve(result.split(',')[1] || result);
      });

      reader.addEventListener('error', () => {
        reject(new Error('Nao foi possivel ler o arquivo do certificado.'));
      });

      reader.readAsDataURL(file);
    });
  }

  function getClientField(form: HTMLFormElement, field: string): string {
    const element = form.elements.namedItem(field);

    return element instanceof HTMLInputElement ? element.value.trim() : '';
  }

  function setClientField(form: HTMLFormElement, field: string, value: string) {
    if (!value) {
      return;
    }

    const element = form.elements.namedItem(field);

    if (element instanceof HTMLInputElement) {
      element.value = value;
    }
  }

  function setClientLookupStatus(
    form: HTMLFormElement,
    source: 'cep' | 'cnpj',
    message: string,
    status: 'success' | 'error' | '',
  ) {
    const element = form.querySelector<HTMLElement>(
      source === 'cep' ? '[data-cep-status]' : '[data-cnpj-status]',
    );

    if (!element) {
      return;
    }

    element.textContent = message;
    element.dataset.status = status;
  }

  function setCompanyLookupStatus(
    form: HTMLFormElement,
    source: 'cep' | 'cnpj',
    message: string,
    status: 'success' | 'error' | '',
  ) {
    const element = form.querySelector<HTMLElement>(
      source === 'cep' ? '[data-company-cep-status]' : '[data-company-cnpj-status]',
    );

    if (!element) {
      return;
    }

    element.textContent = message;
    element.dataset.status = status;
  }

  return { init };
}
