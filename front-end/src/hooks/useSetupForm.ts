/**
 * Hook encapsulando toda a lógica do formulário de configuração inicial:
 * - Estado dos campos (OAB e WhatsApp)
 * - Validação da OAB (simulada, pronta para conectar à API do Escavador)
 * - Validação do WhatsApp
 * - Submissão pronta para conectar ao back-end
 */

import { useState, useCallback, type FormEvent } from 'react';
import type { SetupFormData, SetupFormErrors, SetupStatus } from '../types/setup';

const INITIAL_FORM: SetupFormData = {
  oab: '',
  whatsapp: '',
};

// Aceita formatos: SP 123.456 | SP123456 | 123456/SP
function validateOab(oab: string): string | undefined {
  const cleaned = oab.trim().toUpperCase();
  if (!cleaned) return 'Informe seu número de OAB.';
  const pattern = /^[A-Z]{2}\s*\d{4,6}$|^\d{4,6}\/[A-Z]{2}$/;
  if (!pattern.test(cleaned.replace('.', '').replace('-', ''))) {
    return 'Formato inválido. Ex: SP 123.456';
  }
  return undefined;
}

// Aceita (11) 99999-9999 ou +5511999999999
function validateWhatsApp(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 'Informe seu número de WhatsApp.';
  if (digits.length < 10 || digits.length > 13) {
    return 'Número inválido. Ex: (11) 99999-9999';
  }
  return undefined;
}

function validateForm(data: SetupFormData): SetupFormErrors {
  return {
    oab: validateOab(data.oab),
    whatsapp: validateWhatsApp(data.whatsapp),
  };
}

export function useSetupForm() {
  const [form, setForm] = useState<SetupFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<SetupFormErrors>({});
  const [status, setStatus] = useState<SetupStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof SetupFormData>(field: K, value: SetupFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Limpa erro do campo ao digitar
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      if (serverError) setServerError(null);
      // Reseta status de validação da OAB ao editar o campo
      if (field === 'oab') setStatus('idle');
    },
    [serverError],
  );

  // Valida a OAB via API do Escavador (simulado por enquanto)
  const validateOabOnline = useCallback(async () => {
    const localError = validateOab(form.oab);
    if (localError) {
      setErrors((prev) => ({ ...prev, oab: localError }));
      return;
    }

    setStatus('validating-oab');

    try {
      /**
       * TODO: substituir pela chamada real à API do Escavador.
       * Exemplo: await escavadorService.validateOab(form.oab);
       */
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulação
      setStatus('oab-valid');
      setErrors((prev) => ({ ...prev, oab: undefined }));
    } catch {
      setStatus('oab-invalid');
      setErrors((prev) => ({ ...prev, oab: 'OAB não encontrada. Verifique o número.' }));
    }
  }, [form.oab]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);

      const validationErrors = validateForm(form);
      const hasErrors = Object.values(validationErrors).some(Boolean);
      if (hasErrors) {
        setErrors(validationErrors);
        return;
      }

      setStatus('loading');

      try {
        /**
         * TODO: substituir pelo serviço real.
         * Exemplo: await setupService.saveSetup({ oab: form.oab, whatsapp: form.whatsapp });
         */
        await new Promise((resolve) => setTimeout(resolve, 1400)); // Simulação
        setStatus('success');
      } catch {
        setStatus('error');
        setServerError('Não foi possível salvar as configurações. Tente novamente.');
      }
    },
    [form],
  );

  return { form, errors, status, serverError, updateField, validateOabOnline, handleSubmit };
}
