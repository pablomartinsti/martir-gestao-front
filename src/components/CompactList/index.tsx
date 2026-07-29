import type { ReactNode } from 'react';

import { Empty } from '../ui';
import { Actions, Copy, Item, List } from './styles';

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
