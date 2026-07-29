import type { ReactNode } from 'react';
import styled from 'styled-components';

import { navItems } from '../../navigation/modules';
import type { AppDataState, AppView } from '../../types/app';
import { formatDocument, getInitials } from '../../utils/formatters';
import { Button, Page } from '../ui';

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

const Shell = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 282px minmax(0, 1fr);

  @media (max-width: 1180px) {
    grid-template-columns: 230px minmax(0, 1fr);
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(201, 163, 74, 0.08), transparent 28%),
    var(--navy-950);
  color: #ffffff;

  @media (max-width: 820px) {
    position: static;
    height: auto;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  min-height: 86px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarLogo = styled.img`
  width: 196px;
  max-width: 100%;
`;

const SidebarSection = styled.div`
  margin: 18px 20px 10px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const SideNav = styled.nav`
  display: grid;
  gap: 4px;
  padding: 0 10px;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: grid;
  min-height: 48px;
  grid-template-columns: 34px 1fr;
  align-items: center;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.82)')};
  padding: 0 12px;
  text-align: left;
  box-shadow: ${({ $active }) => ($active ? 'inset 3px 0 0 var(--gold-600)' : 'none')};
`;

const NavIcon = styled.span`
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  color: var(--gold-500);
  font-size: 0.7rem;
  font-weight: 900;
`;

const SidebarCompany = styled.div`
  margin: auto 20px 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.08);
  padding: 16px;

  small {
    display: block;
    color: rgba(255, 255, 255, 0.62);
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 5px;
  }

  span {
    display: block;
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 0.82rem;
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

const Workspace = styled.section`
  min-width: 0;
  background: var(--surface-soft);
`;

const Topbar = styled.header`
  display: grid;
  position: sticky;
  top: 0;
  z-index: 10;
  min-height: 72px;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
  padding: 0 28px;
  backdrop-filter: blur(12px);

  @media (max-width: 820px) {
    position: static;
    grid-template-columns: 1fr;
    padding: 14px;
  }
`;

const BrandInline = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.08rem;
  font-weight: 900;
`;

const TopbarCenter = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  color: var(--ink-700);

  @media (max-width: 820px) {
    justify-content: flex-start;
  }
`;

const companyPickerStyles = `
  display: grid;
  min-width: 310px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #ffffff;
  padding: 8px 12px;
  text-align: left;

  span {
    color: var(--ink-500);
    font-size: 0.72rem;
    font-weight: 800;
  }

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 820px) {
    min-width: 0;
    width: 100%;
  }
`;

const CompanyPicker = styled.button`
  ${companyPickerStyles}
`;

const CompanyBox = styled.div`
  ${companyPickerStyles}
  cursor: default;
`;

const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 820px) {
    justify-content: flex-start;
  }
`;

const Avatar = styled.span`
  display: inline-grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: var(--navy-850);
  color: #ffffff;
  font-weight: 900;
`;

const Loading = styled.section`
  display: grid;
  min-height: 180px;
  place-items: center;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  color: var(--ink-500);
`;
