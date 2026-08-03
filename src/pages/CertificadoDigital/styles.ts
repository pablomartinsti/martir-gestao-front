import styled from 'styled-components';

type CertificateStatus = 'ok' | 'warning' | 'expired' | 'missing';

export const CertificateBox = styled.div`
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-soft);
  padding: 16px;
`;

export const CertificateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const Expiry = styled.div<{ $status: CertificateStatus }>`
  display: grid;
  gap: 3px;
  border: 1px solid ${({ $status }) => expiryBorder($status)};
  border-radius: 8px;
  background: ${({ $status }) => expiryBackground($status)};
  padding: 12px 14px;
  margin-bottom: 14px;

  strong {
    color: var(--ink-900);
  }

  span {
    color: var(--ink-500);
    font-size: 0.86rem;
    font-weight: 800;
  }
`;

export const PasswordRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;

export const Hint = styled.small`
  display: block;
  margin-top: 10px;
  color: var(--ink-500);
  font-weight: 800;
`;

function expiryBackground(status: CertificateStatus): string {
  if (status === 'ok') return 'rgba(31, 157, 85, 0.08)';
  if (status === 'warning') return 'rgba(201, 163, 74, 0.14)';
  return 'rgba(201, 52, 63, 0.08)';
}

function expiryBorder(status: CertificateStatus): string {
  if (status === 'ok') return 'rgba(31, 157, 85, 0.22)';
  if (status === 'warning') return 'rgba(201, 163, 74, 0.3)';
  return 'rgba(201, 52, 63, 0.2)';
}
