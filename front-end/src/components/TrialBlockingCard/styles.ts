import styled from 'styled-components';

export const Card = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: #ffffff;
  padding: 1.5rem;
  text-align: center;
  box-shadow:
    0 25px 50px -12px rgb(15 23 42 / 0.25),
    0 0 0 1px rgb(15 23 42 / 0.02);

  @media (min-width: 640px) {
    padding: 2rem;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

export const IconBox = styled.div`
  display: flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
`;

export const Title = styled.h3`
  margin: 0 0 0.5rem;
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5rem;
`;

export const Description = styled.p`
  margin: 0 0 1.5rem;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.625;
`;

export const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  padding: 0.375rem 0.75rem;
`;

export const BadgeText = styled.span`
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
`;

export const CtaButton = styled.button`
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.75rem;
  background: #2563eb;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background: #1d4ed8;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export const FooterText = styled.p`
  margin: 1rem 0 0;
  color: #94a3b8;
  font-size: 0.75rem;
  line-height: 1rem;
`;
