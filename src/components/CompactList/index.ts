import { escapeHtml } from '../../utils/dom';

export function renderCompactList<T>(
  items: T[],
  titleFn: (item: T) => string,
  metaFn: (item: T) => string,
  actionsFn?: (item: T) => string,
): string {
  if (!items.length) {
    return '<div class="empty">Nenhum registro encontrado.</div>';
  }

  return `
    <div class="compact-list">
      ${items
        .map(
          (item) => `
            <div class="list-item">
              <div class="list-copy">
                <strong>${escapeHtml(titleFn(item) || '-')}</strong>
                <span>${escapeHtml(metaFn(item) || '-')}</span>
              </div>
              ${actionsFn ? `<div class="list-actions">${actionsFn(item)}</div>` : ''}
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}
