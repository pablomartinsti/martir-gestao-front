import type { AppState } from '../../app/app-state';
import { GOOGLE_CLIENT_ID } from '../../config';

export function renderAuth(state: AppState): string {
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
        <div class="auth-card ${state.authMode === 'onboarding' ? 'wide' : ''}">
          <div class="auth-card-head">
            <p class="eyebrow">Acesso</p>
            <h2>${state.authMode === 'onboarding' ? 'Cadastrar empresa' : 'Entrar no painel'}</h2>
          </div>
          <div class="auth-tabs">
            <button class="${state.authMode === 'login' ? 'active' : ''}" data-action="auth-mode" data-mode="login">Entrar</button>
            <button class="${state.authMode === 'onboarding' ? 'active' : ''}" data-action="auth-mode" data-mode="onboarding">Cadastrar</button>
          </div>
          ${state.authMode === 'onboarding' ? renderOnboardingForm() : renderLoginForm()}
        </div>
      </div>
    </section>
  `;
}

function renderLoginForm(): string {
  return `
    <form id="login-form" class="form-grid">
      ${GOOGLE_CLIENT_ID ? renderGoogleLogin() : ''}
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

function renderGoogleLogin(): string {
  return `
    <div class="google-login">
      <div id="google-login-button"></div>
      <small data-google-login-status></small>
    </div>
    <div class="auth-divider"><span>ou</span></div>
  `;
}

function renderOnboardingForm(): string {
  return `
    <form id="onboarding-form" class="form-grid">
      <div class="form-grid two">
        <div class="field">
          <label for="cnpj">CNPJ</label>
          <input id="cnpj" name="cnpj" inputmode="numeric" required />
          <small class="field-help" data-company-cnpj-status></small>
        </div>
        <div class="field">
          <label for="razaoSocial">Razao social</label>
          <input id="razaoSocial" name="razaoSocial" required />
        </div>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="nomeFantasia">Nome fantasia</label>
          <input id="nomeFantasia" name="nomeFantasia" />
        </div>
        <div class="field">
          <label for="regimeTributario">Regime tributario</label>
          <select id="regimeTributario" name="regimeTributario" required>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="MEI">MEI</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
          </select>
        </div>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="empresaEmail">E-mail da empresa</label>
          <input id="empresaEmail" name="empresaEmail" type="email" />
        </div>
        <div class="field">
          <label for="telefone">Telefone</label>
          <input id="telefone" name="telefone" />
        </div>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="cep">CEP</label>
          <input id="cep" name="cep" inputmode="numeric" />
          <small class="field-help" data-company-cep-status></small>
        </div>
        <div class="field">
          <label for="endereco">Endereco</label>
          <input id="endereco" name="endereco" />
        </div>
      </div>
      <div class="form-grid three">
        <div class="field">
          <label for="numero">Numero</label>
          <input id="numero" name="numero" />
        </div>
        <div class="field">
          <label for="bairro">Bairro</label>
          <input id="bairro" name="bairro" />
        </div>
        <div class="field">
          <label for="cidade">Cidade</label>
          <input id="cidade" name="cidade" required />
        </div>
      </div>
      <div class="form-grid three">
        <div class="field">
          <label for="uf">UF</label>
          <input id="uf" name="uf" maxlength="2" required />
        </div>
        <div class="field">
          <label for="codigoMunicipioIbge">Codigo municipio IBGE</label>
          <input id="codigoMunicipioIbge" name="codigoMunicipioIbge" inputmode="numeric" />
        </div>
        <div class="field">
          <label for="inscricaoMunicipal">Inscricao municipal</label>
          <input id="inscricaoMunicipal" name="inscricaoMunicipal" />
        </div>
      </div>
      <div class="form-grid two">
        <div class="field">
          <label for="nome">Nome do responsavel</label>
          <input id="nome" name="nome" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="ownerEmail">E-mail de acesso</label>
          <input id="ownerEmail" name="email" type="email" autocomplete="email" required />
        </div>
      </div>
      <div class="field">
        <label for="ownerSenha">Senha</label>
        <div class="password-control">
          <input id="ownerSenha" name="senha" type="password" minlength="8" autocomplete="new-password" required />
          <button class="action-btn password-toggle" type="button" data-action="toggle-password" data-target="ownerSenha" aria-label="Mostrar senha" title="Mostrar senha">Ver</button>
        </div>
      </div>
      <button class="primary-btn" type="submit">Criar cadastro</button>
    </form>
  `;
}
