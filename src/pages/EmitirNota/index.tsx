import { useMemo, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import type { AppDataState } from '../../types/app';
import type { Cliente } from '../../types/models';
import { formatDocument } from '../../utils/formatters';
import { normalizeSearchText, onlyNumbers, todayInputValue } from '../../utils/forms';
import { serviceOptionLabel } from '../../utils/serviceLabels';
import { Button, Eyebrow, Field, FieldHelp, FormGrid, Grid, Panel, SectionHead } from '../../components/ui';

interface NewNotePageProps {
  state: AppDataState;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function NewNotePage({ state, onSubmit }: NewNotePageProps) {
  const [clientSearch, setClientSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeClients = useMemo(() => state.clientes.filter((cliente) => cliente.ativo), [state.clientes]);
  const activeServices = useMemo(() => state.servicos.filter((servico) => servico.ativo), [state.servicos]);
  const selectedClient = findClientFromSearch(activeClients, clientSearch);
  const serieDps = state.configuracaoFiscal?.serieDpsPadrao || '1';
  const codigoMunicipioPrestacao = state.empresa?.codigoMunicipioIbge || '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(new FormData(event.currentTarget));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>NFS-e</Eyebrow>
          <h1>Emitir nota</h1>
          <p>Preencha os dados, gere o rascunho e confira antes de emitir.</p>
        </div>
      </SectionHead>
      <Panel>
        <FormGrid onSubmit={handleSubmit}>
          <input type="hidden" name="clienteId" value={selectedClient?.id || ''} />
          <input type="hidden" name="serieDps" value={serieDps} />
          <input type="hidden" name="codigoMunicipioPrestacao" value={codigoMunicipioPrestacao} />
          <input type="hidden" name="dataCompetencia" value={todayInputValue()} />
          <Grid $columns={2}>
            <ClientField>
              Cliente
              <input
                name="clienteBusca"
                list="clientesOptions"
                autoComplete="off"
                placeholder="Digite nome, CPF ou CNPJ"
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                required
              />
              <datalist id="clientesOptions">
                {activeClients.map((cliente) => (
                  <option key={cliente.id} value={clientOptionLabel(cliente)} />
                ))}
              </datalist>
              <FieldHelp $status={clientSearch && !selectedClient ? 'error' : ''}>
                {clientSearch && !selectedClient ? 'Cliente não encontrado' : '\u00a0'}
              </FieldHelp>
            </ClientField>
            <Field>
              Serviço
              <select name="servicoId" required defaultValue="">
                <option value="">Selecione</option>
                {activeServices.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {serviceOptionLabel(servico)}
                  </option>
                ))}
              </select>
              <FieldHelp aria-hidden="true">{'\u00a0'}</FieldHelp>
            </Field>
          </Grid>
          <Field>
            Valor do serviço
            <input name="valorServico" inputMode="decimal" placeholder="Ex.: 200 ou 200,00" required />
          </Field>
          <Field>
            Descrição
            <textarea name="descricao" required />
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Gerando rascunho...' : 'Gerar rascunho'}
          </Button>
        </FormGrid>
      </Panel>
    </>
  );
}

function findClientFromSearch(clients: Cliente[], value: string): Cliente | null {
  const term = value.trim();

  if (!term) {
    return null;
  }

  const exact = clients.find(
    (cliente) =>
      normalizeSearchText(clientOptionLabel(cliente)) === normalizeSearchText(term) ||
      onlyNumbers(cliente.cpfCnpj) === onlyNumbers(term),
  );

  if (exact) {
    return exact;
  }

  const matches = findClientMatches(clients, term);

  return matches.length === 1 ? matches[0] : null;
}

function findClientMatches(clients: Cliente[], value: string): Cliente[] {
  const term = normalizeSearchText(value);
  const documentDigits = onlyNumbers(value);

  if (term.length < 2 && documentDigits.length < 3) {
    return [];
  }

  return clients.filter((cliente) => {
    const label = normalizeSearchText(clientOptionLabel(cliente));
    const document = onlyNumbers(cliente.cpfCnpj);

    return label.includes(term) || Boolean(documentDigits && document.includes(documentDigits));
  });
}

function clientOptionLabel(cliente: Cliente): string {
  return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
}

const ClientField = styled(Field)`
  min-width: 0;
`;
