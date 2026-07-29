import type { AppState } from '../../../../app/app-state';
import { escapeHtml } from '../../../../shared/utils/dom';
import { formatDocument } from '../../../../shared/utils/formatters';
import { serviceOptionLabel } from '../../../services/service-labels';

export function renderNewNoteView(state: AppState): string {
  const activeClients = state.clientes.filter((cliente) => cliente.ativo);
  const activeServices = state.servicos.filter((servico) => servico.ativo);
  const serieDps = state.configuracaoFiscal?.serieDpsPadrao || '1';
  const codigoMunicipioPrestacao = state.empresa?.codigoMunicipioIbge || '';

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">NFS-e</p>
        <h1>Nova nota</h1>
        <p>Preencha os dados, gere o rascunho e confira antes de emitir.</p>
      </div>
    </section>
    <section class="form-panel">
      <form id="note-form" class="form-grid">
        <input type="hidden" name="serieDps" value="${escapeHtml(serieDps)}" />
        <input type="hidden" name="codigoMunicipioPrestacao" value="${escapeHtml(codigoMunicipioPrestacao)}" />
        <input type="hidden" name="dataCompetencia" value="${todayInputValue()}" />
        <div class="form-grid two note-main-row">
          <div class="field note-client-field">
            <label for="clienteBusca">Cliente</label>
            <input id="clienteId" name="clienteId" type="hidden" />
            <input
              id="clienteBusca"
              name="clienteBusca"
              list="clientesOptions"
              data-client-search
              autocomplete="off"
              placeholder="Digite nome, CPF ou CNPJ"
              required
            />
            <datalist id="clientesOptions">
              ${activeClients.map((cliente) => `<option value="${escapeHtml(clientOptionLabel(cliente))}"></option>`).join('')}
            </datalist>
            <small class="field-help note-client-help" data-client-search-status></small>
          </div>
          <div class="field">
            <label for="servicoId">Servico</label>
            <select id="servicoId" name="servicoId" required>
              <option value="">Selecione</option>
              ${activeServices.map((servico) => `<option value="${servico.id}">${escapeHtml(serviceOptionLabel(servico))}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="valorServico">Valor do servico</label>
          <input
            id="valorServico"
            name="valorServico"
            inputmode="decimal"
            placeholder="Ex.: 200 ou 200,00"
            required
          />
        </div>
        <div class="field">
          <label for="descricao">Descricao</label>
          <textarea id="descricao" name="descricao" required></textarea>
        </div>
        <button class="primary-btn" type="submit">Gerar rascunho</button>
      </form>
    </section>
  `;
}

function clientOptionLabel(cliente: AppState['clientes'][number]): string {
  return `${cliente.nomeRazaoSocial} | ${formatDocument(cliente.cpfCnpj)}`;
}

function todayInputValue(): string {
  const date = new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 10);
}
