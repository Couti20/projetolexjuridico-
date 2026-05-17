import styled from 'styled-components';

export const Tooltip = styled.div`
  flex-shrink: 0;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  background: #1e293b;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.5);
  backdrop-filter: blur(12px);

  @media (min-width: 1024px) {
    padding: 0.75rem;
  }
`;

export const Label = styled.p`
  margin: 0 0 0.25rem;
  color: #94a3b8;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const ValueText = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1rem;
  white-space: nowrap;

  @media (min-width: 1024px) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
`;

export const Value = styled.span`
  margin-right: 0.25rem;
  color: #60a5fa;
  font-size: 1.125rem;
  line-height: 1.75rem;
`;
