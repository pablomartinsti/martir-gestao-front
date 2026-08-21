import type { Dispatch, SetStateAction } from 'react';

import { createClient, updateClient } from '../services/clientsApi';
import type { ApiClient } from '../services/httpClient';
import { compactBody, onlyNumbers, textField } from '../utils/forms';
import type { ShowToast } from './useToast';

interface UseClientsActionsParams {
  api: ApiClient;
  editingClientId: string;
  refreshResources: () => Promise<void>;
  setEditingClientId: Dispatch<SetStateAction<string>>;
  showToast: ShowToast;
}

export function useClientsActions({
  api,
  editingClientId,
  refreshResources,
  setEditingClientId,
  showToast,
}: UseClientsActionsParams) {
  async function submitClient(formData: FormData) {
    const document = textField(formData, 'cpfCnpj');
    const documentDigits = onlyNumbers(document);

    if (!editingClientId && documentDigits.length !== 11 && documentDigits.length !== 14) {
      throw new Error('Informe um CPF com 11 digitos ou CNPJ com 14 digitos.');
    }

    const payload = compactBody({
      bairro: textField(formData, 'bairro'),
      cep: textField(formData, 'cep'),
      cidade: textField(formData, 'cidade'),
      codigoMunicipioIbge: textField(formData, 'codigoMunicipioIbge'),
      complemento: textField(formData, 'complemento'),
      email: textField(formData, 'email'),
      endereco: textField(formData, 'endereco'),
      nomeRazaoSocial: textField(formData, 'nomeRazaoSocial'),
      numero: textField(formData, 'numero'),
      telefone: textField(formData, 'telefone'),
      uf: textField(formData, 'uf').toUpperCase(),
    });

    if (editingClientId) {
      await updateClient(api, editingClientId, payload);
      setEditingClientId('');
      await refreshResources();
      showToast('Cliente atualizado.', 'success');
      return;
    }

    await createClient(api, {
      ...payload,
      cpfCnpj: document,
    });
    await refreshResources();
    showToast('Cliente cadastrado.', 'success');
  }

  return {
    submitClient,
  };
}
