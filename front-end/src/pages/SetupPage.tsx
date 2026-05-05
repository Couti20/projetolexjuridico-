/**
 * SetupPage — Onboarding pós-login.
 *
 * Campo WhatsApp usa IMaskInput (react-imask) com máscara (00) 00000-0000.
 * O valor entregue ao Zod ainda é a string mascarada; o schema transforma
 * para E.164 (+5511999999999) antes de enviar ao FastAPI.
 */

import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { Scale, CheckCircle2, Loader2, AlertCircle, Monitor, Brain, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSetupForm } from '../hooks/useSetupForm';
import { InputField } from '../ui/InputField';

const BENEFITS = [
  { icon: Monitor, text: 'Monitoramento 24h nos tribunais (e-SAJ, PJe)' },
  { icon: Brain,   text: 'Resumo das movimentações por Inteligência Artificial' },
  { icon: Bell,    text: 'Alertas críticos direto no seu celular' },
];

interface SetupPageProps {
  onSkip: () => void;
  onNavigateDashboard: () => void;
}

export function SetupPage({ onSkip, onNavigateDashboard }: SetupPageProps) {
  const {
    control,
    formState: { errors },
    isLoading,
    isSuccess,
    serverError,
    register,
    oabStatus,
    validateOabOnline,
    handleSubmit,
    maskOab,
  } = useSetupForm();

  const isValidatingOab = oabStatus === 'validating-oab';
  const isOabValid      = oabStatus === 'oab-valid';

  useEffect(() => {
    if (!isSuccess) return;
    const timeoutId = window.setTimeout(() => {
      onNavigateDashboard();
    }, 1600);
    return () => window.clearTimeout(timeoutId);
  }, [isSuccess, onNavigateDashboard]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-blue-600 text-white p-2 rounded-xl">
          <Scale size={22} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Lex</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <motion.div
            initial={{ width: '30%' }}
            animate={{ width: isSuccess ? '100%' : isOabValid ? '70%' : '40%' }}
            transition={{ duration: 0.5 }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>

        <div className="p-8 sm:p-10">
          <AnimatePresence mode="wait">

            {/* ── Sucesso ── */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center gap-5 py-8"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Tudo configurado!</h2>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Seu assistente já está monitorando seus processos. Redirecionando para o dashboard...
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

              /* ── Formulário ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Vamos configurar seu assistente
                  </h1>
                  <p className="text-sm text-slate-500">
                    Precisamos desses dados para monitorar seus prazos em tempo real.
                  </p>
                </div>

                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-6">

                  {/* ── Campo OAB ── */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-800">
                      1. Qual sua OAB principal?
                    </p>
                    <p className="text-xs text-slate-500 -mt-1">
                      Usaremos este número para buscar seus processos na API do Escavador.
                    </p>

                    <div className="relative">
                      <input
                        id="oab"
                        type="text"
                        placeholder="SP 123.456"
                        disabled={isLoading}
                        aria-invalid={Boolean(errors.oab)}
                        aria-describedby={errors.oab ? 'oab-error' : undefined}
                        {...register('oab', {
                          onChange: (e) => {
                            e.target.value = maskOab(e.target.value);
                          },
                        })}
                        className={[
                          'w-full rounded-xl border px-4 py-3 pr-24 text-sm text-slate-800 outline-none transition-all',
                          'placeholder:text-slate-400',
                          'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
                          errors.oab
                            ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                            : isOabValid
                            ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-400 focus:border-emerald-400'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                        ].join(' ')}
                      />

                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidatingOab ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : isOabValid ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
                          >
                            <CheckCircle2 size={14} />
                            Válida
                          </motion.span>
                        ) : (
                          <button
                            type="button"
                            onClick={validateOabOnline}
                            disabled={isLoading}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Validar
                          </button>
                        )}
                      </div>
                    </div>

                    {errors.oab && (
                      <p id="oab-error" role="alert" className="text-xs text-red-600 font-medium">
                        {errors.oab.message}
                      </p>
                    )}
                  </div>

                  {/* ── Campo WhatsApp com react-imask ── */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-800">
                      2. Onde quer receber os alertas?
                    </p>
                    <p className="text-xs text-slate-500 -mt-1">
                      Insira o número do WhatsApp com DDD. Enviaremos os alertas de prazo aqui.
                    </p>

                    <Controller
                      name="whatsapp"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <IMaskInput
                            {...field}
                            id="whatsapp"
                            mask="(00) 00000-0000"
                            unmask={false}
                            placeholder="(11) 99999-9999"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            disabled={isLoading}
                            aria-invalid={Boolean(errors.whatsapp)}
                            aria-describedby={errors.whatsapp ? 'whatsapp-error' : 'whatsapp-hint'}
                            onAccept={(value: string) => field.onChange(value)}
                            className={[
                              'w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition-all',
                              'placeholder:text-slate-400',
                              'focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
                              errors.whatsapp
                                ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
                                : 'border-slate-200 bg-white hover:border-slate-300',
                            ].join(' ')}
                          />
                          <p id="whatsapp-hint" className="mt-1 text-xs text-slate-400">
                            Formato: (DDD) + número. Ex: (11) 99999-9999
                          </p>
                          {errors.whatsapp && (
                            <p id="whatsapp-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                              {errors.whatsapp.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Benefícios */}
                  <ul className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 space-y-2.5">
                    {BENEFITS.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <Icon size={11} className="text-white" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  {/* Botão submit */}
                  <button
                    type="submit"
                    disabled={isLoading || isValidatingOab}
                    className="w-full btn-primary py-3.5 font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
      </div>
    </div>
  );
}
