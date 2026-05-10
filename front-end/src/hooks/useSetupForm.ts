/**
 * useSetupForm.ts — Formulário de configuração inicial.
 *
 * Stack: react-hook-form + zod + useMutation (TanStack Query) + react-imask.
 *
 * Máscaras aplicadas:
 *   - OAB    : UF + número  (ex: SP 123.456)
 *   - WhatsApp: (11) 99999-9999  →  E.164 no payload (+5511999999999)
 */

import { useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthUser } from '../types/auth';

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const OAB_PATTERN = /^[A-Z]{2}\s*\d{4,6}$|^\d{4,6}\/[A-Z]{2}$/;

function toE164Brazil(digits: string): string {
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
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 10 || v.length === 11, {
      message: 'Número inválido. Ex: (11) 99999-9999',
    })
    .transform((v) => toE164Brazil(v)),
});

export type SetupFormValues = z.infer<typeof setupSchema>;

// ── Máscaras de input ──────────────────────────────────────────────────────────

export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function maskOab(value: string): string {
  const upper = value.toUpperCase();
  const letters = upper.replace(/[^A-Z]/g, '').slice(0, 2);
  const digits = upper.replace(/[^0-9]/g, '').slice(0, 6);
  if (!letters) return digits;
  if (!digits) return letters;
  return `${letters} ${digits}`;
}

// ── Validação online da OAB (mock — substituir por Escavador) ─────────────────
async function validateOabOnlineMock(oab: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  // TODO: substituir por: return escavadorService.validateOab(oab);
  return Boolean(oab);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

type OabValidationStatus = 'idle' | 'validating-oab' | 'oab-valid' | 'oab-invalid';

export function useSetupForm() {
  const auth = useContext(AuthContext);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { oab: '', whatsapp: '' },
    mode: 'onTouched',
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SetupFormValues) => {
      // PUT /users/me/setup — persiste OAB e marca setup_completed = true no banco
      const updatedUser = await api.put<
        { oab: string; whatsapp: string },
        AuthUser
      >('/users/me/setup', { oab: data.oab, whatsapp: data.whatsapp });
      return { updatedUser, oab: data.oab };
    },
    onSuccess: ({ updatedUser, oab }) => {
      if (auth) {
        if (updatedUser?.setupCompleted !== undefined) {
          auth.updateUser(updatedUser);
          auth.completeSetup(updatedUser.oab ?? oab);
        } else {
          auth.completeSetup(oab);
        }
      }
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar. Tente novamente.';
      form.setError('root', { message });
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
