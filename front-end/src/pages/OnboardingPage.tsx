/**
 * Página de Onboarding do Lex.
 *
 * Exibida logo após o primeiro login para configurar:
 *   1. Número da OAB (com validação via API do Escavador)
 *   2. Número do WhatsApp para receber alertas
 *
 * Props:
 *   onNavigateDashboard — callback para ir ao dashboard após configurar
 *   onSkip             — callback para pular e configurar depois
 */

import { SetupPage } from './SetupPage';

interface OnboardingPageProps {
  onNavigateDashboard: () => void;
  onSkip?: () => void;
}

// Backwards-compatible wrapper: `OnboardingPage` delegates to `SetupPage`.
export function OnboardingPage({ onNavigateDashboard }: OnboardingPageProps) {
  return <SetupPage onNavigateDashboard={onNavigateDashboard} />;
}
