import styled from 'styled-components';
import { motion } from 'motion/react';

export const Card = styled(motion.div)`
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 1.5rem;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0.4));
  padding: 2rem;
  box-shadow:
    0 8px 32px rgb(31 38 135 / 0.04),
    inset 0 0 0 1px rgb(255 255 255 / 0.3);
  backdrop-filter: blur(16px);
  transition: all 150ms ease;
`;

export const Title = styled.h3`
  margin: 0 0 1rem;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 2rem;
`;

export const Description = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.625;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;
