import styled, { css } from 'styled-components';

interface OpenProps {
  $open: boolean;
}

export const Item = styled.div`
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 1rem;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0.4));
  box-shadow:
    0 8px 32px rgb(31 38 135 / 0.04),
    inset 0 0 0 1px rgb(255 255 255 / 0.3);
  backdrop-filter: blur(16px);
  transition: all 150ms ease;
`;

export const Trigger = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  padding: 1.25rem 1.5rem;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }
`;

export const Question = styled.span`
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.75rem;
`;

export const Chevron = styled.span<OpenProps>`
  display: inline-flex;
  color: #94a3b8;
  transition: transform 150ms ease;

  ${({ $open }) =>
    $open &&
    css`
      transform: rotate(90deg);
    `}
`;

export const AnswerWrap = styled.div<OpenProps>`
  overflow: hidden;
  max-height: 0;
  padding: 0 1.5rem;
  opacity: 0;
  transition:
    max-height 300ms ease-in-out,
    opacity 300ms ease-in-out,
    padding-bottom 300ms ease-in-out;

  ${({ $open }) =>
    $open &&
    css`
      max-height: 24rem;
      padding-bottom: 1.25rem;
      opacity: 1;
    `}
`;

export const Answer = styled.p`
  margin: 0;
  color: #475569;
  line-height: 1.625;
`;
