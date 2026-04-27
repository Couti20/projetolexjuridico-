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

import { Scale, CheckCircle2, Loader2, XCircle, Monitor, BrainCircuit, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnboardingForm } from '../hooks/useOnboardingForm';

const BENEFITS = [
  { icon: Monitor,       text: 'Monitoramento 24h nos tribunais (e-SAJ, PJe)' },
  { icon: BrainCircuit,  text: 'Resumo das movimentações por Inteligência Artificial' },
  { icon: Smartphone,    text: 'Alertas críticos direto no seu celular' },
];

interface OnboardingPageProps {
  onNavigateDashboard: () => void;
  onSkip: () => void;
}

export function OnboardingPage({ onNavigateDashboard, onSkip }: OnboardingPageProps) {
  const {
    form,
    errors,
    status,
    oabStatus,
    updateOab,
    updateWhatsApp,
    validateOabField,
    handleSubmit,
  } = useOnboardingForm();

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-blue-600 text-white p-2 rounded-xl">
          <Scale size={22} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Lex</span>
      </div>

      {/* ── Progresso ── */}
      <div className="w-full max-w-lg mb-6">
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: isSuccess ? '100%' : '50%' }} />
        </div>
      </div>

      {/* ── Card principal ── */}
      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* ── Tela de sucesso ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center text-center gap-5"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Assistente configurado!</h2>
              <p className="text-slate-500 max-w-xs mx-auto">
                Já começamos a buscar seus processos. Você receberá os primeiros alertas em breve.
              </p>
            </div>
            <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut', onComplete: onNavigateDashboard }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-400">Redirecionando para o painel...</p>
          </motion.div>
        ) : (
          /* ── Formulário ── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
          >
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Vamos configurar seu assistente</h1>
              <p className="text-slate-500 text-sm">Precisamos desses dados para monitorar seus prazos em tempo real.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-7">

              {/* ── Campo OAB ── */}
              <div className="space-y-1.5">
                <label htmlFor="oab" className="text-sm font-semibold text-slate-800">
                  1. Qual sua OAB principal?
                </label>
                <p className="text-xs text-slate-400 mb-2">Usaremos este número para buscar seus processos na API do Escavador.</p>

                <div className="relative flex items-center">
                  <input
                    id="oab"
                    type="text"
                    value={form.oab}
                    onChange={(e) => updateOab(e.target.value)}
                    placeholder="SP 123.456"
                    disabled={isLoading}
                    maxLength={12}
                    aria-describedby={errors.oab ? 'oab-error' : undefined}
                    aria-invalid={Boolean(errors.oab)}
                    className={[
                      'w-full rounded-xl border px-4 py-3 pr-24 text-sm text-slate-800 outline-none transition-all',
                      'placeholder:text-slate-400',
                      'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
                      errors.oab
                        ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                        : oabStatus === 'valid'
                          ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-400 focus:border-emerald-400'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                    ].join(' ')}
                  />

                  {/* Botão / ícone de validação */}
                  <div className="absolute right-3 flex items-center">
                    {oabStatus === 'validating' && (
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    )}
                    {oabStatus === 'valid' && (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                    {oabStatus === 'invalid' && (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    {(oabStatus === 'idle' || oabStatus === 'invalid') && form.oab.trim().length > 4 && (
                      <button
                        type="button"
                        onClick={validateOabField}
                        disabled={oabStatus === 'validating'}
                        className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Validar
                      </button>
                    )}
                  </div>
                </div>

                {errors.oab && (
                  <p id="oab-error" role="alert" className="text-xs text-red-600 font-medium">
                    {errors.oab}
                  </p>
                )}
                {oabStatus === 'valid' && !errors.oab && (
                  <p className="text-xs text-emerald-600 font-medium">OAB verificada com sucesso!</p>
                )}
              </div>

              {/* ── Campo WhatsApp ── */}
              <div className="space-y-1.5">
                <label htmlFor="whatsapp" className="text-sm font-semibold text-slate-800">
                  2. Onde quer receber os alertas?
                </label>
                <p className="text-xs text-slate-400 mb-2">Insira o número do WhatsApp que você usa no dia a dia.</p>

                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) => updateWhatsApp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                  maxLength={15}
                  aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
                  aria-invalid={Boolean(errors.whatsapp)}
                  className={[
                    'w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition-all',
                    'placeholder:text-slate-400',
                    'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
                    errors.whatsapp
                      ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                />

                {errors.whatsapp && (
                  <p id="whatsapp-error" role="alert" className="text-xs text-red-600 font-medium">
                    {errors.whatsapp}
                  </p>
                )}
              </div>

              {/* ── Benefits strip ── */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 space-y-2.5">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <Icon size={11} className="text-white" />
                    </span>
                    <span className="text-xs text-slate-600">{text}</span>
                  </div>
                ))}
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-xl"
              >
                {isLoading ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      aria-hidden="true"
                    />
                    Vinculando...
                  </>
                ) : (
                  'Vincular e Buscar Processos'
                )}
              </button>
            </form>

            {/* ── Skip ── */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Pular por enquanto e configurar depois
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
