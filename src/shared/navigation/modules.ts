import type { AppView } from '../../app/app-state';

export interface NavItem {
  view: AppView;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: 'IN' },
  { view: 'notes', label: 'Notas de Servico', icon: 'NF' },
  { view: 'new-note', label: 'Nova Nota', icon: '+' },
  { view: 'reports', label: 'Relatorios', icon: 'RL' },
  { view: 'clients', label: 'Clientes', icon: 'CL' },
  { view: 'services', label: 'Servicos', icon: 'SV' },
  { view: 'company', label: 'Empresa', icon: 'EP' },
  { view: 'users', label: 'Usuarios', icon: 'US' },
];
