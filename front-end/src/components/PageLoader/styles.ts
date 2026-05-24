import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const LoaderScreen = styled.div`
  display: flex;
  min-height: 60vh;
  align-items: center;
  justify-content: center;
`;

export const LoaderStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

export const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 2px solid #2563eb;
  border-top-color: transparent;
  border-radius: 999px;
  animation: ${spin} 1s linear infinite;
`;

export const LoaderText = styled.span`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;
