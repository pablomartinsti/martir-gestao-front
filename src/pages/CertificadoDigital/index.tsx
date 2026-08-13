import { useState, type FormEvent } from 'react';

import type { AppDataState } from '../../types/app';
import { certificateStatusBadge, getCertificateExpirationInfo } from '../../utils/formatters';
import { PasswordToggle } from '../../components/PasswordToggle';
import { Button, Eyebrow, Field, FormGrid, Grid, Panel, PanelTitle, SectionHead, StatusBadge } from '../../components/ui';
import { CertificateActions, CertificateBox, Expiry, Hint, PasswordRow } from './styles';

interface CertificatePageProps {
  state: AppDataState;
  onSubmit: (formData: FormData) => Promise<void>;
  onRemoveCertificate: () => Promise<void>;
}

export function CertificatePage({ state, onSubmit, onRemoveCertificate }: CertificatePageProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const config = state.configuracaoFiscal;
  const canManageFiscal = state.usuario?.perfil === 'DONO' || state.usuario?.perfil === 'ADMIN';
  const certificateConfigured = Boolean(config?.certificadoA1Configurado) || Boolean(config?.certificadoA1SenhaConfigurada);
  const certificateInfo = getCertificateExpirationInfo(certificateConfigured, config?.certificadoA1ValidoAte);

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
          <Eyebrow>NFS-e</Eyebrow>
          <h1>Certificado Digital</h1>
          <p>Envie ou atualize o certificado A1 usado para emitir notas fiscais.</p>
        </div>
      </SectionHead>
      {canManageFiscal ? (
        <Panel>
          <PanelTitle>
            <h2>Certificado digital</h2>
          </PanelTitle>
          <FormGrid onSubmit={handleSubmit}>
            <Grid $columns={2}>
              <Field>
                Ambiente fiscal padrao
                <select
                  name="ambienteFiscalPadrao"
                  defaultValue={config?.ambienteFiscalPadrao ?? 'HOMOLOGACAO'}
                >
                  <option value="HOMOLOGACAO">Homologacao</option>
                  <option value="PRODUCAO">Producao</option>
                </select>
              </Field>
              <Field>
                Serie DPS
                <input name="serieDpsPadrao" defaultValue={config?.serieDpsPadrao ?? '1'} />
              </Field>
            </Grid>
            <CertificateBox>
              <PanelTitle>
                <h3>Certificado A1</h3>
                <CertificateActions>
                  <StatusBadge $status={certificateStatusBadge(certificateInfo.status)}>{certificateInfo.label}</StatusBadge>
                  {certificateConfigured ? (
                    <Button type="button" $tone="danger" $compact onClick={() => void onRemoveCertificate()}>
                      Remover certificado
                    </Button>
                  ) : null}
                </CertificateActions>
              </PanelTitle>
              <Expiry $status={certificateInfo.status}>
                <strong>{certificateInfo.label}</strong>
                <span>{certificateInfo.detail}</span>
              </Expiry>
              <Grid $columns={2}>
                <Field>
                  Arquivo
                  <input name="certificadoA1Arquivo" type="file" accept=".pfx,.p12" />
                </Field>
                <Field>
                  Senha do certificado
                  <PasswordRow>
                    <input
                      name="certificadoA1Senha"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="off"
                    />
                    <PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible((value) => !value)} />
                  </PasswordRow>
                </Field>
              </Grid>
              <Hint>Use arquivo A1 .pfx ou .p12.</Hint>
            </CertificateBox>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar certificado'}
            </Button>
          </FormGrid>
        </Panel>
      ) : (
        <Panel>Esta configuracao e liberada apenas para administradores.</Panel>
      )}
    </>
  );
}
