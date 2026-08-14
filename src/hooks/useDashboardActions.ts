import type { Dispatch, SetStateAction } from 'react';

import type { ShowToast } from './useToast';

interface UseDashboardActionsParams {
  setDashboardEndDate: Dispatch<SetStateAction<string>>;
  setDashboardStartDate: Dispatch<SetStateAction<string>>;
  showToast: ShowToast;
}

export function useDashboardActions({
  setDashboardEndDate,
  setDashboardStartDate,
  showToast,
}: UseDashboardActionsParams) {
  function submitDashboardRange(startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      showToast('Informe a data inicial e final do periodo.', 'error');
      return;
    }

    if (startDate > endDate) {
      showToast('A data inicial nao pode ser maior que a data final.', 'error');
      return;
    }

    setDashboardStartDate(startDate);
    setDashboardEndDate(endDate);
  }

  return {
    submitDashboardRange,
  };
}
