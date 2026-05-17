/**
 * AppLayout — estrutura base de todas as telas internas do Lex.
 *
 * Refatorado para:
 *   - AppHeader isolado em src/layouts/AppHeader (memo)
 *   - AppSidebar isolado em src/layouts/AppSidebar (memo)
 *   - apiStatus vem do hook useApiStatus (SSE mock) — removido do prop
 *   - AppLayout agora é responsável APENAS por orquestrar layout e estado
 *     de abertura da sidebar mobile
 */

import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { AppHeader } from '../AppHeader';
import { AppSidebar } from '../AppSidebar';
import * as S from './styles';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.fullName?.trim() ?? '';
  const displayOab  = user?.oab?.trim()      ?? '';
  const initials    = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();

  async function handleLogout() {
    try { await authService.logout(); } catch (e) { console.error(e); }
    logout();
    setSidebarOpen(false);
    navigate('/login');
    window.scrollTo({ top: 0 });
  }

  function handleSidebarNavigate(path: string) {
    navigate(path);
    setSidebarOpen(false);
  }

  return (
    <S.Shell>
      <S.DesktopSidebar>
        <AppSidebar
          pathname={location.pathname}
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
        />
      </S.DesktopSidebar>

      {sidebarOpen && (
        <>
          <S.MobileBackdrop onClick={() => setSidebarOpen(false)} />
          <S.MobileSidebar>
            <S.MobileCloseRow>
              <S.MobileCloseButton
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={22} />
              </S.MobileCloseButton>
            </S.MobileCloseRow>
            <AppSidebar
              pathname={location.pathname}
              onNavigate={handleSidebarNavigate}
              onLogout={handleLogout}
            />
          </S.MobileSidebar>
        </>
      )}

      <S.MainColumn>
        <AppHeader
          displayName={displayName}
          displayOab={displayOab}
          initials={initials}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <S.Main>{children}</S.Main>
      </S.MainColumn>
    </S.Shell>
  );
}
