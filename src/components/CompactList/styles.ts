import styled from 'styled-components';

export const List = styled.div`
  display: grid;
  gap: 10px;
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 12px;

  @media (max-width: 820px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Copy = styled.div`
  display: grid;
  min-width: 0;
  gap: 4px;

  strong {
    color: var(--ink-900);
  }

  span {
    color: var(--ink-500);
    font-size: 0.84rem;
  }
`;

export const Actions = styled.div`
  flex: 0 0 auto;

  @media (max-width: 820px) {
    display: flex;
    justify-content: flex-start;
  }
`;
