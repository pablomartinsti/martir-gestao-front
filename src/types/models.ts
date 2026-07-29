export type PerfilUsuario = 'DONO' | 'ADMIN' | 'OPERADOR';
export type AmbienteFiscal = 'PRODUCAO' | 'HOMOLOGACAO';
export type StatusNota =
  | 'RASCUNHO'
  | 'PROCESSANDO'
  | 'EMITIDA'
  | 'SUBSTITUIDA'
  | 'CANCELADA'
  | 'ERRO';

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
