import type { Dispatch, SetStateAction } from 'react';

import { STORAGE_KEYS } from '../config';
import { login, onboard } from '../services/authApi';
import { createApiClient, type ApiClient } from '../services/httpClient';
import { fetchAppResources, fetchAuthenticatedProfile } from '../services/resourcesApi';
import type { AppDataState, AppView, AuthMode } from '../types/app';
import { compactBody, textField } from '../utils/forms';
import { messageFromError } from './hookUtils';
import type { ShowToast } from './useToast';

interface UseAuthActionsParams {
  api: ApiClient;
  apiUrl: string;
  clearSession: () => void;
  setAuthMode: Dispatch<SetStateAction<AuthMode>>;
  setData: Dispatch<SetStateAction<AppDataState>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setToken: Dispatch<SetStateAction<string>>;
  setView: Dispatch<SetStateAction<AppView>>;
  showToast: ShowToast;
  token: string;
}

export function useAuthActions({
  api,
  apiUrl,
  clearSession,
  setAuthMode,
  setData,
  setLoading,
  setToken,
  setView,
  showToast,
  token,
}: UseAuthActionsParams) {
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
      setView(profile.usuario.perfil === 'ADMIN_SISTEMA' ? 'operational-admin' : 'dashboard');
    } catch (error) {
      clearSession();
      showToast(messageFromError(error) || 'Sessao expirada. Faca login novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(formData: FormData) {
    const result = await login(api, formData.get('email'), formData.get('senha'));

    localStorage.setItem(STORAGE_KEYS.token, result.token);
    setToken(result.token);
    setData((current) => ({ ...current, usuario: result.usuario }));
    await bootAuthenticatedArea(result.token);
    showToast('Login realizado.', 'success');
  }

  async function submitOnboarding(formData: FormData) {
    await onboard(api, {
      empresa: compactBody({
        bairro: textField(formData, 'bairro'),
        cep: textField(formData, 'cep'),
        cidade: textField(formData, 'cidade'),
        cnpj: textField(formData, 'cnpj'),
        codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
        complemento: textField(formData, 'complemento'),
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

  return {
    bootAuthenticatedArea,
    submitLogin,
    submitOnboarding,
  };
}
