import type {
  Cliente,
  ConfiguracaoFiscalEmpresa,
  Empresa,
  NotaServico,
  PerfilAutenticado,
  Servico,
} from '../types/models';
import type { ApiClient } from './httpClient';

export async function fetchAuthenticatedProfile(api: ApiClient) {
  return api<PerfilAutenticado>('/me');
}

export async function fetchAppResources(api: ApiClient) {
  const results = await Promise.allSettled([
    api<NotaServico[]>('/notas-servico'),
    api<Cliente[]>('/clientes'),
    api<Servico[]>('/servicos'),
    api<Empresa>('/empresa'),
    api<ConfiguracaoFiscalEmpresa>('/empresa/configuracao-fiscal'),
  ]);
  const notas = results[0].status === 'fulfilled' ? results[0].value : [];
  const configuracaoFiscal =
    results[4].status === 'fulfilled' ? results[4].value : null;
  const ambienteFiscalPadrao = configuracaoFiscal?.ambienteFiscalPadrao;

  return {
    notas: ambienteFiscalPadrao
      ? notas.filter((nota) => nota.ambienteFiscal === ambienteFiscalPadrao)
      : notas,
    clientes: results[1].status === 'fulfilled' ? results[1].value : [],
    servicos: results[2].status === 'fulfilled' ? results[2].value : [],
    empresa: results[3].status === 'fulfilled' ? results[3].value : null,
    configuracaoFiscal,
  };
}
