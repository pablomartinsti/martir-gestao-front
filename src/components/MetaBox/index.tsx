import type { ReactNode } from 'react';

import { Box } from './styles';
export { MetaGrid } from './styles';

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
