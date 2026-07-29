import type { AppState } from '../../app/app-state';
import { renderCompactList } from '../../components/CompactList';
import { serviceFiscalSummary, serviceTitle } from '../../utils/serviceLabels';

export function renderServicesView(state: AppState): string {
  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">Cadastro</p>
        <h1>Servicos</h1>
        <p>Cadastre os servicos usados na emissao das notas.</p>
      </div>
    </section>
    <section class="resource-grid">
      <div class="form-panel">
        <div class="panel-title"><h2>Novo servico</h2></div>
        <form id="service-form" class="form-grid">
          <div class="field">
            <label for="servicoDescricao">Descricao</label>
            <input id="servicoDescricao" name="descricao" required />
          </div>
          <div class="form-grid two">
            <div class="field">
              <label for="codigoServico">Codigo servico</label>
              <input id="codigoServico" name="codigoServico" required />
            </div>
            <div class="field">
              <label for="aliquotaIss">Aliquota ISS</label>
              <input id="aliquotaIss" name="aliquotaIss" type="number" min="0" max="100" step="0.01" required />
            </div>
          </div>
          <div class="field">
            <label for="codigoTributacaoNacional">Tributacao nacional</label>
            <input id="codigoTributacaoNacional" name="codigoTributacaoNacional" maxlength="6" />
          </div>
          <button class="primary-btn" type="submit">Cadastrar servico</button>
        </form>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Servicos cadastrados</h2></div>
        ${renderCompactList(
          state.servicos,
          serviceTitle,
          (servico) => `${serviceFiscalSummary(servico)} - ${servico.ativo ? 'Ativo' : 'Inativo'}`,
          (servico) => `
            <button
              class="action-btn"
              data-action="service-status"
              data-id="${servico.id}"
              data-active="${servico.ativo ? 'false' : 'true'}"
            >
              ${servico.ativo ? 'Desativar' : 'Ativar'}
            </button>
          `,
        )}
      </div>
    </section>
  `;
}
