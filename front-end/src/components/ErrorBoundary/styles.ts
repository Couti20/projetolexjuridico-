import styled from 'styled-components';

export const Fallback = styled.div`
  display: flex;
  min-height: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

export const IconBox = styled.div`
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 1rem;
  background: #fef2f2;
  color: #ef4444;
`;

export const Title = styled.h2`
  margin: 0 0 0.25rem;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.75rem;
`;

export const Message = styled.p`
  max-width: 20rem;
  margin: 0 0 0.25rem;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

export const ErrorMessage = styled.p`
  max-width: 24rem;
  margin: 0 0 1.25rem;
  overflow: hidden;
  border-radius: 0.5rem;
  background: #f8fafc;
  padding: 0.375rem 0.75rem;
  color: #94a3b8;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.75rem;
  line-height: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const buttonBase = `
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const ResetButton = styled.button`
  ${buttonBase}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;

  &:hover {
    background: #1d4ed8;
  }
`;

export const ReloadButton = styled.button`
  ${buttonBase}
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-weight: 500;

  &:hover {
    background: #f8fafc;
  }
`;
