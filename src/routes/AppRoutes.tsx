import { Toast } from '../components/Toast';
import { useAppState } from '../hooks/useAppState';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { GuestRoutes } from './GuestRoutes';
import { ModalRoutes } from './ModalRoutes';

export function AppRoutes() {
  const app = useAppState();

  return (
    <>
      {app.token ? <AuthenticatedRoutes app={app} /> : <GuestRoutes app={app} />}
      <ModalRoutes app={app} />
      <Toast toast={app.toast} />
    </>
  );
}
