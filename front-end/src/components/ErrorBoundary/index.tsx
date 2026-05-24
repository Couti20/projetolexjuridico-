/**
 * ErrorBoundary — captura erros em tempo de execução dentro da árvore de componentes
 * e exibe uma tela de fallback amigável em vez de uma tela branca.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <MinhaPage />
 *   </ErrorBoundary>
 *
 * Ou com fallback customizado:
 *   <ErrorBoundary fallback={<p>Algo deu errado.</p>}>
 *     <MinhaPage />
 *   </ErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as S from './styles';

interface Props {
  children: ReactNode;
  /** Elemento alternativo a exibir quando há erro. Se omitido, usa o fallback padrão. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido.';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Em produção, substituir por serviço de monitoramento (ex: Sentry)
    console.error('[ErrorBoundary] Erro capturado:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <S.Fallback>
          <S.IconBox>
            <AlertTriangle size={28} />
          </S.IconBox>
          <S.Title>Algo deu errado</S.Title>
          <S.Message>
            Ocorreu um erro inesperado nesta seção. Tente recarregar a página.
          </S.Message>
          {this.state.errorMessage && (
            <S.ErrorMessage>{this.state.errorMessage}</S.ErrorMessage>
          )}
          <S.Actions>
            <S.ResetButton type="button" onClick={this.handleReset}>
              <RefreshCw size={14} />
              Tentar novamente
            </S.ResetButton>
            <S.ReloadButton type="button" onClick={() => window.location.reload()}>
              Recarregar página
            </S.ReloadButton>
          </S.Actions>
        </S.Fallback>
      );
    }

    return this.props.children;
  }
}
