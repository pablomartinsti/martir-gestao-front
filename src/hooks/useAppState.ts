import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_API_URL, STORAGE_KEYS } from '../config';
import { createApiClient } from '../services/httpClient';
import { fetchAppResources } from '../services/resourcesApi';
import type { AppDataState, AppModal, AppView, AuthMode } from '../types/app';
import { useAuthActions } from './useAuth';
import { useClientsActions } from './useClientsActions';
import { useDashboardActions } from './useDashboardActions';
import { useFiscalConfigActions } from './useFiscalConfigActions';
import { useNotesActions } from './useNotesActions';
import { useServicesActions } from './useServicesActions';
import { useToast } from './useToast';

const initialData: AppDataState = {
  clientes: [],
  configuracaoFiscal: null,
  empresa: null,
  notas: [],
  servicos: [],
  usuario: null,
};

export function useAppState() {
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
  const [editingDraftId, setEditingDraftId] = useState('');
  const [modal, setModal] = useState<AppModal>(null);
  const { safely, showToast, toast } = useToast();
  const api = useMemo(() => createApiClient(() => ({ apiUrl, token })), [apiUrl, token]);
  const editingDraft = useMemo(
    () => data.notas.find((nota) => nota.id === editingDraftId) ?? null,
    [data.notas, editingDraftId],
  );

  const authActions = useAuthActions({
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
  });
  const dashboardActions = useDashboardActions({
    setDashboardEndDate,
    setDashboardStartDate,
    showToast,
  });
  const clientActions = useClientsActions({
    api,
    editingClientId,
    refreshResources,
    setEditingClientId,
    showToast,
  });
  const serviceActions = useServicesActions({
    api,
    refreshResources,
    showToast,
  });
  const fiscalConfigActions = useFiscalConfigActions({
    api,
    data,
    refreshResources,
    showToast,
  });
  const noteActions = useNotesActions({
    api,
    apiUrl,
    data,
    refreshResources,
    setEditingDraftId,
    setModal,
    setView,
    showToast,
    token,
  });

  useEffect(() => {
    if (token) {
      void authActions.bootAuthenticatedArea(token);
    }
  }, []);

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

  function navigate(nextView: AppView) {
    setView(nextView);
    setModal(null);
    if (nextView !== 'clients') {
      setEditingClientId('');
    }
    setEditingDraftId('');
  }

  function clearSession() {
    setToken('');
    setData(initialData);
    setModal(null);
    setView('dashboard');
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  return {
    api,
    authMode,
    dashboardEndDate,
    dashboardStartDate,
    data,
    editingClientId,
    editingDraft,
    loading,
    modal,
    search,
    toast,
    token,
    view,
    actions: {
      ...clientActions,
      ...dashboardActions,
      ...fiscalConfigActions,
      ...noteActions,
      ...serviceActions,
      clearSession,
      closeModal: () => setModal(null),
      navigate,
      safely,
      setAuthMode,
      setEditingClientId,
      setSearch,
      submitLogin: authActions.submitLogin,
      submitOnboarding: authActions.submitOnboarding,
    },
  };
}

export type AppState = ReturnType<typeof useAppState>;
