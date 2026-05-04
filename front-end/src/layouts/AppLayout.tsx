/**
 * AppLayout — estrutura base de todas as telas internas do Lex.
 *
 * Refatorado para:
 *   - AppHeader isolado em src/layouts/AppHeader.tsx (memo)
 *   - AppSidebar isolado em src/layouts/AppSidebar.tsx (memo)
 *   - apiStatus vem do hook useApiStatus (SSE mock) — removido do prop
 *   - AppLayout agora é responsável APENAS por orquestrar layout e estado
 *     de abertura da sidebar mobile
 */

import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col bg-slate-900">
        <AppSidebar
          pathname={location.pathname}
          onNavigate={handleSidebarNavigate}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 flex flex-col">
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>
            <AppSidebar
              pathname={location.pathname}
              onNavigate={handleSidebarNavigate}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Coluna principal */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader
          displayName={displayName}
          displayOab={displayOab}
          initials={initials}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
