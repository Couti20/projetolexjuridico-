/**
 * Página de Cadastro do Lex.
 *
 * Layout split-screen:
 * - Esquerda: painel escuro com branding, depoimento e benefícios
 * - Direita: formulário de criação de conta
 *
 * Lógica totalmente isolada no hook useSignUpForm.
 */

import { Scale, CheckCircle2, ShieldCheck, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSignUpForm } from '../hooks/useSignUpForm';
import { InputField } from '../ui/InputField';
import { PasswordInput } from '../ui/PasswordInput';

const BENEFITS = [
  { icon: Clock,      text: 'Monitore prazos 24h sem abrir portais' },
  { icon: ShieldCheck, text: 'Dados protegidos com criptografia' },
  { icon: Users,      text: '+2.000 advogados já usam o Lex' },
];

function SuccessState({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center gap-5 py-12"
    >
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle2 size={36} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Conta criada!</h2>
        <p className="text-slate-500 max-w-xs">
          Enviamos um link de confirmação para seu e-mail. Verifique sua caixa de entrada.
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 transition-colors"
      >
        Voltar ao início
      </button>
    </motion.div>
  );
}

export function SignUpPage({ onNavigateHome }: { onNavigateHome: () => void }) {
  const navigate = useNavigate();
  const { form, errors, status, serverError, updateField, handleSubmit } = useSignUpForm();

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

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
              Junte-se a +2.000{' '}
              <span className="text-blue-400">advogados produtivos.</span>
            </h2>
            <div className="h-0.5 w-16 bg-blue-600 rounded-full" />
          </div>

          <ul className="space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-blue-400" />
                </span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          <figure className="border-l-2 border-blue-600 pl-5">
            <blockquote>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                &ldquo;O Lex mudou minha rotina. Não abro o e-SAJ há semanas, recebo tudo no
                Zap.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-3 text-slate-400 text-xs font-medium">
              — Dra. Beatriz Mendes
            </figcaption>
          </figure>
        </div>

        <p className="text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Lex. Todos os direitos reservados.
        </p>
      </div>

      {/* ── Painel Direito — Formulário ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
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
              <SuccessState key="success" onBack={onNavigateHome} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Comece agora</h1>
                  <p className="text-slate-500 text-sm">Teste grátis por 7 dias, sem compromisso.</p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <span aria-hidden="true">⚠️</span>
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <InputField
                    id="fullName"
                    label="Nome Completo"
                    type="text"
                    autoComplete="name"
                    placeholder="Dra. Nome Sobrenome"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    error={errors.fullName}
                    disabled={isLoading}
                  />

                  <InputField
                    id="email"
                    label="E-mail Profissional"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@escritorio.com.br"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    error={errors.email}
                    disabled={isLoading}
                  />

                  <PasswordInput
                    id="password"
                    label="Crie uma Senha"
                    autoComplete="new-password"
                    placeholder="Mín. 8 caracteres, 1 maiúscula e 1 número"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    error={errors.password}
                    disabled={isLoading}
                  />

                  <PasswordInput
                    id="confirmPassword"
                    label="Confirmar Senha"
                    autoComplete="new-password"
                    placeholder="Digite novamente sua senha"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                  />
                  {form.password.length > 0 && (
                    <PasswordStrengthBar password={form.password} />
                  )}

                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="acceptedTerms"
                        checked={form.acceptedTerms}
                        onChange={(e) => updateField('acceptedTerms', e.target.checked)}
                        aria-describedby={errors.acceptedTerms ? 'terms-error' : undefined}
                        disabled={isLoading}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 leading-relaxed">
                        Eu aceito os{' '}
                        <a href="/termos" className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium">Termos de Uso</a>{' '}
                        e a{' '}
                        <a href="/privacidade" className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium">Política de Privacidade</a>.
                      </span>
                    </label>
                    {errors.acceptedTerms && (
                      <p id="terms-error" role="alert" className="text-xs text-red-600 font-medium pl-7">
                        {errors.acceptedTerms}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Minha Conta'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Fazer Login
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

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Fraca',    color: 'bg-red-400' };
  if (score <= 2) return { level: 2, label: 'Razoável', color: 'bg-orange-400' };
  if (score <= 3) return { level: 3, label: 'Boa',      color: 'bg-yellow-400' };
  return             { level: 4, label: 'Forte',    color: 'bg-emerald-500' };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label, color } = getPasswordStrength(password);
  return (
    <div className="space-y-1.5" aria-live="polite" aria-label={`Força da senha: ${label}`}>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              bar <= level ? color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Força:{' '}
        <span className={`font-medium ${
          level === 1 ? 'text-red-500' :
          level === 2 ? 'text-orange-500' :
          level === 3 ? 'text-yellow-600' : 'text-emerald-600'
        }`}>{label}</span>
      </p>
    </div>
  );
}
