export type PerfilUsuario = 'DONO' | 'ADMIN' | 'OPERADOR' | 'ADMIN_SISTEMA';
export type AmbienteFiscal = 'PRODUCAO' | 'HOMOLOGACAO';
export type StatusNota =
  | 'RASCUNHO'
  | 'PROCESSANDO'
  | 'EMITIDA'
  | 'SUBSTITUIDA'
  | 'CANCELADA'
  | 'ERRO'
  | 'ERRO_RESOLVIDO';

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusEventoFiscal = 'PENDENTE' | 'SUCESSO' | 'ERRO';

export interface AdminEmpresaResumo {
  id: string;
  razaoSocial: string;
  cnpj: string;
  cidade: string;
  uf: string;
  ativo: boolean;
}

export interface AdminResumoNotasEmpresa {
  total: number;
  emitidas: number;
  rascunhos: number;
  processando: number;
  erros: number;
  canceladas: number;
  substituidas: number;
}

export interface AdminConfiguracaoFiscalEmpresaResumo {
  ambienteFiscalPadrao: AmbienteFiscal;
  serieDpsPadrao: string;
  emissaoHabilitada: boolean;
  certificadoA1Configurado: boolean;
  certificadoA1ValidoAte?: string;
  ativo: boolean;
}

export interface AdminEmpresaOperacionalResumo extends AdminEmpresaResumo {
  configuracaoFiscal: AdminConfiguracaoFiscalEmpresaResumo;
  notas: AdminResumoNotasEmpresa;
  ultimoErro?: {
    notaServicoId: string;
    numeroNfse?: string;
    numeroDps?: string;
    mensagem?: string;
    updatedAt: string;
  };
}

export interface AdminClienteResumo {
  id: string;
  nomeRazaoSocial: string;
  cpfCnpj: string;
}

export interface AdminServicoResumo {
  id: string;
  descricao: string;
}

export interface AdminUsuarioResumo {
  id: string;
  nome: string;
  email: string;
}

export interface AdminEventoFiscalResumo {
  id: string;
  empresa: AdminEmpresaResumo;
  notaServicoId: string;
  usuario?: AdminUsuarioResumo;
  tipo: string;
  status: StatusEventoFiscal;
  statusHttp?: number;
  chaveAcesso?: string;
  mensagem?: string;
  createdAt: string;
  nota?: {
    id: string;
    numeroNfse?: string;
    serieDps?: string;
    numeroDps?: string;
    status: StatusNota;
    valorServico: number;
    dataEmissao?: string;
    cliente: AdminClienteResumo;
    servico: AdminServicoResumo;
  };
}

export interface AdminNotaResumo {
  id: string;
  empresa: AdminEmpresaResumo;
  cliente: AdminClienteResumo;
  servico: AdminServicoResumo;
  numeroNfse?: string;
  serieDps?: string;
  numeroDps?: string;
  ambienteFiscal: AmbienteFiscal;
  status: StatusNota;
  valorServico: number;
  valorIss: number;
  dataCompetencia?: string;
  dataEmissao?: string;
  chaveAcesso?: string;
  mensagemErro?: string;
  mensagemErroFiscal?: string;
  createdAt: string;
  updatedAt: string;
  ultimoEvento?: Omit<AdminEventoFiscalResumo, 'empresa' | 'nota'>;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  regimeTributario: string;
  regimeEspecialTributacao?: string;
  regimeApuracaoSimplesNacional?: string;
  codigoMunicipioIbge?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfiguracaoFiscalEmpresa {
  id: string;
  empresaId: string;
  configurada: boolean;
  ambienteFiscalPadrao: AmbienteFiscal;
  serieDpsPadrao: string;
  certificadoA1Path?: string;
  certificadoA1NomeArquivo?: string;
  certificadoA1Configurado?: boolean;
  certificadoA1ValidoAte?: string;
  certificadoA1SenhaConfigurada: boolean;
  emissaoHabilitada?: boolean;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cliente {
  id: string;
  empresaId: string;
  nomeRazaoSocial: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  uf: string;
  inscricaoMunicipal?: string;
  codigoMunicipioIbge?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Servico {
  id: string;
  empresaId: string;
  descricao: string;
  codigoServico: string;
  codigoTributacaoNacional?: string;
  codigoTributacaoMunicipal?: string;
  codigoNbs?: string;
  aliquotaIss: number;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotaServico {
  id: string;
  empresaId: string;
  usuarioId: string;
  clienteId: string;
  servicoId: string;
  numeroNfse?: string;
  codigoVerificacao?: string;
  protocoloEmissao?: string;
  chaveAcesso?: string;
  xmlAutorizado?: string;
  dataAutorizacao?: string;
  mensagemErroFiscal?: string;
  ambienteFiscal: AmbienteFiscal;
  serieDps?: string;
  numeroDps?: string;
  dataCompetencia?: string;
  codigoMunicipioPrestacao?: string;
  tributacaoIssqn?: string;
  tipoRetencaoIssqn?: string;
  informacoesComplementares?: string;
  notaSubstituidaId?: string;
  chaveAcessoSubstituida?: string;
  codigoMotivoSubstituicao?: string;
  motivoSubstituicao?: string;
  valorServico: number;
  valorIss: number;
  aliquotaIss: number;
  descricao: string;
  status: StatusNota;
  dataEmissao?: string;
  linkPdf?: string;
  xmlUrl?: string;
  mensagemErro?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotaServicoEventoFiscal {
  id: string;
  empresaId: string;
  notaServicoId: string;
  usuarioId?: string;
  tipo: string;
  status: string;
  statusHttp?: number;
  chaveAcesso?: string;
  mensagem?: string;
  createdAt: string;
}

export interface PerfilAutenticado {
  usuario: Usuario;
  empresa: Empresa;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface ProntidaoFiscal {
  pronto: boolean;
  pendencias: string[];
  producaoReal?: Record<string, boolean>;
}
