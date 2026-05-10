/**
 * AppSidebar — Sidebar isolada como componente independente e memoizado.
 */

import { memo } from 'react';
import {
  Scale, LayoutDashboard, FileText, ListTodo,
  Settings, LogOut, MessageCircle, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: number;
  iconColor?: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
  { icon: FileText,        label: 'Processos',      path: '/processos' },
  { icon: ListTodo,        label: 'Tarefas do dia', path: '/tarefas', badge: 3 },
  { icon: MessageCircle,   label: 'WhatsApp',       path: '/whatsapp', iconColor: 'text-green-400' },
  { icon: Settings,        label: 'Configurações',  path: '/configuracoes' },
] satisfies NavItem[];

interface AppSidebarProps {
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AppSidebar = memo(function AppSidebar({
  pathname,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
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
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge, iconColor }) => {
          const active = Boolean(
            path && (
              pathname === path ||
              pathname.startsWith(`${path}/`) ||
              (path === '/configuracoes' && pathname.startsWith('/configuracoes')) ||
              (path === '/whatsapp' && pathname === '/whatsapp')
            ),
          );
          const isDisabled = !path;
          return (
            <button
              key={path ?? label}
              type="button"
              onClick={() => path && onNavigate(path)}
              disabled={isDisabled}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                isDisabled ? 'opacity-60 cursor-not-allowed' : '',
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              ].join(' ')}
            >
              <Icon
                size={18}
                className={['shrink-0', !active && iconColor ? iconColor : ''].join(' ').trim()}
              />
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
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
});
