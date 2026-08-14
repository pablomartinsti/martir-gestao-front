import type { AppState } from '../hooks/useAppState';
import { LoginPage } from '../pages/Login';

interface GuestRoutesProps {
  app: AppState;
}

export function GuestRoutes({ app }: GuestRoutesProps) {
  return (
    <LoginPage
      authMode={app.authMode}
      onAuthModeChange={app.actions.setAuthMode}
      onLogin={(formData) => app.actions.safely(() => app.actions.submitLogin(formData))}
      onOnboard={(formData) => app.actions.safely(() => app.actions.submitOnboarding(formData))}
    />
  );
}
