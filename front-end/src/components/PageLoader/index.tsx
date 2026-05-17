/**
 * PageLoader — fallback de Suspense para lazy loading de páginas.
 * Exibido enquanto o chunk da página está sendo baixado.
 */

import * as S from './styles';

export function PageLoader() {
  return (
    <S.LoaderScreen>
      <S.LoaderStack>
        <S.Spinner />
        <S.LoaderText>Carregando...</S.LoaderText>
      </S.LoaderStack>
    </S.LoaderScreen>
  );
}
