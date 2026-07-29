import type { AppState } from '../../app/app-state';
import type { Cliente } from '../../domain/models';
import { escapeHtml } from '../../shared/utils/dom';
import { formatDocument } from '../../shared/utils/formatters';
import { renderCompactList } from '../shared/list-view';

export function renderClientsView(state: AppState): string {
  const editingClient = state.clientes.find((cliente) => cliente.id === state.editingClientId);
  const isEditing = Boolean(editingClient);

  return `
    <section class="section-head">
      <div>
        <p class="eyebrow">Cadastro</p>
        <h1>Clientes</h1>
        <p>Cadastre e atualize os tomadores das notas.</p>
      </div>
    </section>
    <section class="resource-grid clients-resource-grid">
      <div class="form-panel">
        <div class="panel-title">
          <h2>${isEditing ? 'Editar cliente' : 'Novo cliente'}</h2>
          ${isEditing ? '<span class="status rascunho">Editando</span>' : ''}
        </div>
        <form id="client-form" class="form-grid">
          <div class="field">
            <label for="nomeRazaoSocial">Nome/Razao social</label>
            <input id="nomeRazaoSocial" name="nomeRazaoSocial" value="${clientValue(editingClient, 'nomeRazaoSocial')}" required />
          </div>
          <div class="field">
            <label for="cpfCnpj">CPF/CNPJ</label>
            <input id="cpfCnpj" name="cpfCnpj" value="${clientValue(editingClient, 'cpfCnpj')}" ${isEditing ? 'disabled' : 'required'} />
            <div class="field-inline-actions">
              <button class="action-btn" type="button" data-action="client-fetch-cnpj">Consultar CNPJ</button>
              <small class="field-help" data-cnpj-status></small>
            </div>
          </div>
          <div class="form-grid two">
            <div class="field">
              <label for="clienteCidade">Cidade</label>
              <input id="clienteCidade" name="cidade" value="${clientValue(editingClient, 'cidade')}" required />
            </div>
            <div class="field">
              <label for="clienteUf">UF</label>
              <input id="clienteUf" name="uf" value="${clientValue(editingClient, 'uf')}" maxlength="2" required />
            </div>
          </div>
          <div class="field">
            <label for="clienteCodigoMunicipioIbge">Codigo IBGE da cidade</label>
            <input id="clienteCodigoMunicipioIbge" name="codigoMunicipioIbge" value="${clientValue(editingClient, 'codigoMunicipioIbge')}" maxlength="7" inputmode="numeric" />
          </div>
          <div class="field">
            <label for="clienteEmail">E-mail</label>
            <input id="clienteEmail" name="email" type="email" value="${clientValue(editingClient, 'email')}" />
          </div>
          <div class="form-grid two">
            <div class="field">
              <label for="clienteTelefone">Telefone</label>
              <input id="clienteTelefone" name="telefone" value="${clientValue(editingClient, 'telefone')}" />
            </div>
            <div class="field">
              <label for="clienteCep">CEP</label>
              <input id="clienteCep" name="cep" value="${clientValue(editingClient, 'cep')}" />
              <small class="field-help" data-cep-status></small>
            </div>
          </div>
          <div class="field">
            <label for="clienteEndereco">Endereco</label>
            <input id="clienteEndereco" name="endereco" value="${clientValue(editingClient, 'endereco')}" />
          </div>
          <div class="form-grid two">
            <div class="field">
              <label for="clienteNumero">Numero</label>
              <input id="clienteNumero" name="numero" value="${clientValue(editingClient, 'numero')}" />
            </div>
            <div class="field">
              <label for="clienteBairro">Bairro</label>
              <input id="clienteBairro" name="bairro" value="${clientValue(editingClient, 'bairro')}" />
            </div>
          </div>
          <div class="form-actions">
            <button class="primary-btn" type="submit">${isEditing ? 'Salvar cliente' : 'Cadastrar cliente'}</button>
            ${isEditing ? '<button class="ghost-btn" type="button" data-action="client-cancel-edit">Cancelar</button>' : ''}
          </div>
        </form>
      </div>
      <div class="panel">
        <div class="panel-title"><h2>Clientes cadastrados</h2></div>
        ${renderCompactList(
          state.clientes,
          (cliente) => cliente.nomeRazaoSocial,
          clientMeta,
          (cliente) => `<button class="action-btn" data-action="client-edit" data-id="${escapeHtml(cliente.id)}">Editar</button>`,
        )}
      </div>
    </section>
  `;
}

function clientValue(cliente: Cliente | undefined, field: keyof Cliente): string {
  return escapeHtml(cliente?.[field] || '');
}

function clientMeta(cliente: Cliente): string {
  const contato = [cliente.email, cliente.telefone].filter(Boolean).join(' / ') || 'sem contato';
  const endereco =
    [cliente.endereco, cliente.numero, cliente.bairro].filter(Boolean).join(', ') || 'endereco pendente';
  const codigoIbge = cliente.codigoMunicipioIbge ? `IBGE ${cliente.codigoMunicipioIbge}` : 'IBGE pendente';

  return [
    formatDocument(cliente.cpfCnpj),
    `${cliente.cidade}/${cliente.uf}`,
    contato,
    endereco,
    codigoIbge,
    cliente.ativo ? 'Ativo' : 'Inativo',
  ].join(' | ');
}
