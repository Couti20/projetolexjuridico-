import styled, { css } from 'styled-components';

interface InputProps {
  $hasError: boolean;
}

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

export const Label = styled.label`
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
`;

export const Input = styled.input<InputProps>`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem 1rem;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.25rem;
  outline: none;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #2563eb;
  }

  ${({ $hasError }) =>
    $hasError &&
    css`
      border-color: #f87171;
      background: #fef2f2;

      &:hover,
      &:focus {
        border-color: #f87171;
        box-shadow: 0 0 0 2px #f87171;
      }
    `}
`;

export const ErrorText = styled.p`
  margin: 0.125rem 0 0;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
`;
