import styled from 'styled-components';

export const SearchBox = styled.label`
  display: flex;
  min-width: min(420px, 100%);
  flex: 1;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  background: #ffffff;
  padding: 0 12px;

  input {
    min-height: 40px;
    flex: 1;
    border: 0;
    outline: 0;
  }
`;

export const TableScroll = styled.div`
  overflow-x: auto;

  table {
    width: 100%;
    min-width: 860px;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid var(--line);
    padding: 12px 10px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: var(--ink-700);
    font-size: 0.78rem;
    font-weight: 900;
  }

  td {
    color: var(--ink-700);
    font-size: 0.88rem;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
`;

export const Muted = styled.span`
  display: block;
  margin-top: 4px;
  color: var(--ink-500);
  font-size: 0.78rem;
  font-weight: 800;
`;
