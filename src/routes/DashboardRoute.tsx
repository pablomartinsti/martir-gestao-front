import type { AppState } from '../hooks/useAppState';
import { DashboardPage } from '../pages/Painel';

interface DashboardRouteProps {
  app: AppState;
}

export function DashboardRoute({ app }: DashboardRouteProps) {
  return (
    <DashboardPage
      state={app.data}
      dashboardStartDate={app.dashboardStartDate}
      dashboardEndDate={app.dashboardEndDate}
      onNavigate={app.actions.navigate}
      onDashboardRange={app.actions.submitDashboardRange}
    />
  );
}
