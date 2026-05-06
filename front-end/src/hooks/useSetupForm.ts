/**
 * useSetupForm.ts — Formulário de configuração inicial.
 *
 * Stack: react-hook-form + zod + useMutation (TanStack Query) + react-imask.
 *
 * Máscaras aplicadas:
 *   - OAB    : UF + número  (ex: SP 123.456)
 *   - WhatsApp: (11) 99999-9999  →  E.164 no payload (+5511999999999)
 *
 * Transform E.164:
 *   O schema Zod converte o valor mascarado para o formato internacional
 *   exigido pelo backend FastAPI antes de enviar o POST.
 *   Ex: "(11) 99999-9999" → "+5511999999999"
 */

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const OAB_PATTERN = /^[A-Z]{2}\s*\d{4,6}$|^\d{4,6}\/[A-Z]{2}$/;

/**
 * Converte dígitos brutos para E.164 brasileiro.
 * Aceita 10 dígitos (fixo) ou 11 dígitos (celular), ambos com DDD.
 * Resultado: +55 + DDDnúmero → ex: +5511999999999
 */
function toE164Brazil(digits: string): string {
  // Remove eventual 55 de DDI duplicado que o usuário possa ter digitado
  const clean = digits.replace(/^55/, '').replace(/\D/g, '');
  return `+55${clean}`;
}

export const setupSchema = z.object({
  oab: z
    .string()
    .min(1, 'Informe seu número de OAB.')
    .transform((v) => v.trim().toUpperCase().replace(/[.-]/g, ''))
    .refine((v) => OAB_PATTERN.test(v), { message: 'Formato inválido. Ex: SP 123.456' }),

  whatsapp: z
    .string()
    .min(1, 'Informe seu número de WhatsApp.')
    // 1. Remove tudo que não for dígito
    .transform((v) => v.replace(/\D/g, ''))
    // 2. Valida: 10 dígitos (fixo com DDD) ou 11 dígitos (celular com DDD)
    .refine((v) => v.length === 10 || v.length === 11, {
      message: 'Número inválido. Ex: (11) 99999-9999',
    })
    // 3. Converte para E.164 (+55...)
    .transform((v) => toE164Brazil(v)),
});

export type SetupFormValues = z.infer<typeof setupSchema>;

// ── Máscaras de input ─────────────────────────────────────────────────────────

/**
 * Formata enquanto o usuário digita: (11) 99999-9999
 * Usado como fallback / utilitário quando react-imask não estiver disponível.
 */
export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formata OAB enquanto o usuário digita: SP 123456 */
export function maskOab(value: string): string {
  const upper = value.toUpperCase();
  const letters = upper.replace(/[^A-Z]/g, '').slice(0, 2);
  const digits = upper.replace(/[^0-9]/g, '').slice(0, 6);
  if (!letters) return digits;
  if (!digits) return letters;
  return `${letters} ${digits}`;
}

// ── Serviço mock (substituir pelo real quando o back estiver pronto) ──────────
async function saveSetupMock(data: SetupFormValues): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < 0.05) reject(new Error('Timeout simulado'));
      else resolve();
    }, 1200),
  );
  // TODO: substituir por: await setupService.saveSetup(data);
  // data.whatsapp já chegará no formato E.164 ex: +5511999999999
  void data;
}

// ── Validação online da OAB (Escavador) ──────────────────────────────────────
async function validateOabOnlineMock(oab: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  // TODO: substituir por: return escavadorService.validateOab(oab);
  return Boolean(oab);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

type OabValidationStatus = 'idle' | 'validating-oab' | 'oab-valid' | 'oab-invalid';

export function useSetupForm() {
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { oab: '', whatsapp: '' },
    mode: 'onTouched',
  });

  const submitMutation = useMutation({
    mutationFn: saveSetupMock,
    onError: (err) => {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Não foi possível salvar. Tente novamente.',
      });
    },
  });

  const oabValidationMutation = useMutation<boolean, Error, string>({
    mutationFn: validateOabOnlineMock,
    onSuccess: (isValid) => {
      if (!isValid) {
        form.setError('oab', { message: 'OAB não encontrada. Verifique o número.' });
      }
    },
    onError: () => {
      form.setError('oab', { message: 'Erro ao validar OAB. Tente novamente.' });
    },
  });

  const oabStatus: OabValidationStatus = oabValidationMutation.isPending
    ? 'validating-oab'
    : oabValidationMutation.isSuccess
    ? oabValidationMutation.data
      ? 'oab-valid'
      : 'oab-invalid'
    : 'idle';

  const validateOabOnline = useCallback(() => {
    const oab = form.getValues('oab');
    oabValidationMutation.mutate(oab);
  }, [form, oabValidationMutation]);

  const handleSubmit = form.handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  return {
    register: form.register,
    control: form.control,
    formState: form.formState,
    setValue: form.setValue,
    getValues: form.getValues,
    isLoading: submitMutation.isPending,
    isSuccess: submitMutation.isSuccess,
    serverError: form.formState.errors.root?.message ?? null,
    oabStatus,
    handleSubmit,
    validateOabOnline,
    maskWhatsApp,
    maskOab,
  };
}
