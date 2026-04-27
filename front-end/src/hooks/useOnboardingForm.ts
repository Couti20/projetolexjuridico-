/**
 * Hook encapsulando toda a lógica do formulário de onboarding:
 * - Estado dos campos (OAB + WhatsApp)
 * - Validação síncrona
 * - Estado de validação da OAB (idle | validating | valid | invalid)
 * - Submissão (pronta para conectar à API futura)
 * - Feedback de status
 */

import { useState, useCallback, type FormEvent } from 'react';

export type OabValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';
export type OnboardingStatus = 'idle' | 'loading' | 'success' | 'error';

interface OnboardingFormData {
  oab: string;
  whatsapp: string;
}

interface OnboardingFormErrors {
  oab?: string;
  whatsapp?: string;
}

const INITIAL_FORM: OnboardingFormData = {
  oab: '',
  whatsapp: '',
};

/** Formato aceito: UF + espaço + número. Ex: SP 123.456 ou SP 123456 */
function validateOab(value: string): string | undefined {
  if (!value.trim()) return 'Informe seu número de OAB.';
  if (!/^[A-Z]{2}\s*\d{3,7}/.test(value.trim().toUpperCase())) {
    return 'Formato inválido. Use: SP 123456';
  }
  return undefined;
}

/** Aceita formatos: (11) 99999-9999 ou 11999999999 */
function validateWhatsApp(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Informe seu número de WhatsApp.';
  if (digits.length < 10 || digits.length > 13) {
    return 'Número inválido. Ex: (11) 99999-9999';
  }
  return undefined;
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function useOnboardingForm() {
  const [form, setForm] = useState<OnboardingFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<OnboardingFormErrors>({});
  const [status, setStatus] = useState<OnboardingStatus>('idle');
  const [oabStatus, setOabStatus] = useState<OabValidationStatus>('idle');

  const updateOab = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, oab: value.toUpperCase() }));
    setOabStatus('idle');
    if (errors.oab) setErrors((prev) => ({ ...prev, oab: undefined }));
  }, [errors.oab]);

  const updateWhatsApp = useCallback((value: string) => {
    const formatted = formatWhatsApp(value);
    setForm((prev) => ({ ...prev, whatsapp: formatted }));
    if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: undefined }));
  }, [errors.whatsapp]);

  const validateOabField = useCallback(async () => {
    const error = validateOab(form.oab);
    if (error) {
      setErrors((prev) => ({ ...prev, oab: error }));
      return;
    }
    setOabStatus('validating');
    try {
      /**
       * TODO: substituir pela chamada real à API do Escavador / OAB.
       * Exemplo: await oabService.validate(form.oab)
       */
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOabStatus('valid');
    } catch {
      setOabStatus('invalid');
      setErrors((prev) => ({ ...prev, oab: 'OAB não encontrada. Verifique o número.' }));
    }
  }, [form.oab]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newErrors: OnboardingFormErrors = {
        oab: validateOab(form.oab),
        whatsapp: validateWhatsApp(form.whatsapp),
      };

      const hasErrors = Object.values(newErrors).some(Boolean);
      if (hasErrors) {
        setErrors(newErrors);
        return;
      }

      setStatus('loading');
      try {
        /**
         * TODO: substituir pelo serviço real.
         * Exemplo: await userService.saveOnboarding({ oab: form.oab, whatsapp: form.whatsapp })
         */
        await new Promise((resolve) => setTimeout(resolve, 1400));
        setStatus('success');
      } catch {
        setStatus('error');
      }
    },
    [form],
  );

  return {
    form,
    errors,
    status,
    oabStatus,
    updateOab,
    updateWhatsApp,
    validateOabField,
    handleSubmit,
  };
}
