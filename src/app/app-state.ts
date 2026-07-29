import type {
  Cliente,
  ConfiguracaoFiscalEmpresa,
  Empresa,
  NotaServico,
  Usuario,
  Servico,
} from '../domain/models';
import { DEFAULT_API_URL, STORAGE_KEYS } from '../shared/config';

export type AppView =
  | 'dashboard'
  | 'notes'
  | 'new-note'
  | 'clients'
  | 'services'
  | 'company'
  | 'users'
  | 'reports';

export type AuthMode = 'login' | 'onboarding';
export interface ToastState {
  message: string;
  type: 'success' | 'error' | '';
}

export interface ModalState {
  type: 'note' | 'text' | 'events' | 'readiness';
  title?: string;
  data?: unknown;
}

export interface AppState {
  apiUrl: string;
  authMode: AuthMode;
  token: string;
  usuario: Usuario | null;
  empresa: Empresa | null;
  notas: NotaServico[];
  clientes: Cliente[];
  servicos: Servico[];
  usuarios: Usuario[];
  configuracaoFiscal: ConfiguracaoFiscalEmpresa | null;
  usuariosErro: string;
  editingClientId: string;
  loading: boolean;
  view: AppView;
  search: string;
  dashboardStartDate: string;
  dashboardEndDate: string;
  toast: ToastState | null;
  modal: ModalState | null;
}

export function createInitialState(): AppState {
  return {
    apiUrl: localStorage.getItem(STORAGE_KEYS.apiUrl) || DEFAULT_API_URL,
    authMode: 'login',
    token: localStorage.getItem(STORAGE_KEYS.token) || '',
    usuario: null,
    empresa: null,
    notas: [],
    clientes: [],
    servicos: [],
    usuarios: [],
    configuracaoFiscal: null,
    usuariosErro: '',
    editingClientId: '',
    loading: false,
    view: 'dashboard',
    search: '',
    dashboardStartDate: '',
    dashboardEndDate: '',
    toast: null,
    modal: null,
  };
}
