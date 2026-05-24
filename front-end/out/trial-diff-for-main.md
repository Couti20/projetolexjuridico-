# Patch: migrar trial features de `develop` → `main`

Este documento contém o diff/unified patch entre `main` e `develop` limitado aos arquivos que implementam a funcionalidade de trial (TrialFeatureGate / TrialBlockingCard) e arquivos relacionados diretamente (layouts, páginas e serviços de auth). Use-o para revisar e aplicar manualmente na branch `main`.

IMPORTANTE: a branch `main` está adiantada; aplique este patch em uma branch temporária criada a partir de `main`, rode build/tests e verifique conflitos antes de mesclar.

Recomendações de aplicação:
1. A partir de `main`: `git checkout -b backport/trial-from-develop`
2. Salve este arquivo localmente e aplique o patch com `git apply --index path/to/trial-diff-for-main.md` (ou copie os trechos manualmente).
3. Corrija conflitos, instale dependências (possível adição de `styled-components` ou outras libs), rode `yarn && yarn build` ou `npm install && npm run build`.
4. Teste as páginas afetadas: AssistantSettings, DailyTasks, Dashboard, ProcessList, Settings.
5. Abra PR para `main` quando pronto.

---

## Diff (unified) — arquivos relevantes

<!-- Início do patch -->

