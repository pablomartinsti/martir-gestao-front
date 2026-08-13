import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type { AppDataState } from '../../types/app';
import type { Cliente, NotaServico } from '../../types/models';
import { formatDocument } from '../../utils/formatters';
import {
  currencyInputValue,
  dateInputValue,
  normalizeSearchText,
  onlyNumbers,
  todayInputValue,
} from '../../utils/forms';
import { serviceOptionLabel } from '../../utils/serviceLabels';
import { Button, Eyebrow, Field, FieldHelp, FormGrid, Grid, Panel, SectionHead } from '../../components/ui';
import { ClientField } from './styles';

interface NewNotePageProps {
  state: AppDataState;
  draft?: NotaServico | null;
  onCancelEdit?: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function NewNotePage({
  state,
  draft = null,
  onCancelEdit,
  onSubmit,
}: NewNotePageProps) {
  const [clientSearch, setClientSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeClients = useMemo(
    () =>
      state.clientes.filter(
        (cliente) => cliente.ativo || cliente.id === draft?.clienteId,
      ),
    [state.clientes, draft?.clienteId],
  );
  const activeServices = useMemo(
    () =>
      state.servicos.filter(
        (servico) => servico.ativo || servico.id === draft?.servicoId,
      ),
    [state.servicos, draft?.servicoId],
  );
  const selectedClient = findClientFromSearch(activeClients, clientSearch);
  const draftClient = activeClients.find((cliente) => cliente.id === draft?.clienteId);
  const serieDps = draft?.serieDps || state.configuracaoFiscal?.serieDpsPadrao || '1';
  const codigoMunicipioPrestacao =
    draft?.codigoMunicipioPrestacao || state.empresa?.codigoMunicipioIbge || '';
  const dataCompetencia =
    dateInputValue(draft?.dataCompetencia) || todayInputValue();

  useEffect(() => {
    setClientSearch(draftClient ? clientOptionLabel(draftClient) : '');
  }, [draft?.id, draftClient]);

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
          <h1>{draft ? 'Editar rascunho' : 'Emitir nota'}</h1>
          <p>
            {draft
              ? 'Ajuste os dados do rascunho antes de emitir.'
              : 'Preencha os dados, gere o rascunho e confira antes de emitir.'}
          </p>
        </div>
      </SectionHead>
      <Panel>
        <FormGrid key={draft?.id || 'novo-rascunho'} onSubmit={handleSubmit}>
          <input type="hidden" name="notaId" value={draft?.id || ''} />
          <input type="hidden" name="clienteId" value={selectedClient?.id || ''} />
          <input type="hidden" name="serieDps" value={serieDps} />
          <input type="hidden" name="numeroDps" value={draft?.numeroDps || ''} />
          <input type="hidden" name="codigoMunicipioPrestacao" value={codigoMunicipioPrestacao} />
          <input type="hidden" name="dataCompetencia" value={dataCompetencia} />
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
              <select name="servicoId" required defaultValue={draft?.servicoId || ''}>
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
            <input
              name="valorServico"
              inputMode="decimal"
              defaultValue={draft ? currencyInputValue(draft.valorServico) : ''}
              placeholder="Ex.: 200 ou 200,00"
              required
            />
          </Field>
          <Field>
            Descrição
            <textarea name="descricao" defaultValue={draft?.descricao || ''} required />
          </Field>
          <Grid $columns={draft ? 2 : 1}>
            <Button type="submit" disabled={submitting}>
              {draft
                ? submitting
                  ? 'Salvando rascunho...'
                  : 'Salvar rascunho'
                : submitting
                  ? 'Gerando rascunho...'
                  : 'Gerar rascunho'}
            </Button>
            {draft && onCancelEdit ? (
              <Button type="button" $tone="ghost" onClick={onCancelEdit}>
                Cancelar
              </Button>
            ) : null}
          </Grid>
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
