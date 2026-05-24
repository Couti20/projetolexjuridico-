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
import { useApiStatus } from '../../hooks/useApiStatus';
import { ProcessSearchInput } from '../../components/processes/ProcessSearchInput';
import * as S from './styles';

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
  const [searchQuery, setSearchQuery] = useState('');
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

  const nav = (path: string) => { navigate(path); setProfileOpen(false); };

  function handleSearchSubmit() {
    const trimmedQuery = searchQuery.trim();
    navigate(trimmedQuery ? `/processos?q=${encodeURIComponent(trimmedQuery)}` : '/processos');
  }

  return (
    <S.Header>
      <S.MenuButton
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </S.MenuButton>

      <S.SearchSlot>
        <ProcessSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          placeholder="Buscar por número do processo, autor ou réu..."
          className="flex flex-1 max-w-xl gap-2"
          inputClassName="bg-slate-50"
          buttonClassName="hidden sm:inline-flex"
        />
      </S.SearchSlot>

      <S.Spacer />

      <S.ApiBadge $status={apiStatus}>
        {apiStatus === 'disconnected'
          ? <AlertTriangle size={13} />
          : <S.ApiDot $status={apiStatus} />}
        {apiLabel[apiStatus]}
      </S.ApiBadge>

      <S.NotificationButton type="button" aria-label="Notificações">
        <Bell size={19} />
        <S.NotificationDot />
      </S.NotificationButton>

      <S.ProfileMenuWrap ref={profileMenuRef}>
        <S.ProfileButton
          type="button"
          onClick={() => setProfileOpen((p) => !p)}
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          aria-controls="profile-menu"
        >
          <S.Avatar>{initials}</S.Avatar>
          <S.ProfileText>
            <S.ProfileName>{displayName}</S.ProfileName>
            <S.ProfileOab>{displayOab}</S.ProfileOab>
          </S.ProfileText>
          <S.ProfileChevron $open={profileOpen}>
            <ChevronDown size={14} />
          </S.ProfileChevron>
        </S.ProfileButton>

        {profileOpen && (
          <S.Menu id="profile-menu" role="menu">
            <S.MenuHeader>
              <S.MenuName>{displayName}</S.MenuName>
              <S.MenuOab>{displayOab}</S.MenuOab>
            </S.MenuHeader>
            {([
              ['/configuracoes/assistente', Settings,    'Configurações do assistente'],
              ['/configuracoes/perfil',     UserRound,   'Meu perfil'],
              ['/configuracoes/plano-faturamento', CreditCard, 'Plano e faturamento'],
              ['/configuracoes/seguranca',  ShieldCheck, 'Segurança'],
              ['/configuracoes/ajuda',      LifeBuoy,    'Central de ajuda'],
            ] as const).map(([path, Icon, label]) => (
              <S.MenuItem
                key={path}
                type="button"
                role="menuitem"
                onClick={() => nav(path)}
              >
                <Icon size={15} />
                <S.MenuItemLabel>{label}</S.MenuItemLabel>
              </S.MenuItem>
            ))}
            <S.Divider />
            <S.LogoutItem type="button" role="menuitem" onClick={onLogout}>
              <LogOut size={15} />
              <S.MenuItemLabel>Sair da conta</S.MenuItemLabel>
            </S.LogoutItem>
          </S.Menu>
        )}
      </S.ProfileMenuWrap>
    </S.Header>
  );
});
