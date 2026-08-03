import type { AppView } from '../types/app';

export interface NavItem {
  view: AppView;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Painel', icon: 'IN' },
  { view: 'operational-admin', label: 'Empresas', icon: 'EP', adminOnly: true },
  { view: 'clients', label: 'Clientes', icon: 'CL' },
  { view: 'services', label: 'Serviços', icon: 'SV' },
  { view: 'company', label: 'Certificado Digital', icon: 'CD' },
];
