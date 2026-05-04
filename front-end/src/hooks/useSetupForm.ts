/**
 * useSetupForm.ts — Formulário de configuração inicial.
 *
 * Migrado para react-hook-form + zod + useMutation (TanStack Query).
 *
 * Máscaras aplicadas:
 *   - OAB: UF + número (ex: SP 123.456)
 *   - WhatsApp: (11) 99999-9999
 *
 * O useMutation substitui o setTimeout simulado anterior.
 * Quando o back-end estiver pronto, basta trocar a fn do mutationFn
 * pelo serviço real (setupService.saveSetup).
 */

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const OAB_PATTERN = /^[A-Z]{2}\s*\d{4,6}$|^\d{4,6}\/[A-Z]{2}$/;

export const setupSchema = z.object({
  oab: z
    .string()
    .min(1, 'Informe seu número de OAB.')
    .transform((v) => v.trim().toUpperCase().replace(/[.-]/g, ''))
    .refine((v) => OAB_PATTERN.test(v), { message: 'Formato inválido. Ex: SP 123.456' }),
  whatsapp: z
    .string()
    .min(1, 'Informe seu número de WhatsApp.')
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 13, {
      message: 'Número inválido. Ex: (11) 99999-9999',
    }),
});

export type SetupFormValues = z.infer<typeof setupSchema>;

// ── Máscaras de input ─────────────────────────────────────────────────────────

/** Formata enquanto o usuário digita: (11) 99999-9999 */
export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2)  return digits.length ? `(${digits}` : '';
  if (digits.length <= 7)  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formata OAB enquanto o usuário digita: SP 123456 */
export function maskOab(value: string): string {
  const upper = value.toUpperCase();
  const letters = upper.replace(/[^A-Z]/g, '').slice(0, 2);
  const digits  = upper.replace(/[^0-9]/g, '').slice(0, 6);
  if (!letters) return digits;
  if (!digits)  return letters;
  return `${letters} ${digits}`;
}

// ── Serviço mock (substituir pelo real quando o back estiver pronto) ──────────
async function saveSetupMock(data: SetupFormValues): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    setTimeout(() => {
      // Simula falha ocasional para testar o tratamento de erro
      if (Math.random() < 0.05) reject(new Error('Timeout simulado'));
      else resolve();
    }, 1200),
  );
  // TODO: substituir por: await setupService.saveSetup(data);
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

  // ── Mutation de submit ────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: saveSetupMock,
    onError: (err) => {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Não foi possível salvar. Tente novamente.',
      });
    },
  });

  // ── Mutation de validação OAB online ─────────────────────────────────────
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
    ? (oabValidationMutation.data ? 'oab-valid' : 'oab-invalid')
    : 'idle';

  const validateOabOnline = useCallback(() => {
    const oab = form.getValues('oab');
    oabValidationMutation.mutate(oab);
  }, [form, oabValidationMutation]);

  const handleSubmit = form.handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  return {
    // react-hook-form
    register: form.register,
    control: form.control,
    formState: form.formState,
    setValue: form.setValue,
    getValues: form.getValues,
    // status derivado
    isLoading: submitMutation.isPending,
    isSuccess: submitMutation.isSuccess,
    serverError: form.formState.errors.root?.message ?? null,
    oabStatus,
    // ações
    handleSubmit,
    validateOabOnline,
    // máscaras exportadas para uso no JSX
    maskWhatsApp,
    maskOab,
  };
}
