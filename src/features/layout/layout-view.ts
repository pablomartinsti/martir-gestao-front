import type { AppState } from '../../app/app-state';
import { navItems } from '../../shared/navigation/modules';
import { escapeHtml } from '../../shared/utils/dom';
import { formatDocument, getInitials } from '../../shared/utils/formatters';

export function renderAppShell(state: AppState, content: string): string {
  return `
    <div class="app-shell">
      ${renderSidebar(state)}
      <section class="workspace">
        ${renderTopbar(state)}
        <main class="content">
          ${state.loading ? renderLoading() : content}
        </main>
      </section>
    </div>
  `;
}

export function renderSidebar(state: AppState): string {
  const empresa = state.empresa;
  const canManageSettings = canManageCompanySettings(state);
  const visibleNavItems = navItems.filter(
    (item) => canManageSettings || item.view !== 'company',
  );

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <img class="sidebar-logo" src="/assets/martir-logo.png" alt="Martir Contabil" />
      </div>
      <div class="sidebar-section-title">Modulo NFS-e</div>
      <nav class="side-nav" aria-label="Navegacao principal">
        ${visibleNavItems
          .map(
            (item) => `
              <button class="nav-item ${state.view === item.view ? 'active' : ''}" data-action="switch-view" data-view="${item.view}">
                <span class="nav-icon">${item.icon}</span>
                <strong>${item.label}</strong>
              </button>
            `,
          )
          .join('')}
      </nav>
      <div class="sidebar-company">
        <small>Empresa ativa</small>
        <strong>${escapeHtml(empresa?.razaoSocial || empresa?.nomeFantasia || 'Martir Contabil')}</strong>
        <span>CNPJ<br />${formatDocument(empresa?.cnpj) || '-'}</span>
      </div>
    </aside>
  `;
}

export function renderTopbar(state: AppState): string {
  const empresaNome = state.empresa?.razaoSocial || state.empresa?.nomeFantasia || 'Empresa ativa';
  const canManageSettings = canManageCompanySettings(state);
  const companyPickerContent = `
    <span>Empresa ativa</span>
    <strong>${escapeHtml(empresaNome)}</strong>
  `;

  return `
    <header class="topbar">
      <div class="brand-inline">
        <span>Martir Gestao</span>
      </div>
      <div class="topbar-center">
        ${
          canManageSettings
            ? `<button class="company-picker" data-action="switch-view" data-view="company">${companyPickerContent}</button>`
            : `<div class="company-picker readonly">${companyPickerContent}</div>`
        }
      </div>
      <div class="topbar-actions">
        <span class="avatar">${getInitials(state.usuario?.nome || state.usuario?.email || 'MC')}</span>
        <button class="ghost-btn" data-action="logout" aria-label="Sair">Sair</button>
      </div>
    </header>
  `;
}

export function renderLoading(): string {
  return '<section class="empty">Carregando dados...</section>';
}

function canManageCompanySettings(state: AppState): boolean {
  return state.usuario?.perfil === 'DONO' || state.usuario?.perfil === 'ADMIN';
}
