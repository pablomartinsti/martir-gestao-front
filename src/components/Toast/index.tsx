import type { ToastState } from '../../types/app';
import { ToastBox } from './styles';

interface ToastProps {
  toast: ToastState;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) {
    return null;
  }

  return <ToastBox $type={toast.type}>{toast.message}</ToastBox>;
}
