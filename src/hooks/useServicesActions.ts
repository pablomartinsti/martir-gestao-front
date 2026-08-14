import { createService, updateServiceStatus } from '../services/servicesApi';
import type { ApiClient } from '../services/httpClient';
import { compactBody, textField } from '../utils/forms';
import type { ShowToast } from './useToast';

interface UseServicesActionsParams {
  api: ApiClient;
  refreshResources: () => Promise<void>;
  showToast: ShowToast;
}

export function useServicesActions({
  api,
  refreshResources,
  showToast,
}: UseServicesActionsParams) {
  async function submitService(formData: FormData) {
    await createService(
      api,
      compactBody({
        aliquotaIss: Number(formData.get('aliquotaIss')),
        codigoServico: textField(formData, 'codigoServico'),
        codigoTributacaoNacional: textField(formData, 'codigoTributacaoNacional'),
        descricao: textField(formData, 'descricao'),
      }),
    );

    await refreshResources();
    showToast('Servico cadastrado.', 'success');
  }

  async function changeServiceStatus(serviceId: string, ativo: boolean) {
    if (!ativo && !window.confirm('Desativar este servico? Ele deixara de aparecer na nova nota.')) {
      return;
    }

    await updateServiceStatus(api, serviceId, ativo);
    await refreshResources();
    showToast(ativo ? 'Servico ativado.' : 'Servico desativado.', 'success');
  }

  return {
    changeServiceStatus,
    submitService,
  };
}