```
diff --git a/front-end/src/components/TrialBlockingCard/index.tsx b/front-end/src/components/TrialBlockingCard/index.tsx
new file mode 100644
index 0000000..d2910cb
--- /dev/null
+++ b/front-end/src/components/TrialBlockingCard/index.tsx
@@ -0,0 +1,59 @@
 +/**
 + * TrialBlockingCard — Card reutilizável para bloqueio de features em modo trial.
 + *
 + * Responsabilidades:
 + * - Renderizar card com ícone, título, descrição, badge e CTA
 + * - Ser posicionado centralmente no TrialFeatureGate
 + * - Manter design consistente across todas as features
 + */
 +
 +import { useNavigate } from 'react-router-dom';
 +import { ArrowRight, Sparkles } from 'lucide-react';
 +import * as S from './styles';
 +
 +interface TrialBlockingCardProps {
 +  title?: string;
 +  description?: string;
 +  onCtaClick?: () => void;
 +}
 +
 +export function TrialBlockingCard({
 +  title = 'Funcionalidade Bloqueada',
 +  description = 'Esta área está disponível para contas com assinatura ativa',
 +  onCtaClick,
 +}: TrialBlockingCardProps) {
 +  const navigate = useNavigate();
 +
 +  function handleCtaClick() {
 +    if (onCtaClick) {
 +      onCtaClick();
 +    } else {
 +      navigate('/?scrollTo=pricing');
 +    }
 +  }
 +
 +  return (
 +    <S.Card>
 +      <S.IconWrapper>
 +        <S.IconBox>
 +          <Sparkles size={24} />
 +        </S.IconBox>
 +      </S.IconWrapper>
 +
 +      <S.Title>{title}</S.Title>
 +
 +      <S.Description>{description}</S.Description>
 +
 +      <S.Badge>
 +        <S.BadgeText>Libere com uma assinatura ativa</S.BadgeText>
 +      </S.Badge>
 +
 +      <S.CtaButton type="button" onClick={handleCtaClick}>
 +        Teste grátis por 7 dias
 +        <ArrowRight size={16} />
 +      </S.CtaButton>
 +
 +      <S.FooterText>Já tem assinatura? Entre com a conta assinante.</S.FooterText>
 +    </S.Card>
 +  );
 +}
diff --git a/front-end/src/components/TrialBlockingCard/styles.ts b/front-end/src/components/TrialBlockingCard/styles.ts
new file mode 100644
index 0000000..161e7a1
--- /dev/null
+++ b/front-end/src/components/TrialBlockingCard/styles.ts
 @@ -0,0 +1,100 @@
 +import styled from 'styled-components';
 +
 +export const Card = styled.div`
 +  border: 1px solid #e2e8f0;
 +  border-radius: 1rem;
 +  background: #ffffff;
 +  padding: 1.5rem;
 +  text-align: center;
 +  box-shadow:
 +    0 25px 50px -12px rgb(15 23 42 / 0.25),
 +    0 0 0 1px rgb(15 23 42 / 0.02);
 +
 +  @media (min-width: 640px) {
 +    padding: 2rem;
 +  }
 +`;
 +
 +export const IconWrapper = styled.div`
 +  display: flex;
 +  justify-content: center;
 +  margin-bottom: 1rem;
 +`;
 +
 +export const IconBox = styled.div`
 +  display: flex;
 +  width: 3rem;
 +  height: 3rem;
 +  align-items: center;
 +  justify-content: center;
 +  border-radius: 0.75rem;
 +  color: #ffffff;
 +  background: linear-gradient(135deg, #2563eb, #1d4ed8);
 +`;
 +
 +export const Title = styled.h3`
 +  margin: 0 0 0.5rem;
 +  color: #0f172a;
 +  font-size: 1.125rem;
 +  font-weight: 700;
 +  line-height: 1.5rem;
 +`;
 +
 +export const Description = styled.p`
 +  margin: 0 0 1.5rem;
 +  color: #475569;
 +  font-size: 0.875rem;
 +  line-height: 1.625;
 +`;
 +
 +export const Badge = styled.div`
 +  display: inline-flex;
 +  align-items: center;
 +  gap: 0.5rem;
 +  margin-bottom: 1.5rem;
 +  border: 1px solid #bfdbfe;
 +  border-radius: 999px;
 +  background: #eff6ff;
 +  padding: 0.375rem 0.75rem;
 +`;
 +
 +export const BadgeText = styled.span`
 +  color: #2563eb;
 +  font-size: 0.75rem;
 +  font-weight: 600;
 +  line-height: 1rem;
 +`;
 +
 +export const CtaButton = styled.button`
 +  display: inline-flex;
 +  width: 100%;
 +  align-items: center;
 +  justify-content: center;
 +  gap: 0.5rem;
 +  border: 0;
 +  border-radius: 0.75rem;
 +  background: #2563eb;
 +  padding: 0.75rem 1rem;
 +  color: #ffffff;
 +  font-size: 0.875rem;
 +  font-weight: 600;
 +  line-height: 1.25rem;
 +  cursor: pointer;
 +  transition: background-color 150ms ease;
 +
 +  &:hover {
 +    background: #1d4ed8;
 +  }
 +
 +  &:focus-visible {
 +    outline: 2px solid #2563eb;
 +    outline-offset: 2px;
 +  }
 +`;
 +
 +export const FooterText = styled.p`
 +  margin: 1rem 0 0;
 +  color: #94a3b8;
 +  font-size: 0.75rem;
 +  line-height: 1rem;
 +`;

diff --git a/front-end/src/components/TrialFeatureGate/index.tsx b/front-end/src/components/TrialFeatureGate/index.tsx
new file mode 100644
index 0000000..fe71013
--- /dev/null
+++ b/front-end/src/components/TrialFeatureGate/index.tsx
 @@ -0,0 +1,44 @@
 +/**
 + * TrialFeatureGate — Componente reutilizável para bloqueio de features em modo trial.
 + *
 + * Renderiza o conteúdo passado com:
 + * - Prévia desfocada quando em modo trial
 + * - Overlay com card de bloqueio centralizado (TrialBlockingCard)
 + * - Possibilidade de desabilitar interações do conteúdo por trás
 + */
 +
 +import React from 'react';
 +import { TrialBlockingCard } from '../TrialBlockingCard';
 +import * as S from './styles';
 +
 +interface TrialFeatureGateProps {
 +  isTrialUser: boolean;
 +  title?: string;
 +  description?: string;
 +  children: React.ReactNode;
 +  disablePointerEvents?: boolean;
 +}
 +
 +export function TrialFeatureGate({
 +  isTrialUser,
 +  title = 'Funcionalidade Bloqueada',
 +  description = 'Esta área está disponível para contas com assinatura ativa',
 +  children,
 +  disablePointerEvents = true,
 +}: TrialFeatureGateProps) {
 +  if (!isTrialUser) return <>{children}</>;
 +
 +  return (
 +    <S.Gate>
 +      <S.Preview $disablePointerEvents={disablePointerEvents} aria-hidden="true">
 +        {children}
 +      </S.Preview>
 +
 +      <S.Overlay>
 +        <S.CardSlot>
 +          <TrialBlockingCard title={title} description={description} />
 +        </S.CardSlot>
 +      </S.Overlay>
 +    </S.Gate>
 +  );
 +}

