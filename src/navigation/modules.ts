import type { AppView } from '../types/app';

export interface NavItem {
  view: AppView;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Painel', icon: 'IN' },
  { view: 'clients', label: 'Clientes', icon: 'CL' },
  { view: 'services', label: 'Serviços', icon: 'SV' },
  { view: 'company', label: 'Certificado Digital', icon: 'CD' },
];
