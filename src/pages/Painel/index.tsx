import type { FormEvent } from 'react';
import styled from 'styled-components';

import type { AppDataState, AppView } from '../../types/app';
import type { NotaServico } from '../../types/models';
import { formatCurrency, formatDate, formatDateOnly, formatNumber, statusLabel } from '../../utils/formatters';
import {
  clientName,
  filterNotesByDashboardPeriod,
  getDashboardDateRange,
  getDashboardMovement,
} from '../../utils/nfseSelectors';
import { Button, Eyebrow, Field, Panel, PanelTitle, SectionHead, SplitGrid, Stack } from '../../components/ui';

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

const PeriodPanel = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 18px;

  span {
    display: block;
    color: var(--ink-500);
    font-size: 0.75rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 4px;
  }

  small {
    display: block;
    margin-top: 3px;
    color: var(--ink-500);
    font-weight: 800;
  }

  @media (max-width: 940px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const RangeForm = styled.form`
  display: grid;
  grid-template-columns: 180px 180px auto;
  align-items: end;
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Kpi = styled.article`
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 18px;

  span {
    color: var(--ink-500);
    font-size: 0.76rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 1.7rem;
  }

  small {
    color: var(--ink-500);
  }
`;

const KpiSymbol = styled.i<{ $tone: 'green' | 'gray' | 'amber' | 'red' }>`
  display: inline-grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: ${({ $tone }) => symbolBackground($tone)};
  color: ${({ $tone }) => symbolColor($tone)};
  font-size: 0.78rem;
  font-style: normal;
  font-weight: 900;
`;

const Bars = styled.div`
  display: grid;
  min-height: 285px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
  padding: 14px 6px 0;

  @media (max-width: 720px) {
    gap: 6px;
  }
`;

const BarWrap = styled.div`
  display: grid;
  align-items: end;
  justify-items: center;
  gap: 8px;
  min-width: 0;

  span {
    color: var(--ink-500);
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: lowercase;
  }
`;

const BarTrack = styled.div`
  display: flex;
  height: 210px;
  width: min(36px, 100%);
  align-items: end;
  justify-content: center;
`;

const BarFill = styled.div<{ $height: number; $empty: boolean }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  border-radius: 7px 7px 0 0;
  background: ${({ $empty }) =>
    $empty ? '#cfd5e4' : 'linear-gradient(180deg, var(--gold-500), var(--navy-850))'};
`;

const ChartBadge = styled.span`
  border-radius: 999px;
  background: rgba(31, 157, 85, 0.12);
  color: var(--green-600);
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 900;
`;

const EventList = styled.div`
  display: grid;
  gap: 12px;
`;

const EventItem = styled.div`
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  border-bottom: 1px solid var(--line);
  padding-bottom: 12px;

  strong {
    display: block;
  }

  span,
  time {
    color: var(--ink-500);
    font-size: 0.82rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 10px 1fr;

    time {
      grid-column: 2;
    }
  }
`;

const Dot = styled.span`
  width: 9px;
  height: 9px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--green-600);
`;

const EmptyRecent = styled.div`
  display: grid;
  min-height: 120px;
  place-items: center;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  color: var(--ink-500);
`;

function symbolBackground(tone: 'green' | 'gray' | 'amber' | 'red'): string {
  const colors = {
    amber: 'rgba(201, 163, 74, 0.15)',
    gray: 'rgba(104, 112, 141, 0.13)',
    green: 'rgba(31, 157, 85, 0.12)',
    red: 'rgba(201, 52, 63, 0.1)',
  };

  return colors[tone];
}

function symbolColor(tone: 'green' | 'gray' | 'amber' | 'red'): string {
  const colors = {
    amber: 'var(--gold-600)',
    gray: 'var(--ink-500)',
    green: 'var(--green-600)',
    red: 'var(--red-600)',
  };

  return colors[tone];
}
