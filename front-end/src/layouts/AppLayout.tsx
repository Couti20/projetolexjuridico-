/**
 * AppLayout — estrutura base de todas as telas internas do Lex.
 *
 * Composto por:
 *   - Sidebar fixa (desktop) / drawer (mobile)
 *   - Header com busca, status API e perfil
 *   - Slot <children> para o conteúdo da página
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  FileText,
  ListTodo,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  AlertTriangle,
  UserRound,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: number;
}

// ── Itens de navegação ────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard' },
  { icon: FileText,        label: 'Processos',       path: '/processos' },
  { icon: ListTodo,        label: 'Tarefas do dia',  path: '/tarefas', badge: 3 },
  { icon: Settings,        label: 'Configurações',   path: '/configuracoes/assistente' },
] satisfies NavItem[];

interface AppLayoutProps {
  children: ReactNode;
  /** Nome do usuário exibido no header */
  userName?: string;
  /** OAB exibida no header */
  userOab?: string;
  /** Status da conexão com a API do Escavador */
  apiStatus?: 'connected' | 'disconnected' | 'checking';
}

export function AppLayout({
  children,
  userName = 'Dr. João Silva',
  userOab = 'OAB/SP 123.456',
  apiStatus = 'connected',
}: AppLayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const resolvedUserName = user?.fullName?.trim() || userName;
  const resolvedUserOab = user?.oab?.trim() || userOab;

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileOpen]);

  const initials = resolvedUserName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Não foi possível notificar logout no serviço.', error);
    }

    logout();
    setProfileOpen(false);
    setSidebarOpen(false);
    navigate('/login');
    window.scrollTo({ top: 0 });
  }

  const apiLabel: Record<typeof apiStatus, string> = {
    connected:    'API Conectada',
    disconnected: 'API Desconectada',
    checking:     'Verificando...',
  };
  const apiColor: Record<typeof apiStatus, string> = {
    connected:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    disconnected: 'bg-red-100 text-red-700 border-red-200',
    checking:     'bg-amber-100 text-amber-700 border-amber-200',
  };
  const apiDot: Record<typeof apiStatus, string> = {
    connected:    'bg-emerald-500',
    disconnected: 'bg-red-500',
    checking:     'bg-amber-400 animate-pulse',
  };

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0">
            <Scale size={20} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Lex</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
            const active = Boolean(
              path &&
              (
                location.pathname === path ||
                location.pathname.startsWith(`${path}/`) ||
                (path.startsWith('/configuracoes') && location.pathname.startsWith('/configuracoes'))
              ),
            );
            const isDisabled = !path;
            return (
              <button
                key={path ?? label}
                type="button"
                onClick={() => {
                  if (!path) return;
                  navigate(path);
                  setSidebarOpen(false);
                }}
                disabled={isDisabled}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  isDisabled ? 'opacity-60 cursor-not-allowed' : '',
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                ].join(' ')}
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {badge !== undefined && !isDisabled && (
                  <span className={[
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-white/20 text-white' : 'bg-red-500 text-white',
                  ].join(' ')}>
                    {badge}
                  </span>
                )}
                {isDisabled && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Em breve</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar desktop ──────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 flex-col bg-slate-900">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile (drawer) ──────────────────────────── */}
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
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Coluna principal ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="shrink-0 h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 gap-4">

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar processos, prazos ou clientes..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* API Status */}
          <div className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${apiColor[apiStatus]}`}>
            {apiStatus === 'disconnected'
              ? <AlertTriangle size={13} />
              : <span className={`w-2 h-2 rounded-full ${apiDot[apiStatus]}`} />}
            {apiLabel[apiStatus]}
          </div>

          {/* Notificações */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            aria-label="Notificações"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Perfil */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((p) => !p)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls="profile-menu"
              className="flex items-center gap-2.5 pl-2 pr-1 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{resolvedUserName}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{resolvedUserOab}</p>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div
                id="profile-menu"
                role="menu"
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
              >
                <div className="px-4 pb-2 mb-1 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{resolvedUserName}</p>
                  <p className="text-xs text-slate-500">{resolvedUserOab}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { navigate('/configuracoes/assistente'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Settings size={15} />
                  <span className="flex-1">Configurações do assistente</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { navigate('/configuracoes/perfil'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <UserRound size={15} />
                  <span className="flex-1">Meu perfil</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { navigate('/configuracoes/plano-faturamento'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <CreditCard size={15} />
                  <span className="flex-1">Plano e faturamento</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { navigate('/configuracoes/seguranca'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <ShieldCheck size={15} />
                  <span className="flex-1">Segurança</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { navigate('/configuracoes/ajuda'); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <LifeBuoy size={15} />
                  <span className="flex-1">Central de ajuda</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                >
                  <LogOut size={15} />
                  <span className="flex-1">Sair da conta</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
