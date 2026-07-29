import type { ReactNode } from 'react';

import { navItems } from '../../navigation/modules';
import type { AppDataState, AppView } from '../../types/app';
import { formatDocument, getInitials } from '../../utils/formatters';
import { Button, Page } from '../ui';
import {
  Avatar,
  BrandInline,
  CompanyBox,
  CompanyPicker,
  Loading,
  NavButton,
  NavIcon,
  Shell,
  Sidebar,
  SidebarCompany,
  SidebarHeader,
  SidebarLogo,
  SidebarSection,
  SideNav,
  Topbar,
  TopbarActions,
  TopbarCenter,
  Workspace,
} from './styles';

interface LayoutProps {
  state: AppDataState;
  view: AppView;
  loading: boolean;
  children: ReactNode;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export function Layout({ state, view, loading, children, onNavigate, onLogout }: LayoutProps) {
  const canManageSettings = state.usuario?.perfil === 'DONO' || state.usuario?.perfil === 'ADMIN';
  const visibleNavItems = navItems.filter((item) => canManageSettings || item.view !== 'company');
  const empresaNome = state.empresa?.razaoSocial || state.empresa?.nomeFantasia || 'Empresa ativa';

  return (
    <Shell>
      <Sidebar>
        <SidebarHeader>
          <SidebarLogo src="/assets/martir-logo.png" alt="Martir Contabil" />
        </SidebarHeader>
        <SidebarSection>Módulo NFS-e</SidebarSection>
        <SideNav aria-label="Navegacao principal">
          {visibleNavItems.map((item) => (
            <NavButton
              key={item.view}
              type="button"
              $active={view === item.view}
              onClick={() => onNavigate(item.view)}
            >
              <NavIcon>{item.icon}</NavIcon>
              <strong>{item.label}</strong>
            </NavButton>
          ))}
        </SideNav>
        <SidebarCompany>
          <small>Empresa ativa</small>
          <strong>{empresaNome}</strong>
          <span>
            CNPJ
            <br />
            {formatDocument(state.empresa?.cnpj) || '-'}
          </span>
        </SidebarCompany>
      </Sidebar>
      <Workspace>
        <Topbar>
          <BrandInline>Martir Gestao</BrandInline>
          <TopbarCenter>
            {canManageSettings ? (
              <CompanyPicker type="button" onClick={() => onNavigate('company')}>
                <span>Empresa ativa</span>
                <strong>{empresaNome}</strong>
              </CompanyPicker>
            ) : (
              <CompanyBox>
                <span>Empresa ativa</span>
                <strong>{empresaNome}</strong>
              </CompanyBox>
            )}
          </TopbarCenter>
          <TopbarActions>
            <Avatar>{getInitials(state.usuario?.nome || state.usuario?.email || 'MC')}</Avatar>
            <Button type="button" $tone="ghost" onClick={onLogout}>
              Sair
            </Button>
          </TopbarActions>
        </Topbar>
        <Page>{loading ? <Loading>Carregando dados...</Loading> : children}</Page>
      </Workspace>
    </Shell>
  );
}
