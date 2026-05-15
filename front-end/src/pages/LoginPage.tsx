/**
 * LoginPage
 *
 * Após autenticar, decide o destino correto:
 * - Setup já concluído → /dashboard
 * - Primeiro acesso     → /configuracao
 *
 * Race condition corrigida:
 * - Antes: `isSetupCompleted` era lido do closure — podia estar desatualizado
 *   quando o setTimeout disparava.
 * - Agora: a decisão é feita usando `authenticatedUser.setupCompleted` diretamente,
 *   que é o valor que veio da API naquele mesmo tick. Não depende do estado React.
 *
 * Bloqueio por excesso de tentativas (429):
 * - Exibe a mensagem do back-end com o tempo restante.
 * - Mostra contador regressivo em segundos ao lado da mensagem.
 * - Desabilita o botão e o formulário enquanto o contador não zera.
 */

import { useEffect, useRef } from 'react';
import { Scale, ShieldCheck, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLoginForm } from '../hooks/useLoginForm';
import { useAuth } from '../hooks/useAuth';
import { InputField } from '../ui/InputField';
import { PasswordInput } from '../ui/PasswordInput';

const HIGHLIGHTS = [
  { icon: Zap,         text: 'Briefing diário de prazos no WhatsApp' },
  { icon: Clock,       text: 'Monitoramento 24h sem abrir portais' },
  { icon: ShieldCheck, text: 'Acesso seguro com criptografia de ponta' },
];

interface LoginPageProps {
  onNavigateHome:      () => void;
  onNavigateSignUp:    () => void;
  onNavigateSetup:     () => void;
  onNavigateDashboard: () => void;
}

export function LoginPage({
  onNavigateHome,
  onNavigateSignUp,
  onNavigateSetup,
  onNavigateDashboard,
}: LoginPageProps) {
  const { login, isSetupCompleted } = useAuth();
  const {
    form, errors, status, serverError,
    authenticatedUser, lockCountdown, isLocked,
    updateField, handleSubmit,
  } = useLoginForm();

  const hasCommittedSuccess   = useRef(false);
  const navigateSetupRef      = useRef(onNavigateSetup);
  const navigateDashboardRef  = useRef(onNavigateDashboard);

  useEffect(() => { navigateSetupRef.current     = onNavigateSetup;     }, [onNavigateSetup]);
  useEffect(() => { navigateDashboardRef.current  = onNavigateDashboard; }, [onNavigateDashboard]);

  const isLoading  = status === 'loading';
  const isSuccess  = status === 'success';
  const isDisabled = isLoading || isLocked;

  useEffect(() => {
    if (!isSuccess) {
      hasCommittedSuccess.current = false;
      return undefined;
    }
    if (hasCommittedSuccess.current) return undefined;
    if (!authenticatedUser) return undefined;

    hasCommittedSuccess.current = true;
    login(authenticatedUser);

    const userSetupCompleted = authenticatedUser.setupCompleted ?? false;

    const timeoutId = window.setTimeout(() => {
      if (userSetupCompleted) {
        navigateDashboardRef.current();
      } else {
        navigateSetupRef.current();
      }
    }, 1_500);

    return () => window.clearTimeout(timeoutId);
  }, [authenticatedUser, isSuccess, isSetupCompleted, login]);

  return (
    <div className="min-h-screen flex">
      {/* ── Painel Esquerdo — Branding ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-slate-900 flex-col justify-between p-10 xl:p-14">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 w-fit group"
          aria-label="Voltar para a página inicial do Lex"
        >
          <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
            <Scale size={22} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Lex</span>
        </button>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3">
              Domine seus prazos{' '}
              <span className="text-blue-400">com inteligência.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              O assistente que monitora o e-SAJ e avisa você direto no WhatsApp.
              Recupere sua paz de espírito.
            </p>
            <div className="h-0.5 w-16 bg-blue-600 rounded-full mt-4" />
          </div>

          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-blue-400" />
                </span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">+2.000</p>
              <p className="text-slate-400 text-xs mt-1">Advogados ativos</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">+40h</p>
              <p className="text-slate-400 text-xs mt-1">Recuperadas por mês</p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Lex. Todos os direitos reservados.
        </p>
      </div>

      {/* ── Painel Direito — Formulário ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex lg:hidden items-center gap-2 mb-8"
            aria-label="Voltar para a página inicial"
          >
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Scale size={18} />
            </div>
            <span className="text-lg font-bold text-slate-800">Lex</span>
          </button>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center gap-5 py-12"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ShieldCheck size={36} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesso autorizado!</h2>
                  <p className="text-slate-500 max-w-xs">
                    {(authenticatedUser?.setupCompleted ?? false)
                      ? 'Redirecionando para o dashboard…'
                      : 'Redirecionando para a configuração inicial…'}
                  </p>
                </div>
                <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Acesse sua conta</h1>
                  <p className="text-slate-500 text-sm">Insira suas credenciais para continuar.</p>
                </div>

                {/* Mensagem de erro / bloqueio */}
                {serverError && (
                  <motion.div
                    key={isLocked ? 'locked' : 'error'}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                      isLocked
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    <span aria-hidden="true">{isLocked ? '⏳' : '⚠️'}</span>
                    <span className="flex-1">
                      {serverError}
                      {isLocked && (
                        <span className="block mt-1 font-semibold">
                          Tente novamente em{' '}
                          <span className="tabular-nums">{lockCountdown}s</span>
                        </span>
                      )}
                    </span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <InputField
                    id="email"
                    label="E-mail Profissional"
                    type="email"
                    autoComplete="email"
                    placeholder="exemplo@adv.com.br"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    disabled={isDisabled}
                  />

                  <div className="space-y-1.5">
                    <PasswordInput
                      id="password"
                      label="Senha"
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      error={errors.password}
                      disabled={isDisabled}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="text-xs text-slate-400 font-medium cursor-not-allowed"
                      >
                        Recuperação em breve
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.rememberMe}
                      onChange={(e) => updateField('rememberMe', e.target.checked)}
                      disabled={isDisabled}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600">Lembrar-me neste dispositivo</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                          aria-hidden="true"
                        />
                        Entrando...
                      </>
                    ) : isLocked ? (
                      <>
                        <span aria-hidden="true">⏳</span>
                        Aguarde {lockCountdown}s…
                      </>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Ainda não tem conta?{` `}
                  <button
                    type="button"
                    onClick={onNavigateSignUp}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Teste grátis
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
