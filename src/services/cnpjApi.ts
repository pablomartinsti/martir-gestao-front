export interface CnpjCompany {
  cnpj: string;
  nomeRazaoSocial: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface BrasilApiCnpjResponse {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string | null;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
}

export async function fetchCompanyByCnpj(cnpj: string): Promise<CnpjCompany> {
  const digits = cnpj.replace(/\D/g, '');

  if (digits.length !== 14) {
    throw new Error('CNPJ precisa ter 14 digitos.');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);

  if (response.status === 400) {
    throw new Error('CNPJ invalido.');
  }

  if (response.status === 404) {
    throw new Error('CNPJ nao encontrado.');
  }

  if (!response.ok) {
    throw new Error('Nao foi possivel consultar o CNPJ.');
  }

  const data = (await response.json()) as BrasilApiCnpjResponse;

  return {
    cnpj: data.cnpj || digits,
    nomeRazaoSocial: data.razao_social || data.nome_fantasia || '',
    email: data.email || '',
    telefone: data.ddd_telefone_1 || data.ddd_telefone_2 || '',
    cep: data.cep || '',
    endereco: data.logradouro || '',
    numero: data.numero || '',
    complemento: data.complemento || '',
    bairro: data.bairro || '',
    cidade: data.municipio || '',
    uf: data.uf || '',
  };
}
