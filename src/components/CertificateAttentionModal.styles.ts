import styled from 'styled-components';

export const AttentionBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18), transparent 34%),
    rgba(7, 8, 43, 0.76);
  padding: 20px;
`;

export const AttentionDialog = styled.article`
  width: min(540px, 100%);
  overflow: hidden;
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 26px 70px rgba(7, 8, 43, 0.38);

  > div {
    display: grid;
    gap: 16px;
    padding: 18px;
  }

  p {
    margin: 0;
    color: var(--ink-700);
    line-height: 1.45;
  }
`;

export const AttentionHead = styled.header`
  background: #f47a2a;
  padding: 16px 18px;
  text-align: center;

  h2 {
    margin: 0;
    color: #ffffff;
    font-size: 1.1rem;
  }
`;

export const AttentionTableWrap = styled.div`
  max-height: 240px;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: 6px;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid var(--line);
    padding: 9px 10px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: var(--surface-soft);
    color: var(--ink-700);
    font-size: 0.76rem;
    font-weight: 900;
  }

  td {
    color: var(--ink-700);
    font-size: 0.84rem;
  }

  td strong,
  td small {
    display: block;
  }

  td strong {
    color: var(--ink-900);
    overflow-wrap: anywhere;
  }

  td small {
    margin-top: 2px;
    color: var(--ink-500);
    font-size: 0.74rem;
    font-weight: 800;
  }

  span {
    font-weight: 900;
  }

  span[data-status='expired'],
  span[data-status='missing'] {
    color: var(--red-600);
  }

  span[data-status='warning'] {
    color: #b65f00;
  }
`;

export const Actions = styled.div`
  display: grid;
  gap: 10px;
`;
