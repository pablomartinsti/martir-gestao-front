import './styles.css';
import type { AppState } from '../../app/app-state';
import { escapeHtml } from '../../utils/dom';

export function renderToast(state: AppState): string {
  if (!state.toast) {
    return '';
  }

  return `<div class="toast ${state.toast.type}">${escapeHtml(state.toast.message)}</div>`;
}
