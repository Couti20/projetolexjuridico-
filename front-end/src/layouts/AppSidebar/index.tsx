/**
 * AppSidebar — Sidebar isolada como componente independente e memoizado.
 */

import { memo } from 'react';
import {
  Scale, LayoutDashboard, FileText, ListTodo,
  Settings, LogOut, MessageCircle, type LucideIcon,
} from 'lucide-react';
import * as S from './styles';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: number;
  iconTone?: 'green';
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
  { icon: FileText,        label: 'Processos',      path: '/processos' },
  { icon: ListTodo,        label: 'Tarefas do dia', path: '/tarefas', badge: 3 },
  { icon: MessageCircle,   label: 'WhatsApp',       path: '/whatsapp', iconTone: 'green' },
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
    <S.Sidebar>
      <S.Logo>
        <S.LogoIcon>
          <Scale size={20} />
        </S.LogoIcon>
        <S.LogoText>Lex</S.LogoText>
      </S.Logo>

      <S.Nav>
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge, iconTone }) => {
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
            <S.NavButton
              key={path ?? label}
              type="button"
              onClick={() => path && onNavigate(path)}
              disabled={isDisabled}
              $active={active}
              $disabled={isDisabled}
            >
              <S.IconSlot $active={active} $tone={iconTone}>
                <Icon size={18} />
              </S.IconSlot>
              <S.NavLabel>{label}</S.NavLabel>
              {badge !== undefined && !isDisabled && (
                <S.Badge $active={active}>{badge}</S.Badge>
              )}
              {isDisabled && <S.Soon>Em breve</S.Soon>}
            </S.NavButton>
          );
        })}
      </S.Nav>

      <S.Footer>
        <S.LogoutButton type="button" onClick={onLogout}>
          <LogOut size={16} />
          Sair
        </S.LogoutButton>
      </S.Footer>
    </S.Sidebar>
  );
});
