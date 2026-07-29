export interface CepAddress {
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoMunicipioIbge: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) {
    throw new Error('CEP precisa ter 8 digitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (response.status === 400) {
    throw new Error('CEP invalido.');
  }

  if (!response.ok) {
    throw new Error('Nao foi possivel consultar o CEP.');
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    return null;
  }

  return {
    cep: data.cep || digits,
    endereco: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    uf: data.uf || '',
    codigoMunicipioIbge: data.ibge || '',
  };
}
