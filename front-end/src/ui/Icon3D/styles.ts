import styled, { css } from 'styled-components';

type ColorType = 'blue' | 'slate' | 'red';

interface IconCubeProps {
  $colorType: ColorType;
}

const colorMap = {
  blue: css`
    background: linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8);
    box-shadow:
      inset 0 -3px 8px rgb(0 0 0 / 0.3),
      inset 0 3px 8px rgb(255 255 255 / 0.4),
      0 6px 15px -3px rgb(37 99 235 / 0.4);
  `,
  slate: css`
    background: linear-gradient(135deg, #475569, #334155, #0f172a);
    box-shadow:
      inset 0 -3px 8px rgb(0 0 0 / 0.4),
      inset 0 3px 8px rgb(255 255 255 / 0.2),
      0 6px 15px -3px rgb(15 23 42 / 0.4);
  `,
  red: css`
    background: linear-gradient(135deg, #fb7185, #f43f5e, #be123c);
    box-shadow:
      inset 0 -3px 8px rgb(0 0 0 / 0.3),
      inset 0 3px 8px rgb(255 255 255 / 0.4),
      0 6px 15px -3px rgb(225 29 72 / 0.4);
  `,
};

export const IconWrap = styled.div`
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 1.5rem;
  perspective: 1000px;
`;

export const Shadow = styled.div`
  position: absolute;
  bottom: -0.375rem;
  left: 50%;
  width: 2rem;
  height: 0.5rem;
  border-radius: 999px;
  background: rgb(15 23 42 / 0.4);
  filter: blur(4px);
  transform: translateX(-50%);
  transition:
    opacity 300ms ease,
    transform 300ms ease;

  ${IconWrap}:hover & {
    opacity: 0.5;
    transform: translateX(-50%) scale(0.75);
  }
`;

export const IconCube = styled.div<IconCubeProps>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.2);
  border-radius: 1rem;
  color: #ffffff;
  transition: transform 300ms ease;

  ${({ $colorType }) => colorMap[$colorType]}

  ${IconWrap}:hover & {
    transform: translateY(-0.375rem);
  }
`;

export const TopGloss = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 45%;
  border-radius: 1rem 1rem 0 0;
  background: linear-gradient(to bottom, rgb(255 255 255 / 0.4), transparent);
  pointer-events: none;
`;

export const BottomShade = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 33.333%;
  border-radius: 0 0 1rem 1rem;
  background: linear-gradient(to top, rgb(0 0 0 / 0.2), transparent);
  pointer-events: none;
`;

export const IconSlot = styled.span`
  position: relative;
  z-index: 1;
  display: inline-flex;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.5));
  transition: transform 300ms ease;

  ${IconWrap}:hover & {
    transform: scale(1.1) rotateY(12deg);
  }
`;
