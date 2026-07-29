import styled from 'styled-components';

export const ToastBox = styled.div<{ $type?: string }>`
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 30;
  max-width: min(420px, calc(100vw - 44px));
  border-radius: var(--radius);
  background: ${({ $type }) =>
    $type === 'error' ? '#811d26' : $type === 'success' ? '#16633b' : 'var(--navy-950)'};
  color: #ffffff;
  box-shadow: var(--shadow);
  padding: 14px 16px;
`;
