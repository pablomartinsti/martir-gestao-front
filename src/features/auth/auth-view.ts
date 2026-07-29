import type { AppState } from '../../app/app-state';

export function renderAuth(_state: AppState): string {
  return `
    <section class="auth-shell">
      <div class="auth-brand">
        <img class="auth-logo" src="/assets/martir-logo.png" alt="Martir Contabil" />
        <div class="auth-title">
          <p class="eyebrow">Martir Gestao</p>
          <h1>Painel NFS-e.</h1>
          <p>Emita notas de servico e acompanhe sua rotina fiscal em um lugar simples.</p>
        </div>
      </div>
      <div class="auth-panel">
        <div class="auth-card">
          <div class="auth-card-head">
            <p class="eyebrow">Acesso</p>
            <h2>Entrar no painel</h2>
          </div>
          ${renderLoginForm()}
        </div>
      </div>
    </section>
  `;
}

function renderLoginForm(): string {
  return `
    <form id="login-form" class="form-grid">
      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="senha">Senha</label>
        <div class="password-control">
          <input id="senha" name="senha" type="password" autocomplete="current-password" required />
          <button class="action-btn password-toggle" type="button" data-action="toggle-password" data-target="senha" aria-label="Mostrar senha" title="Mostrar senha">Ver</button>
        </div>
      </div>
      <button class="primary-btn" type="submit">Entrar no painel</button>
    </form>
  `;
}
