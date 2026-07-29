import styled from 'styled-components';

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

export const Expiry = styled.strong`
  display: block;
  margin-bottom: 14px;
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
