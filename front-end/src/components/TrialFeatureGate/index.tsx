/**
 * TrialFeatureGate — Componente reutilizável para bloqueio de features em modo trial.
 *
 * Renderiza o conteúdo passado com:
 * - Prévia desfocada quando em modo trial
 * - Overlay com card de bloqueio centralizado (TrialBlockingCard)
 * - Possibilidade de desabilitar interações do conteúdo por trás
 */

import React from 'react';
import { TrialBlockingCard } from '../TrialBlockingCard';
import * as S from './styles';

interface TrialFeatureGateProps {
  isTrialUser: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
  disablePointerEvents?: boolean;
}

export function TrialFeatureGate({
  isTrialUser,
  title = 'Funcionalidade Bloqueada',
  description = 'Esta área está disponível para contas com assinatura ativa',
  children,
  disablePointerEvents = true,
}: TrialFeatureGateProps) {
  if (!isTrialUser) return <>{children}</>;

  return (
    <S.Gate>
      <S.Preview $disablePointerEvents={disablePointerEvents} aria-hidden="true">
        {children}
      </S.Preview>

      <S.Overlay>
        <S.CardSlot>
          <TrialBlockingCard title={title} description={description} />
        </S.CardSlot>
      </S.Overlay>
    </S.Gate>
  );
}
