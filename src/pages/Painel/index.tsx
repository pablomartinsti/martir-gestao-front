import { useState, type FormEvent } from 'react';

import { CertificateAttentionModal } from '../../components/CertificateAttentionModal';
import type { AppDataState, AppView } from '../../types/app';
import type { NotaServico } from '../../types/models';
import {
  certificateStatusBadge,
  formatCurrency,
  formatDate,
  formatDateOnly,
  formatNumber,
  getCertificateExpirationInfo,
  statusLabel,
} from '../../utils/formatters';
import {
  clientName,
  filterNotesByDashboardPeriod,
  getDashboardDateRange,
  getDashboardMovement,
} from '../../utils/nfseSelectors';
import { Button, Eyebrow, Field, Panel, PanelTitle, SectionHead, SplitGrid, Stack } from '../../components/ui';
import {
  BarFill,
  Bars,
  BarTrack,
  BarWrap,
  CertificateNotice,
  ChartBadge,
  Dot,
  EmptyRecent,
  EventItem,
  EventList,
  Kpi,
  KpiGrid,
  KpiSymbol,
  PeriodPanel,
  RangeForm,
} from './styles';

interface DashboardPageProps {
  state: AppDataState;
  dashboardStartDate: string;
  dashboardEndDate: string;
  onNavigate: (view: AppView) => void;
  onDashboardRange: (start: string, end: string) => void;
}

export function DashboardPage({
  state,
  dashboardStartDate,
  dashboardEndDate,
  onNavigate,
  onDashboardRange,
}: DashboardPageProps) {
  const range = getDashboardDateRange(dashboardStartDate, dashboardEndDate);
  const dashboardNotes = filterNotesByDashboardPeriod(state.notas, range);
  const emittedCount = dashboardNotes.filter((nota) => nota.status === 'EMITIDA').length;
  const certificateConfigured = Boolean(state.configuracaoFiscal?.certificadoA1Configurado)
    || Boolean(state.configuracaoFiscal?.certificadoA1SenhaConfigurada);
  const certificateInfo = getCertificateExpirationInfo(
    certificateConfigured,
    state.configuracaoFiscal?.certificadoA1ValidoAte,
  );
  const shouldShowCertificateAlert = certificateInfo.status !== 'ok';
  const [certificateModalDismissed, setCertificateModalDismissed] = useState(false);
  const certificateAttentionItems = state.empresa && shouldShowCertificateAlert
    ? [
        {
          detail: certificateInfo.detail,
          document: state.empresa.cnpj,
          id: state.empresa.id,
          name: state.empresa.razaoSocial,
          status: certificateInfo.status,
        },
      ]
    : [];

  function handleRangeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onDashboardRange(String(formData.get('dashboardStartDate') || ''), String(formData.get('dashboardEndDate') || ''));
  }

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>Painel</Eyebrow>
          <h1>NFS-e</h1>
          <p>Acompanhe suas notas emitidas, faturamento e últimas emissões.</p>
        </div>
        <Button type="button" onClick={() => onNavigate('new-note')}>
          + Emitir nota
        </Button>
      </SectionHead>
      <Stack>
        <CertificateAttentionModal
          items={certificateAttentionItems}
          message="Seu certificado digital esta vencido, vencendo ou precisa de conferencia. Atualize para evitar erro na emissao de notas."
          open={shouldShowCertificateAlert && !certificateModalDismissed}
          primaryLabel="Corrigir agora"
          onClose={() => setCertificateModalDismissed(true)}
          onPrimary={() => {
            setCertificateModalDismissed(true);
            onNavigate('company');
          }}
        />
        {shouldShowCertificateAlert ? (
          <CertificateNotice $status={certificateInfo.status}>
            <div>
              <span>Certificado digital</span>
              <strong>{certificateInfo.label}</strong>
              <small>{certificateInfo.detail}</small>
            </div>
            <Button type="button" $tone={certificateStatusBadge(certificateInfo.status) === 'ERRO' ? 'danger' : 'ghost'} onClick={() => onNavigate('company')}>
              Atualizar certificado
            </Button>
          </CertificateNotice>
        ) : null}
        <PeriodPanel>
          <div>
            <span>Período</span>
            <strong>
              {formatDateOnly(range.start)} a {formatDateOnly(range.end)}
            </strong>
            <small>{formatNumber(emittedCount)} nota(s) emitida(s) no periodo</small>
          </div>
          <RangeForm onSubmit={handleRangeSubmit}>
            <Field>
              De
              <input name="dashboardStartDate" type="date" defaultValue={range.start} required />
            </Field>
            <Field>
              Até
              <input name="dashboardEndDate" type="date" defaultValue={range.end} required />
            </Field>
            <Button type="submit" $tone="ghost">
              Aplicar
            </Button>
          </RangeForm>
        </PeriodPanel>
        <KpiGrid>
          <KpiCard label="Emitidas" value={emittedCount} hint="notas autorizadas" symbol="EM" tone="green" />
          <KpiCard
            label="Canceladas"
            value={dashboardNotes.filter((nota) => nota.status === 'CANCELADA').length}
            hint="notas canceladas"
            symbol="CA"
            tone="gray"
          />
          <KpiCard
            label="Substituidas"
            value={dashboardNotes.filter((nota) => nota.status === 'SUBSTITUIDA').length}
            hint="notas substituidas"
            symbol="SU"
            tone="amber"
          />
          <KpiCard
            label="Erros"
            value={dashboardNotes.filter((nota) => nota.status === 'ERRO').length}
            hint="precisam de atenção"
            symbol="ER"
            tone="red"
          />
        </KpiGrid>
        <SplitGrid>
          <MovementChart notas={dashboardNotes} range={range} />
          <RecentActivity state={state} notas={dashboardNotes} onNavigate={onNavigate} />
        </SplitGrid>
      </Stack>
    </>
  );
}

