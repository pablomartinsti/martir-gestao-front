import type {
  Cliente,
  ConfiguracaoFiscalEmpresa,
  Empresa,
  NotaServico,
  PerfilAutenticado,
  Servico,
} from '../types/models';
import type { ApiClient } from '../services/httpClient';
import type { AppState } from './app-state';

export async function loadAuthenticatedProfile(api: ApiClient, state: AppState) {
  const perfil = await api<PerfilAutenticado>('/me');

  state.usuario = perfil.usuario;
  state.empresa = perfil.empresa;
}

export async function loadResources(api: ApiClient, state: AppState) {
  const results = await Promise.allSettled([
    api<NotaServico[]>('/notas-servico'),
    api<Cliente[]>('/clientes'),
    api<Servico[]>('/servicos'),
    api<Empresa>('/empresa'),
    api<ConfiguracaoFiscalEmpresa>('/empresa/configuracao-fiscal'),
  ]);

  if (results[0].status === 'fulfilled') {
    state.notas = results[0].value.filter((nota) => nota.ambienteFiscal === 'PRODUCAO');
  }
  if (results[1].status === 'fulfilled') state.clientes = results[1].value;
  if (results[2].status === 'fulfilled') state.servicos = results[2].value;
  if (results[3].status === 'fulfilled') state.empresa = results[3].value;
  if (results[4].status === 'fulfilled') state.configuracaoFiscal = results[4].value;
}
