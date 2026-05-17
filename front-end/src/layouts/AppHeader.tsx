/**
 * AppHeader — Header isolado como componente independente.
 *
 * Recebe apenas as props que precisa via interface explícita.
 * Isolado do AppLayout para evitar re-renders desnecessários:
 * apenas re-renderiza quando apiStatus, displayName, displayOab
 * ou profileOpen mudam.
 *
 * O apiStatus agora vem do hook useApiStatus (SSE mock).
 */

import { useRef, useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Menu, ChevronDown, AlertTriangle,
  Settings, UserRound, CreditCard, ShieldCheck, LifeBuoy, LogOut,
} from 'lucide-react';
import { useApiStatus } from '../hooks/useApiStatus';

interface AppHeaderProps {
  displayName: string;
  displayOab: string;
  initials: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
}

export const AppHeader = memo(function AppHeader({
  displayName,
  displayOab,
  initials,
  onOpenSidebar,
  onLogout,
}: AppHeaderProps) {
  const navigate     = useNavigate();
  const apiStatus    = useApiStatus();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileOpen]);

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

  const nav = (path: string) => { navigate(path); setProfileOpen(false); };

  return (
    <header className="shrink-0 h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1" />

      {/* API Status — reage ao mock SSE automaticamente */}
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
            <p className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{displayOab}</p>
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
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{displayOab}</p>
            </div>
            {([
              ['/configuracoes/assistente', Settings,    'Configurações do assistente'],
              ['/configuracoes/perfil',     UserRound,   'Meu perfil'],
              ['/configuracoes/plano-faturamento', CreditCard, 'Plano e faturamento'],
              ['/configuracoes/seguranca',  ShieldCheck, 'Segurança'],
              ['/configuracoes/ajuda',      LifeBuoy,    'Central de ajuda'],
            ] as const).map(([path, Icon, label]) => (
              <button
                key={path}
                type="button"
                role="menuitem"
                onClick={() => nav(path)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
              </button>
            ))}
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
            >
              <LogOut size={15} />
              <span className="flex-1">Sair da conta</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
});
