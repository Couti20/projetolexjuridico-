import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { PasswordInput } from '../ui/PasswordInput';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';

interface ResetPasswordPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export function ResetPasswordPage({ onNavigateHome, onNavigateLogin }: ResetPasswordPageProps) {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setStatus('error');
      setError('Token de recuperação ausente. Solicite um novo link.');
      return;
    }
    if (newPassword.length < 8) {
      setStatus('error');
      setError('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setError('As senhas não conferem.');
      return;
    }

    setStatus('loading');
    try {
      await authService.resetPassword({ token, newPassword });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }
      setError('Não foi possível redefinir sua senha agora. Tente novamente em instantes.');
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Redefinir senha</h1>
            <p className="text-slate-500 text-sm">Digite sua nova senha para concluir a recuperação.</p>
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

          {isSuccess ? (
            <div className="space-y-5">
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <span aria-hidden="true">✅</span>
                <span>Senha redefinida com sucesso. Faça login com sua nova senha.</span>
              </div>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full btn-primary py-3.5 font-semibold text-base"
              >
                Ir para login
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-5">
              <PasswordInput
                id="new-password"
                label="Nova senha"
                autoComplete="new-password"
                placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número e 1 símbolo"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isLoading}
              />
              <PasswordInput
                id="confirm-password"
                label="Confirmar nova senha"
                autoComplete="new-password"
                placeholder="Digite novamente a nova senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
