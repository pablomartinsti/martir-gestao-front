import { useRef, useState } from 'react';

import type { ToastState } from '../types/app';
import { messageFromError } from './hookUtils';

type ToastType = NonNullable<ToastState>['type'];

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeout = useRef<number | null>(null);

  function showToast(message: string, type: ToastType = '') {
    setToast({ message, type });

    if (toastTimeout.current) {
      window.clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = window.setTimeout(() => {
      setToast(null);
    }, 3600);
  }

  async function safely(operation: () => Promise<void>) {
    try {
      await operation();
    } catch (error) {
      showToast(messageFromError(error), 'error');
    }
  }

  return {
    safely,
    showToast,
    toast,
  };
}

export type ShowToast = ReturnType<typeof useToast>['showToast'];
