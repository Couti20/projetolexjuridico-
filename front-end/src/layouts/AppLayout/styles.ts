import styled from 'styled-components';

export const Shell = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f8fafc;
`;

export const DesktopSidebar = styled.aside`
  display: none;
  width: 14rem;
  flex-shrink: 0;
  flex-direction: column;
  background: #0f172a;

  @media (min-width: 1024px) {
    display: flex;
  }

  @media (min-width: 1280px) {
    width: 15rem;
  }
`;

export const MobileBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const MobileSidebar = styled.aside`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  display: flex;
  width: 16rem;
  flex-direction: column;
  background: #0f172a;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const MobileCloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
`;

export const MobileCloseButton = styled.button`
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: color 150ms ease;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
`;

export const MainColumn = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

export const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;

  @media (min-width: 1024px) {
    padding: 1.5rem;
  }
`;
