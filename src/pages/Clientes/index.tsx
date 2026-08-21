import { useEffect, useRef, useState, type FormEvent } from 'react';

import { fetchAddressByCep } from '../../services/cepApi';
import { fetchCompanyByCnpj } from '../../services/cnpjApi';
import type { AppDataState } from '../../types/app';
import type { Cliente } from '../../types/models';
import { formatDocument } from '../../utils/formatters';
import { onlyNumbers } from '../../utils/forms';
import { CompactList } from '../../components/CompactList';
import {
  Button,
  Eyebrow,
  Field,
  FieldHelp,
  FormGrid,
  Grid,
  Panel,
  PanelTitle,
  ResourceGrid,
  SectionHead,
  StatusBadge,
} from '../../components/ui';
import { Actions, InlineActions } from './styles';

interface ClientsPageProps {
  state: AppDataState;
  editingClientId: string;
  onEditClient: (clientId: string) => void;
  onCancelEdit: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function ClientsPage({
  state,
  editingClientId,
  onEditClient,
  onCancelEdit,
  onSubmit,
}: ClientsPageProps) {
  const editingClient = state.clientes.find((cliente) => cliente.id === editingClientId);
  const isEditing = Boolean(editingClient);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [cnpjStatus, setCnpjStatus] = useState('');
  const [cepStatus, setCepStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCnpjStatus('');
    setCepStatus('');
  }, [editingClientId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(new FormData(event.currentTarget));
    } finally {
      setSubmitting(false);
    }
  }

  async function fillClientFromCnpj(force = false) {
    const form = formRef.current;
    const document = getFieldValue(form, 'cpfCnpj');
    const digits = onlyNumbers(document);

    if (!digits) {
      setCnpjStatus('');
      return;
    }

    if (digits.length === 11) {
      setCnpjStatus('CPF aceito. Preencha os dados manualmente.');
      return;
    }

    if (digits.length !== 14) {
      if (force || digits.length > 11) {
        setCnpjStatus('Informe CPF com 11 digitos ou CNPJ com 14 digitos.');
      }
      return;
    }

    setCnpjStatus('Buscando CNPJ...');

    try {
      const company = await fetchCompanyByCnpj(digits);

      setFieldValue(form, 'cpfCnpj', company.cnpj);
      setFieldValue(form, 'nomeRazaoSocial', company.nomeRazaoSocial);
      setFieldValue(form, 'email', company.email);
      setFieldValue(form, 'telefone', company.telefone);
      setFieldValue(form, 'cep', company.cep);
      setFieldValue(form, 'endereco', company.endereco);
      setFieldValue(form, 'numero', company.numero);
      setFieldValue(form, 'complemento', company.complemento);
      setFieldValue(form, 'bairro', company.bairro);
      setFieldValue(form, 'cidade', company.cidade);
      setFieldValue(form, 'uf', company.uf);
      setCnpjStatus('Dados preenchidos pelo CNPJ.');

      if (company.cep) {
        await fillClientAddressFromCep(company.cep);
      }
    } catch (error) {
      setCnpjStatus(messageFromError(error));
    }
  }

