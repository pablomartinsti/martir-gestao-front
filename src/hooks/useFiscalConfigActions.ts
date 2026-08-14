import { configureCertificateA1, updateFiscalConfig } from '../services/companyApi';
import type { ApiClient } from '../services/httpClient';
import type { AppDataState } from '../types/app';
import type { AmbienteFiscal } from '../types/models';
import { fileToBase64, textField } from '../utils/forms';
import type { ShowToast } from './useToast';

interface UseFiscalConfigActionsParams {
  api: ApiClient;
  data: AppDataState;
  refreshResources: () => Promise<void>;
  showToast: ShowToast;
}

export function useFiscalConfigActions({
  api,
  data,
  refreshResources,
  showToast,
}: UseFiscalConfigActionsParams) {
  async function submitFiscalConfig(formData: FormData) {
    const ambienteFiscalPadrao = String(
      formData.get('ambienteFiscalPadrao') ||
        data.configuracaoFiscal?.ambienteFiscalPadrao ||
        'HOMOLOGACAO',
    ) as AmbienteFiscal;
    const serieDpsPadrao =
      textField(formData, 'serieDpsPadrao') ||
      data.configuracaoFiscal?.serieDpsPadrao ||
      '1';

    await updateFiscalConfig(api, {
      ambienteFiscalPadrao,
      serieDpsPadrao,
    });

    const certificateFile = formData.get('certificadoA1Arquivo');

    if (certificateFile instanceof File && certificateFile.size > 0) {
      const certificatePassword = textField(formData, 'certificadoA1Senha');

      if (!certificatePassword) {
        throw new Error('Informe a senha do certificado A1.');
      }

      await configureCertificateA1(api, {
        certificadoA1Base64: await fileToBase64(certificateFile),
        certificadoA1NomeArquivo: certificateFile.name,
        certificadoA1Senha: certificatePassword,
      });
    }

    await refreshResources();
    showToast('Certificado salvo.', 'success');
  }

  async function removeCertificateA1() {
    if (
      !data.configuracaoFiscal?.certificadoA1Configurado &&
      !data.configuracaoFiscal?.certificadoA1SenhaConfigurada
    ) {
      showToast('Nao ha certificado configurado para remover.', 'error');
      return;
    }

    if (
      !window.confirm(
        'Remover o certificado A1 salvo? Para emitir novas notas sera necessario enviar outro certificado.',
      )
    ) {
      return;
    }

    await updateFiscalConfig(api, {
      ambienteFiscalPadrao: data.configuracaoFiscal.ambienteFiscalPadrao || 'PRODUCAO',
      removerCertificadoA1: true,
      serieDpsPadrao: data.configuracaoFiscal.serieDpsPadrao || '1',
    });

    await refreshResources();
    showToast('Certificado removido do banco.', 'success');
  }

  return {
    removeCertificateA1,
    submitFiscalConfig,
  };
}