function KpiCard({
  label,
  value,
  hint,
  symbol,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  symbol: string;
  tone: 'green' | 'gray' | 'amber' | 'red';
}) {
  return (
    <Kpi>
      <KpiSymbol $tone={tone}>{symbol}</KpiSymbol>
      <div>
        <span>{label}</span>
        <strong>{formatNumber(value)}</strong>
        <small>{hint}</small>
      </div>
    </Kpi>
  );
}

function MovementChart({
  notas,
  range,
}: {
  notas: NotaServico[];
  range: ReturnType<typeof getDashboardDateRange>;
}) {
  const movement = getDashboardMovement(notas, range);
  const maxValue = Math.max(...movement.buckets.map((bucket) => bucket.totalValue), 1);

  return (
    <Panel>
      <PanelTitle>
        <h2>Faturamento por mes</h2>
        <ChartBadge>Emitidas</ChartBadge>
      </PanelTitle>
      <Bars aria-label="Faturamento por mes">
        {movement.buckets.map((bucket) => {
          const height = bucket.totalValue ? Math.max(12, Math.round((bucket.totalValue / maxValue) * 190)) : 3;
          const title = `${bucket.periodLabel}: ${formatCurrency(bucket.totalValue)} em ${bucket.count} nota(s) emitida(s)`;

          return (
            <BarWrap key={bucket.key} title={title} aria-label={title} tabIndex={0}>
              <BarTrack>
                <BarFill $height={height} $empty={!bucket.totalValue} />
              </BarTrack>
              <span>{bucket.label}</span>
            </BarWrap>
          );
        })}
      </Bars>
    </Panel>
  );
}

function RecentActivity({
  state,
  notas,
  onNavigate,
}: {
  state: AppDataState;
  notas: NotaServico[];
  onNavigate: (view: AppView) => void;
}) {
  const recent = notas
    .filter((nota) => nota.status === 'EMITIDA')
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Panel>
      <PanelTitle>
        <h2>Notas emitidas recentes</h2>
        <Button type="button" $tone="action" onClick={() => onNavigate('notes')}>
          Ver notas
        </Button>
      </PanelTitle>
      {recent.length ? (
        <EventList>
          {recent.map((nota) => (
            <EventItem key={nota.id}>
              <Dot />
              <div>
                <strong>
                  {statusLabel(nota.status)} - {nota.numeroNfse || nota.numeroDps || 'sem numero'}
                </strong>
                <span>
                  {clientName(state, nota.clienteId)} - {formatCurrency(nota.valorServico)}
                </span>
              </div>
              <time>{formatDate(nota.updatedAt || nota.createdAt)}</time>
            </EventItem>
          ))}
        </EventList>
      ) : (
        <EmptyRecent>Nenhuma nota emitida no periodo.</EmptyRecent>
      )}
    </Panel>
  );
}
