import styled, { css } from 'styled-components';

interface PreviewProps {
  $disablePointerEvents: boolean;
}

export const Gate = styled.div`
  position: relative;
  width: 100%;
  min-height: 60vh;
`;

export const Preview = styled.div<PreviewProps>`
  user-select: none;
  filter: blur(1.6px);

  ${({ $disablePointerEvents }) =>
    $disablePointerEvents &&
    css`
      pointer-events: none;
    `}
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2.5rem 1rem;
  background: linear-gradient(
    to bottom,
    rgb(255 255 255 / 0.8),
    rgb(255 255 255 / 0.55),
    rgb(15 23 42 / 0.1)
  );
  backdrop-filter: blur(2px);

  @media (min-width: 640px) {
    align-items: center;
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const CardSlot = styled.div`
  width: 100%;
  max-width: 24rem;
`;
