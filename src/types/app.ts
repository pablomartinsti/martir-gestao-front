import type {
  Cliente,
  ConfiguracaoFiscalEmpresa,
  Empresa,
  NotaServico,
  Servico,
  Usuario,
} from './models';

export type AppView =
  | 'dashboard'
  | 'notes'
  | 'new-note'
  | 'clients'
  | 'services'
  | 'company'
  | 'operational-admin';
export type AuthMode = 'login' | 'onboarding';

export type ToastState = {
  message: string;
  type?: 'success' | 'error' | '';
} | null;

export type AppModal =
  | {
      type: 'note';
      title: string;
      note: NotaServico;
    }
  | {
      type: 'replacement';
      title: string;
      note: NotaServico;
    }
  | null;

export interface AppDataState {
  usuario: Usuario | null;
  empresa: Empresa | null;
  configuracaoFiscal: ConfiguracaoFiscalEmpresa | null;
  notas: NotaServico[];
  clientes: Cliente[];
  servicos: Servico[];
}
