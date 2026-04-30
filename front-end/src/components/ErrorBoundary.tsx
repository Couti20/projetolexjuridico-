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
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Algo deu errado
          </h2>
          <p className="text-sm text-slate-500 mb-1 max-w-xs">
            Ocorreu um erro inesperado nesta seção. Tente recarregar a página.
          </p>
          {this.state.errorMessage && (
            <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded-lg px-3 py-1.5 mb-5 max-w-sm truncate">
              {this.state.errorMessage}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
