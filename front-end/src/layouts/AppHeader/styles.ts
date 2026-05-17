import styled, { css, keyframes } from 'styled-components';

type ApiStatus = 'connected' | 'disconnected' | 'checking';

interface StatusProps {
  $status: ApiStatus;
}

interface ProfileChevronProps {
  $open: boolean;
}

const pulse = keyframes`
  50% {
    opacity: 0.5;
  }
`;

const statusStyles = {
  connected: css`
    border-color: #a7f3d0;
    background: #d1fae5;
    color: #047857;
  `,
  disconnected: css`
    border-color: #fecaca;
    background: #fee2e2;
    color: #b91c1c;
  `,
  checking: css`
    border-color: #fde68a;
    background: #fef3c7;
    color: #b45309;
  `,
};

const dotStyles = {
  connected: css`
    background: #10b981;
  `,
  disconnected: css`
    background: #ef4444;
  `,
  checking: css`
    background: #fbbf24;
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  `,
};

export const Header = styled.header`
  display: flex;
  height: 4rem;
  flex-shrink: 0;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 0 1rem;

  @media (min-width: 1024px) {
    padding-right: 1.5rem;
    padding-left: 1.5rem;
  }
`;

export const MenuButton = styled.button`
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: color 150ms ease;

  &:hover {
    color: #1e293b;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const SearchSlot = styled.div`
  display: flex;
  flex: 1;
  max-width: 36rem;
  gap: 0.5rem;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const ApiBadge = styled.div<StatusProps>`
  display: none;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid;
  border-radius: 999px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;

  ${({ $status }) => statusStyles[$status]}

  @media (min-width: 640px) {
    display: flex;
  }
`;

export const ApiDot = styled.span<StatusProps>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;

  ${({ $status }) => dotStyles[$status]}
`;

export const NotificationButton = styled.button`
  position: relative;
  border: 0;
  border-radius: 0.75rem;
  background: transparent;
  padding: 0.5rem;
  color: #64748b;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const NotificationDot = styled.span`
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #ef4444;
`;

export const ProfileMenuWrap = styled.div`
  position: relative;
`;

export const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: transparent;
  padding: 0.375rem 0.25rem 0.375rem 0.5rem;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  &:hover {
    border-color: #e2e8f0;
    background: #f8fafc;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const Avatar = styled.div`
  display: flex;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1rem;
`;

export const ProfileText = styled.div`
  display: none;
  text-align: left;

  @media (min-width: 640px) {
    display: block;
  }
`;

export const ProfileName = styled.p`
  margin: 0;
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
`;

export const ProfileOab = styled.p`
  margin: 0;
  color: #94a3b8;
  font-size: 0.625rem;
  line-height: 1;
`;

export const ProfileChevron = styled.span<ProfileChevronProps>`
  display: inline-flex;
  color: #94a3b8;
  transition: transform 150ms ease;

  ${({ $open }) =>
    $open &&
    css`
      transform: rotate(180deg);
    `}
`;

export const Menu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  width: 18rem;
  margin-top: 0.5rem;
  border: 1px solid #f1f5f9;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.5rem 0;
  box-shadow: 0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.1);
`;

export const MenuHeader = styled.div`
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 1rem 0.5rem;
`;

export const MenuName = styled.p`
  margin: 0;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
`;

export const MenuOab = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1rem;
`;

export const MenuItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.625rem;
  border: 0;
  background: transparent;
  padding: 0.625rem 1rem;
  color: #334155;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

export const MenuItemLabel = styled.span`
  flex: 1;
`;

export const Divider = styled.div`
  height: 1px;
  margin: 0.25rem 0;
  background: #f1f5f9;
`;

export const LogoutItem = styled(MenuItem)`
  color: #dc2626;

  &:hover {
    background: #fef2f2;
  }
`;
