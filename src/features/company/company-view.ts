import type { AppState } from '../../app/app-state';
import { formatDateOnly, formatDocument } from '../../shared/utils/formatters';

export function renderCompanyView(state: AppState): string {
  const empresa = state.empresa;
  const config = state.configuracaoFiscal;
  const canManageFiscal =
    state.usuario?.perfil === 'DONO' || state.usuario?.perfil === 'ADMIN';
  const certificateConfigured =
    Boolean(config?.certificadoA1Configurado) || config?.certificadoA1SenhaConfigurada;
  const certificateLabel = certificateConfigured ? 'Configurado' : 'Nao configurado';
  const certificateExpiry = certificateConfigured
    ? config?.certificadoA1ValidoAte
      ? `Vence em ${formatDateOnly(config.certificadoA1ValidoAte)}`
      : 'Validade nao informada'
    : 'Envie o certificado A1 para emitir em producao.';

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">Empresa</p>
        <h1>${empresa?.razaoSocial || 'Empresa'}</h1>
        <p>${formatDocument(empresa?.cnpj) || ''}</p>
      </div>
    </section>
    <div class="main-stack">
      ${
        canManageFiscal
          ? `
      <section class="form-panel">
        <div class="panel-title"><h2>Certificado digital</h2></div>
        <form id="fiscal-config-form" class="form-grid">
          <div class="certificate-box">
            <div class="panel-title">
              <h3>Certificado A1</h3>
              <div class="certificate-actions">
                <span class="status ${certificateConfigured ? 'emitida' : 'rascunho'}">${certificateLabel}</span>
                ${
                  certificateConfigured
                    ? '<button class="danger-btn compact" type="button" data-action="remove-certificate-a1">Remover certificado</button>'
                    : ''
                }
              </div>
            </div>
            <strong class="certificate-expiry">${certificateExpiry}</strong>
            <div class="form-grid two">
              <div class="field">
                <label for="certificadoA1Arquivo">Arquivo</label>
                <input id="certificadoA1Arquivo" name="certificadoA1Arquivo" type="file" accept=".pfx,.p12" />
              </div>
              <div class="field">
                <label for="certificadoA1Senha">Senha do certificado</label>
                <div class="password-control">
                  <input id="certificadoA1Senha" name="certificadoA1Senha" type="password" autocomplete="off" />
                  <button class="action-btn password-toggle" type="button" data-action="toggle-password" data-target="certificadoA1Senha" aria-label="Mostrar senha" title="Mostrar senha">Ver</button>
                </div>
              </div>
            </div>
            <small class="field-help">Use arquivo A1 .pfx ou .p12.</small>
          </div>
          <button class="primary-btn" type="submit">Salvar certificado</button>
        </form>
      </section>
          `
          : ''
      }
    </div>
  `;
}
