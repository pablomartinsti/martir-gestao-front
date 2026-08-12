import styled, { css } from 'styled-components';

type ButtonTone = 'primary' | 'ghost' | 'danger' | 'action' | 'icon';

export const Page = styled.main`
  padding: 24px 28px 34px;

  @media (max-width: 820px) {
    padding: 18px 14px 28px;
  }
`;

export const SectionHead = styled.section`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;

  h1,
  h2 {
    margin: 0;
    color: var(--ink-900);
    font-size: clamp(1.45rem, 2.1vw, 2.2rem);
    letter-spacing: 0;
  }

  p {
    max-width: 680px;
    margin: 6px 0 0;
    color: var(--ink-500);
    line-height: 1.5;
  }

  @media (max-width: 820px) {
    flex-direction: column;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 4px;
  color: var(--gold-600);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Stack = styled.section`
  display: grid;
  gap: 18px;
`;

export const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 18px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const ResourceGrid = styled.section<{ $wideForm?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $wideForm }) =>
    $wideForm ? 'minmax(400px, 460px) minmax(0, 1fr)' : 'minmax(280px, 360px) minmax(0, 1fr)'};
  gap: 18px;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: 0 10px 28px rgba(13, 24, 58, 0.07);
  padding: 18px;
`;

export const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h2,
  h3 {
    margin: 0;
    font-size: 1rem;
  }
`;

export const FormGrid = styled.form<{ $columns?: 1 | 2 | 3 }>`
  display: grid;
  gap: 14px;
  grid-template-columns: ${({ $columns = 1 }) => `repeat(${$columns}, minmax(0, 1fr))`};

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Grid = styled.div<{ $columns?: 1 | 2 | 3 }>`
  display: grid;
  gap: 14px;
  grid-template-columns: ${({ $columns = 1 }) => `repeat(${$columns}, minmax(0, 1fr))`};

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: grid;
  align-content: start;
  gap: 7px;
  color: var(--ink-700);
  font-size: 0.82rem;
  font-weight: 800;

  input,
  select,
  textarea {
    width: 100%;
    min-height: 42px;
    border: 1px solid var(--line-strong);
    border-radius: 6px;
    background: #ffffff;
    color: var(--ink-900);
    padding: 10px 12px;
    outline: 0;
  }

  textarea {
    min-height: 90px;
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--blue-650);
    box-shadow: 0 0 0 3px rgba(37, 87, 214, 0.12);
  }
`;

export const FieldHelp = styled.small<{ $status?: 'success' | 'error' | '' }>`
  min-height: 16px;
  color: ${({ $status }) =>
    $status === 'success'
      ? 'var(--green-600)'
      : $status === 'error'
        ? 'var(--red-600)'
        : 'var(--ink-500)'};
  font-size: 0.75rem;
  font-weight: 800;
`;

const buttonTone = {
  primary: css`
    background: linear-gradient(135deg, var(--gold-500), var(--gold-600));
    color: #1d2342;
    padding: 0 18px;
  `,
  ghost: css`
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--ink-700);
    padding: 0 14px;
  `,
  danger: css`
    background: rgba(201, 52, 63, 0.1);
    color: var(--red-600);
    padding: 0 14px;
  `,
  action: css`
    min-height: 32px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink-700);
    padding: 0 10px;
    font-size: 0.78rem;
  `,
  icon: css`
    width: 40px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink-700);
  `,
};

export const Button = styled.button<{ $tone?: ButtonTone; $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: ${({ $compact }) => ($compact ? '32px' : '40px')};
  border-radius: 6px;
  font-weight: 800;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
  ${({ $tone = 'primary' }) => buttonTone[$tone]}
  ${({ $compact }) =>
    $compact &&
    css`
      padding: 0 10px;
      font-size: 0.78rem;
    `}

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.68;
    transform: none;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const Empty = styled.div<{ $compact?: boolean }>`
  display: grid;
  min-height: ${({ $compact }) => ($compact ? '70px' : '180px')};
  place-items: center;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  color: var(--ink-500);
  text-align: center;
`;

export const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 0 9px;
  font-size: 0.74rem;
  font-weight: 900;
  background: ${({ $status }) => statusBackground($status)};
  color: ${({ $status }) => statusColor($status)};
`;

function statusBackground(status?: string): string {
  if (status === 'EMITIDA') return 'rgba(31, 157, 85, 0.12)';
  if (status === 'ERRO') return 'rgba(201, 52, 63, 0.1)';
  if (status === 'CANCELADA' || status === 'SUBSTITUIDA' || status === 'ERRO_RESOLVIDO') return 'rgba(104, 112, 141, 0.13)';
  return 'rgba(37, 87, 214, 0.1)';
}

function statusColor(status?: string): string {
  if (status === 'EMITIDA') return 'var(--green-600)';
  if (status === 'ERRO') return 'var(--red-600)';
  if (status === 'CANCELADA' || status === 'SUBSTITUIDA' || status === 'ERRO_RESOLVIDO') return 'var(--ink-500)';
  return 'var(--blue-650)';
}