  async function fillClientAddressFromCep(inputCep?: string) {
    const form = formRef.current;
    const cep = inputCep || getFieldValue(form, 'cep');
    const digits = onlyNumbers(cep);

    if (!digits) {
      setCepStatus('');
      return;
    }

    if (digits.length !== 8) {
      setCepStatus('CEP precisa ter 8 digitos.');
      return;
    }

    setCepStatus('Buscando CEP...');

    try {
      const address = await fetchAddressByCep(digits);

      if (!address) {
        setCepStatus('CEP nao encontrado.');
        return;
      }

      setFieldValue(form, 'cep', address.cep);
      setFieldValue(form, 'endereco', address.endereco);
      setFieldValue(form, 'bairro', address.bairro);
      setFieldValue(form, 'cidade', address.cidade);
      setFieldValue(form, 'uf', address.uf);
      setFieldValue(form, 'codigoMunicipioIbge', address.codigoMunicipioIbge);
      setCepStatus('Endereco preenchido pelo CEP.');
    } catch (error) {
      setCepStatus(messageFromError(error));
    }
  }

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>Cadastro</Eyebrow>
          <h1>Clientes</h1>
          <p>Cadastre e atualize os tomadores das notas.</p>
        </div>
      </SectionHead>
      <ResourceGrid $wideForm>
        <Panel>
          <PanelTitle>
            <h2>{isEditing ? 'Editar cliente' : 'Novo cliente'}</h2>
            {isEditing ? <StatusBadge>Editando</StatusBadge> : null}
          </PanelTitle>
          <FormGrid key={editingClient?.id || 'new'} ref={formRef} onSubmit={handleSubmit}>
            <Field>
              Nome/Razão social
              <input name="nomeRazaoSocial" defaultValue={clientValue(editingClient, 'nomeRazaoSocial')} required />
            </Field>
            <Field>
              CPF/CNPJ
              <input
                name="cpfCnpj"
                defaultValue={clientValue(editingClient, 'cpfCnpj')}
                disabled={isEditing}
                required={!isEditing}
                onBlur={() => void fillClientFromCnpj()}
              />
              <InlineActions>
                {!isEditing ? (
                  <Button type="button" $tone="action" onClick={() => void fillClientFromCnpj(true)}>
                    Consultar CNPJ
                  </Button>
                ) : null}
                <FieldHelp $status={statusTone(cnpjStatus)}>{cnpjStatus}</FieldHelp>
              </InlineActions>
            </Field>
            <Grid $columns={2}>
              <Field>
                Cidade
                <input name="cidade" defaultValue={clientValue(editingClient, 'cidade')} required />
              </Field>
              <Field>
                UF
                <input name="uf" defaultValue={clientValue(editingClient, 'uf')} maxLength={2} required />
              </Field>
            </Grid>
            <Field>
              Código IBGE da cidade
              <input
                name="codigoMunicipioIbge"
                defaultValue={clientValue(editingClient, 'codigoMunicipioIbge')}
                maxLength={7}
                inputMode="numeric"
              />
            </Field>
            <Field>
              E-mail
              <input name="email" type="email" defaultValue={clientValue(editingClient, 'email')} />
            </Field>
            <Grid $columns={2}>
              <Field>
                Telefone
                <input name="telefone" defaultValue={clientValue(editingClient, 'telefone')} />
              </Field>
              <Field>
                CEP
                <input
                  name="cep"
                  defaultValue={clientValue(editingClient, 'cep')}
                  onBlur={() => void fillClientAddressFromCep()}
                />
                <FieldHelp $status={statusTone(cepStatus)}>{cepStatus}</FieldHelp>
              </Field>
            </Grid>
            <Field>
              Endereço
              <input name="endereco" defaultValue={clientValue(editingClient, 'endereco')} />
            </Field>
            <Grid $columns={2}>
              <Field>
                Numero
                <input name="numero" defaultValue={clientValue(editingClient, 'numero')} />
              </Field>
              <Field>
                Complemento
                <input name="complemento" defaultValue={clientValue(editingClient, 'complemento')} maxLength={156} />
              </Field>
            </Grid>
            <Grid $columns={2}>
              <Field>
                Bairro
                <input name="bairro" defaultValue={clientValue(editingClient, 'bairro')} />
              </Field>
            </Grid>
            <Actions>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : isEditing ? 'Salvar cliente' : 'Cadastrar cliente'}
              </Button>
              {isEditing ? (
                <Button type="button" $tone="ghost" onClick={onCancelEdit}>
                  Cancelar
                </Button>
              ) : null}
            </Actions>
          </FormGrid>
        </Panel>
        <Panel>
          <PanelTitle>
            <h2>Clientes cadastrados</h2>
          </PanelTitle>
          <CompactList
            items={state.clientes}
            title={(cliente) => cliente.nomeRazaoSocial}
            meta={clientMeta}
            actions={(cliente) => (
              <Button type="button" $tone="action" onClick={() => onEditClient(cliente.id)}>
                Editar
              </Button>
            )}
          />
        </Panel>
      </ResourceGrid>
    </>
  );
}

function clientValue(cliente: Cliente | undefined, field: keyof Cliente): string {
  const value = cliente?.[field];

  return typeof value === 'string' ? value : '';
}

function clientMeta(cliente: Cliente): string {
  const contato = [cliente.email, cliente.telefone].filter(Boolean).join(' / ') || 'sem contato';
  const endereco =
    [cliente.endereco, cliente.numero, cliente.complemento, cliente.bairro].filter(Boolean).join(', ') ||
    'endereco pendente';
  const codigoIbge = cliente.codigoMunicipioIbge ? `IBGE ${cliente.codigoMunicipioIbge}` : 'IBGE pendente';

  return [
    formatDocument(cliente.cpfCnpj),
    `${cliente.cidade}/${cliente.uf}`,
    contato,
    endereco,
    codigoIbge,
    cliente.ativo ? 'Ativo' : 'Inativo',
  ].join(' | ');
}

function getFieldValue(form: HTMLFormElement | null, field: string): string {
  const element = form?.elements.namedItem(field);

  return element instanceof HTMLInputElement ? element.value.trim() : '';
}

function setFieldValue(form: HTMLFormElement | null, field: string, value: string) {
  if (!value) {
    return;
  }

  const element = form?.elements.namedItem(field);

  if (element instanceof HTMLInputElement) {
    element.value = value;
  }
}

function statusTone(value: string): 'success' | 'error' | '' {
  if (!value) return '';
  if (value.includes('preenchid') || value.includes('aceito') || value.includes('Dados')) return 'success';
  return value.includes('Buscando') ? '' : 'error';
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}
