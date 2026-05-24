import styled, { css } from 'styled-components';

interface NavButtonProps {
  $active: boolean;
  $disabled: boolean;
}

interface BadgeProps {
  $active: boolean;
}

interface IconSlotProps {
  $active: boolean;
  $tone?: 'green';
}

export const Sidebar = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-bottom: 1px solid #1e293b;
  padding: 1.25rem;
`;

export const LogoIcon = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #2563eb;
  padding: 0.5rem;
  color: #ffffff;
`;

export const LogoText = styled.span`
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.75rem;
  letter-spacing: -0.025em;
`;

export const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;

  & > * + * {
    margin-top: 0.25rem;
  }
`;

export const NavButton = styled.button<NavButtonProps>`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    box-shadow 150ms ease,
    color 150ms ease,
    opacity 150ms ease;

  ${({ $active }) =>
    $active
      ? css`
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 6px -1px rgb(30 58 138 / 0.3);
        `
      : css`
          background: transparent;
          color: #94a3b8;

          &:hover {
            background: #1e293b;
            color: #ffffff;
          }
        `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
    `}
`;

export const IconSlot = styled.span<IconSlotProps>`
  display: inline-flex;
  flex-shrink: 0;

  ${({ $active, $tone }) =>
    !$active &&
    $tone === 'green' &&
    css`
      color: #4ade80;
    `}
`;

export const NavLabel = styled.span`
  flex: 1;
`;

export const Badge = styled.span<BadgeProps>`
  border-radius: 999px;
  padding: 0.125rem 0.375rem;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;

  ${({ $active }) =>
    $active
      ? css`
          background: rgb(255 255 255 / 0.2);
        `
      : css`
          background: #ef4444;
        `}
`;

export const Soon = styled.span`
  color: #64748b;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const Footer = styled.div`
  border-top: 1px solid #1e293b;
  padding: 1rem 0.75rem;
`;

export const LogoutButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  border-radius: 0.75rem;
  background: transparent;
  padding: 0.625rem 0.75rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: #1e293b;
    color: #f87171;
  }
`;
