import type { Cliente } from '../types/models';
import { normalizeSearchText, onlyNumbers } from '../utils/forms';
import { formatDocument } from '../utils/formatters';

export function findClientFromSearch(clients: Cliente[], value: string): Cliente | null {
  const term = value.trim();

  if (!term) {
    return null;
  }

  const activeClients = clients.filter((cliente) => cliente.ativo);
  const exact = activeClients.find(
    (cliente) =>
      normalizeSearchText(clientSearchLabel(cliente)) === normalizeSearchText(term) ||
      onlyNumbers(cliente.cpfCnpj) === onlyNumbers(term),
  );

  if (exact) {
    return exact;
  }

  const matches = findClientSearchMatches(activeClients, term);

  return matches.length === 1 ? matches[0] : null;
}

export function formatFiscalPendencies(pendencies: string[]) {
  if (!pendencies.length) {
    return 'revise os dados da nota';
  }

  const labels: Record<string, string> = {
    'producaoReal.certificadoA1Empresa': 'certificado digital A1 da empresa nao configurado',
    'producaoReal.permissao': 'emissao em producao ainda nao liberada na API',
    'producaoReal.regimeTributario': 'regime tributario ainda nao suportado para emissao real',
    'producaoReal.urlSefinProducao': 'URL de producao da prefeitura nao configurada',
    'producaoReal.xsdDps': 'arquivo XSD da DPS nao configurado na API',
    'producaoReal.xsdEvento': 'arquivo XSD de eventos nao configurado na API',
  };

  return pendencies.map((pendency) => labels[pendency] || pendency).join(', ');
}

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}

function findClientSearchMatches(clients: Cliente[], value: string): Cliente[] {
  const term = normalizeSearchText(value);
  const documentDigits = onlyNumbers(value);

  if (term.length < 2 && documentDigits.length < 3) {
    return [];
  }

  return clients.filter((cliente) => {
    const label = normalizeSearchText(clientSearchLabel(cliente));
    const document = onlyNumbers(cliente.cpfCnpj);

    return label.includes(term) || Boolean(documentDigits && document.includes(documentDigits));
  });
}

function clientSearchLabel(cliente: Cliente): string {
  return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
}
