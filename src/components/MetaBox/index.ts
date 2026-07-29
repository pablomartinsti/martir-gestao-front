import { escapeHtml } from '../../shared/utils/dom';

export function renderMetaBox(label: string, value: string): string {
  return `
    <div class="meta-box">
      <span>${label}</span>
      <strong>${escapeHtml(value || '-')}</strong>
    </div>
  `;
}
