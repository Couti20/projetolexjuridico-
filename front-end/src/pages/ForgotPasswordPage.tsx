import { FormEvent, useState } from 'react';
import { Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { InputField } from '../ui/InputField';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';

interface ForgotPasswordPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export function ForgotPasswordPage({ onNavigateHome, onNavigateLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setError('Informe um e-mail válido.');
      return;
    }

    setStatus('loading');
    try {
      const response = await authService.forgotPassword({ email });
      setStatus('success');
      setMessage(response.message);
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError('Não foi possível solicitar a recuperação agora. Tente novamente em instantes.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 mb-8"
          aria-label="Voltar para a página inicial"
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Scale size={18} />
          </div>
          <span className="text-lg font-bold text-slate-800">Lex</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Recuperar senha</h1>
            <p className="text-slate-500 text-sm">
              Informe seu e-mail cadastrado para receber o link de redefinição.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <span aria-hidden="true">✅</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-5">
            <InputField
              id="forgot-email"
              label="E-mail cadastrado"
              type="email"
              autoComplete="email"
              placeholder="voce@escritorio.com.br"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Lembrou a senha?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Voltar para login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
