/**
 * TrialBlockingCard — Card reutilizável para bloqueio de features em modo trial.
 *
 * Responsabilidades:
 * - Renderizar card com ícone, título, descrição, badge e CTA
 * - Ser posicionado centralmente no TrialFeatureGate
 * - Manter design consistente across todas as features
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import * as S from './styles';

interface TrialBlockingCardProps {
  title?: string;
  description?: string;
  onCtaClick?: () => void;
}

export function TrialBlockingCard({
  title = 'Funcionalidade Bloqueada',
  description = 'Esta área está disponível para contas com assinatura ativa',
  onCtaClick,
}: TrialBlockingCardProps) {
  const navigate = useNavigate();

  function handleCtaClick() {
    if (onCtaClick) {
      onCtaClick();
    } else {
      navigate('/?scrollTo=pricing');
    }
  }

  return (
    <S.Card>
      <S.IconWrapper>
        <S.IconBox>
          <Sparkles size={24} />
        </S.IconBox>
      </S.IconWrapper>

      <S.Title>{title}</S.Title>

      <S.Description>{description}</S.Description>

      <S.Badge>
        <S.BadgeText>Libere com uma assinatura ativa</S.BadgeText>
      </S.Badge>

      <S.CtaButton type="button" onClick={handleCtaClick}>
        Teste grátis por 7 dias
        <ArrowRight size={16} />
      </S.CtaButton>

      <S.FooterText>Já tem assinatura? Entre com a conta assinante.</S.FooterText>
    </S.Card>
  );
}
