import styled from 'styled-components';

type KpiTone = 'green' | 'gray' | 'amber' | 'red';
type CertificateStatus = 'ok' | 'warning' | 'expired' | 'missing';

export const CertificateNotice = styled.section<{ $status: CertificateStatus }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid ${({ $status }) => certificateBorder($status)};
  border-radius: var(--radius);
  background: ${({ $status }) => certificateBackground($status)};
  padding: 14px 16px;

  span {
    display: block;
    color: var(--ink-500);
    font-size: 0.76rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 3px;
    color: var(--ink-900);
  }

  small {
    display: block;
    margin-top: 2px;
    color: var(--ink-500);
    font-weight: 800;
  }

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PeriodPanel = styled.section`
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

export const RangeForm = styled.form`
  display: grid;
  grid-template-columns: 180px 180px auto;
  align-items: end;
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiGrid = styled.div`
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

export const Kpi = styled.article`
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

export const KpiSymbol = styled.i<{ $tone: KpiTone }>`
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

export const Bars = styled.div`
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

export const BarWrap = styled.div`
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

export const BarTrack = styled.div`
  display: flex;
  height: 210px;
  width: min(36px, 100%);
  align-items: end;
  justify-content: center;
`;

export const BarFill = styled.div<{ $height: number; $empty: boolean }>`
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  border-radius: 7px 7px 0 0;
  background: ${({ $empty }) =>
    $empty ? '#cfd5e4' : 'linear-gradient(180deg, var(--gold-500), var(--navy-850))'};
`;

export const ChartBadge = styled.span`
  border-radius: 999px;
  background: rgba(31, 157, 85, 0.12);
  color: var(--green-600);
  padding: 5px 12px;
  font-size: 0.76rem;
  font-weight: 900;
`;

export const EventList = styled.div`
  display: grid;
  gap: 12px;
`;

export const EventItem = styled.div`
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

export const Dot = styled.span`
  width: 9px;
  height: 9px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--green-600);
`;

export const EmptyRecent = styled.div`
  display: grid;
  min-height: 120px;
  place-items: center;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  color: var(--ink-500);
`;

function symbolBackground(tone: KpiTone): string {
  const colors = {
    amber: 'rgba(201, 163, 74, 0.15)',
    gray: 'rgba(104, 112, 141, 0.13)',
    green: 'rgba(31, 157, 85, 0.12)',
    red: 'rgba(201, 52, 63, 0.1)',
  };

  return colors[tone];
}

function symbolColor(tone: KpiTone): string {
  const colors = {
    amber: 'var(--gold-600)',
    gray: 'var(--ink-500)',
    green: 'var(--green-600)',
    red: 'var(--red-600)',
  };

  return colors[tone];
}

function certificateBackground(status: CertificateStatus): string {
  if (status === 'warning') return 'rgba(201, 163, 74, 0.12)';
  if (status === 'ok') return 'rgba(31, 157, 85, 0.08)';
  return 'rgba(201, 52, 63, 0.08)';
}

function certificateBorder(status: CertificateStatus): string {
  if (status === 'warning') return 'rgba(201, 163, 74, 0.32)';
  if (status === 'ok') return 'rgba(31, 157, 85, 0.22)';
  return 'rgba(201, 52, 63, 0.22)';
}
