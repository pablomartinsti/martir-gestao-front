import type { AppState } from '../../app/app-state';
import { escapeHtml } from '../../shared/utils/dom';

export function renderAuth(state: AppState): string {
  return `
    <section class="auth-shell">
      <div class="auth-brand">
        <img class="auth-logo" src="/assets/martir-logo.png" alt="Martir Contabil" />
        <div class="auth-title">
          <p class="eyebrow">Martir Gestao</p>
          <h1>Painel modular para rotina fiscal.</h1>
          <p>NFS-e hoje. Novos modulos amanha.</p>
        </div>
      </div>
      <div class="auth-panel">
        <div class="auth-card">
          <div class="auth-tabs">
            <button class="${state.authMode === 'login' ? 'active' : ''}" data-action="auth-mode" data-mode="login">
              Entrar
            </button>
            <button class="${state.authMode === 'onboarding' ? 'active' : ''}" data-action="auth-mode" data-mode="onboarding">
              Primeiro acesso
            </button>
          </div>
          ${state.authMode === 'login' ? renderLoginForm(state) : renderOnboardingForm(state)}
        </div>
      </div>
    </section>
  `;
}

function renderLoginForm(state: AppState): string {
  return `
    <form id="login-form" class="form-grid">
      <div class="field">
        <label for="apiUrl">URL da API</label>
        <input id="apiUrl" name="apiUrl" value="${escapeHtml(state.apiUrl)}" autocomplete="url" />
      </div>
      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="senha">Senha</label>
        <input id="senha" name="senha" type="password" autocomplete="current-password" required />
      </div>
      <button class="primary-btn" type="submit">Entrar no painel</button>
    </form>
  `;
}

function renderOnboardingForm(state: AppState): string {
  return `
    <form id="onboarding-form" class="form-grid">
      <div class="field">
        <label for="onApiUrl">URL da API</label>
        <input id="onApiUrl" name="apiUrl" value="${escapeHtml(state.apiUrl)}" autocomplete="url" />
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="razaoSocial">Razao social</label>
          <input id="razaoSocial" name="razaoSocial" required />
        </div>
        <div class="field">
          <label for="cnpj">CNPJ</label>
          <input id="cnpj" name="cnpj" required />
        </div>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="cidade">Cidade</label>
          <input id="cidade" name="cidade" required />
        </div>
        <div class="field">
          <label for="uf">UF</label>
          <input id="uf" name="uf" maxlength="2" required />
        </div>
      </div>
      <div class="field">
        <label for="regimeTributario">Regime tributario</label>
        <select id="regimeTributario" name="regimeTributario">
          <option value="SIMPLES_NACIONAL">Simples Nacional</option>
          <option value="MEI">MEI</option>
          <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
          <option value="LUCRO_REAL">Lucro Real</option>
        </select>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="nome">Nome do dono</label>
          <input id="nome" name="nome" required />
        </div>
        <div class="field">
          <label for="ownerEmail">E-mail</label>
          <input id="ownerEmail" name="email" type="email" required />
        </div>
      </div>
      <div class="field">
        <label for="ownerSenha">Senha</label>
        <input id="ownerSenha" name="senha" type="password" minlength="8" required />
      </div>
      <button class="primary-btn" type="submit">Criar empresa</button>
    </form>
  `;
}
