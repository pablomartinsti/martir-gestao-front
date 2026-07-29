import type { ReactNode } from 'react';
import styled from 'styled-components';

import { Empty } from '../ui';

interface CompactListProps<T> {
  items: T[];
  title: (item: T) => string;
  meta: (item: T) => string;
  actions?: (item: T) => ReactNode;
}

export function CompactList<T>({ items, title, meta, actions }: CompactListProps<T>) {
  if (!items.length) {
    return <Empty>Nenhum registro encontrado.</Empty>;
  }

  return (
    <List>
      {items.map((item, index) => (
        <Item key={itemKey(item, index)}>
          <Copy>
            <strong>{title(item)}</strong>
            <span>{meta(item)}</span>
          </Copy>
          {actions ? <Actions>{actions(item)}</Actions> : null}
        </Item>
      ))}
    </List>
  );
}

function itemKey(item: unknown, index: number): string {
  if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
    return item.id;
  }

  return String(index);
}

const List = styled.div`
  display: grid;
  gap: 10px;
`;

const Item = styled.div`
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

const Copy = styled.div`
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

const Actions = styled.div`
  flex: 0 0 auto;

  @media (max-width: 820px) {
    display: flex;
    justify-content: flex-start;
  }
`;
