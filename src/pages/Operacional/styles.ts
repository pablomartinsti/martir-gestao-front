import styled from 'styled-components';

type CertificateStatus = 'ok' | 'warning' | 'expired' | 'missing';

export const Filters = styled.form`
  display: grid;
  grid-template-columns: minmax(220px, 1.4fr) repeat(4, minmax(130px, 0.8fr)) auto;
  align-items: end;
  gap: 12px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const KpiCard = styled.article`
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 16px;

  span {
    display: block;
    color: var(--ink-500);
    font-size: 0.76rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: var(--ink-900);
    font-size: 1.7rem;
  }

  small {
    color: var(--ink-500);
    font-weight: 800;
  }
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(340px, 0.7fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: start;
`;

export const CompanyPickerPanel = styled.section`
  display: grid;
  grid-template-columns: minmax(320px, 520px) auto;
  align-items: end;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 14px 16px;
  box-shadow: 0 10px 28px rgba(13, 24, 58, 0.06);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const CompanySelector = styled.div`
  display: grid;
  position: relative;
  gap: 7px;
  color: var(--ink-700);
  font-size: 0.82rem;
  font-weight: 800;

  input {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--line-strong);
    border-radius: 6px;
    background: #ffffff;
    color: var(--ink-900);
    padding: 10px 12px;
    outline: 0;
  }

  input:focus {
    border-color: var(--blue-650);
    box-shadow: 0 0 0 3px rgba(37, 87, 214, 0.12);
  }
`;

export const CompanyDropdown = styled.div`
  display: grid;
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  z-index: 20;
  max-height: 310px;
  gap: 2px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
  padding: 6px;
  box-shadow: 0 18px 40px rgba(13, 24, 58, 0.18);
`;

export const CompanyOptionButton = styled.button<{ $active: boolean }>`
  display: grid;
  gap: 4px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? 'rgba(37, 87, 214, 0.12)' : 'transparent')};
  padding: 10px;
  text-align: left;

  &:hover {
    background: rgba(201, 163, 74, 0.1);
  }

  strong {
    color: var(--ink-900);
    overflow-wrap: anywhere;
  }
`;

export const CompanyMeta = styled.small`
  color: var(--ink-500);
  font-weight: 800;
  line-height: 1.35;
`;

export const CompanyWarning = styled.small<{ $status: CertificateStatus }>`
  width: fit-content;
  border-radius: 999px;
  background: ${({ $status }) => companyWarningBackground($status)};
  color: ${({ $status }) => companyWarningColor($status)};
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 900;
`;

export const CompanySelectorActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;

  @media (max-width: 820px) {
    justify-content: space-between;
  }
`;

export const CompanyActions = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 640px) {
    justify-content: stretch;

    button {
      width: 100%;
    }
  }
`;

export const CompanyConfigForm = styled.form`
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(120px, 160px) auto;
  align-items: end;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  ${KpiCard} strong {
    font-size: 1.05rem;
    overflow-wrap: anywhere;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const TableScroll = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    min-width: 1040px;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid var(--line);
    padding: 12px 10px;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--ink-700);
    font-size: 0.76rem;
    font-weight: 900;
  }

  td {
    color: var(--ink-700);
    font-size: 0.86rem;
  }
`;

export const TextStack = styled.div`
  display: grid;
  gap: 3px;

  strong {
    color: var(--ink-900);
  }

  small {
    color: var(--ink-500);
    font-weight: 800;
    overflow-wrap: anywhere;
  }
`;

export const MessageText = styled.small`
  display: -webkit-box;
  max-width: 280px;
  color: var(--ink-500);
  font-weight: 800;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

export const EventList = styled.div`
  display: grid;
  gap: 10px;
`;

export const EventItem = styled.article`
  display: grid;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  strong {
    color: var(--ink-900);
  }

  p {
    margin: 0;
    color: var(--ink-500);
    font-size: 0.84rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  small {
    color: var(--ink-500);
    font-weight: 800;
  }
`;

export const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SelectedLabel = styled.span`
  color: var(--ink-500);
  font-size: 0.78rem;
  font-weight: 900;
`;

function companyWarningBackground(status: CertificateStatus): string {
  if (status === 'warning') return 'rgba(201, 163, 74, 0.16)';
  if (status === 'ok') return 'rgba(31, 157, 85, 0.12)';
  return 'rgba(201, 52, 63, 0.1)';
}

function companyWarningColor(status: CertificateStatus): string {
  if (status === 'warning') return 'var(--gold-600)';
  if (status === 'ok') return 'var(--green-600)';
  return 'var(--red-600)';
}
