import { useState, type FormEvent } from 'react';

import type { AppDataState } from '../../types/app';
import { serviceFiscalSummary, serviceTitle } from '../../utils/serviceLabels';
import { CompactList } from '../../components/CompactList';
import { Button, Eyebrow, Field, FormGrid, Grid, Panel, PanelTitle, ResourceGrid, SectionHead } from '../../components/ui';

interface ServicesPageProps {
  state: AppDataState;
  onSubmit: (formData: FormData) => Promise<void>;
  onChangeStatus: (serviceId: string, ativo: boolean) => Promise<void>;
}

export function ServicesPage({ state, onSubmit, onChangeStatus }: ServicesPageProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(new FormData(event.currentTarget));
      event.currentTarget.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>Cadastro</Eyebrow>
          <h1>Serviços</h1>
          <p>Cadastre os serviços usados na emissão das notas.</p>
        </div>
      </SectionHead>
      <ResourceGrid>
        <Panel>
          <PanelTitle>
            <h2>Novo servico</h2>
          </PanelTitle>
          <FormGrid onSubmit={handleSubmit}>
            <Field>
              Descrição
              <input name="descricao" required />
            </Field>
            <Grid $columns={2}>
              <Field>
                Código serviço
                <input name="codigoServico" required />
              </Field>
              <Field>
                Alíquota ISS
                <input name="aliquotaIss" type="number" min="0" max="100" step="0.01" required />
              </Field>
            </Grid>
            <Field>
              Tributacao nacional
              <input name="codigoTributacaoNacional" maxLength={6} />
            </Field>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Cadastrar servico'}
            </Button>
          </FormGrid>
        </Panel>
        <Panel>
          <PanelTitle>
            <h2>Serviços cadastrados</h2>
          </PanelTitle>
          <CompactList
            items={state.servicos}
            title={serviceTitle}
            meta={(servico) => `${serviceFiscalSummary(servico)} - ${servico.ativo ? 'Ativo' : 'Inativo'}`}
            actions={(servico) => (
              <Button
                type="button"
                $tone="action"
                onClick={() => void onChangeStatus(servico.id, !servico.ativo)}
              >
                {servico.ativo ? 'Desativar' : 'Ativar'}
              </Button>
            )}
          />
        </Panel>
      </ResourceGrid>
    </>
  );
}
