import type { ReactNode } from 'react';
import styled from 'styled-components';

interface MetaBoxProps {
  label: string;
  value: ReactNode;
}

export function MetaBox({ label, value }: MetaBoxProps) {
  return (
    <Box>
      <span>{label}</span>
      <strong>{value}</strong>
    </Box>
  );
}

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Box = styled.div`
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 14px;

  span {
    color: var(--ink-500);
    font-size: 0.76rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: var(--ink-900);
  }
`;
