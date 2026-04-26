/**
 * Hook encapsulando toda a lógica do formulário de login:
 * - Estado dos campos
 * - Validação síncrona
 * - Submissão (pronta para conectar à API futura)
 * - Feedback de status e erro de servidor
 */

import { useState, useCallback, type FormEvent } from 'react';
import type { LoginFormData, LoginFormErrors, LoginStatus } from '../types/auth';

const INITIAL_FORM: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

function validateForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!data.password || data.password.length < 6) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export function useLoginForm() {
  const [form, setForm] = useState<LoginFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof LoginFormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      // Limpa erro de servidor ao editar qualquer campo
      if (serverError) setServerError(null);
    },
    [errors, serverError],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setStatus('loading');

      try {
        /**
         * TODO: substituir pelo serviço real quando o back-end estiver pronto.
         * Exemplo: await authService.login({ email: form.email, password: form.password })
         */
        await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulação

        // Simulação: credenciais erradas para demo
        const isValid = form.email.includes('@') && form.password.length >= 6;
        if (!isValid) throw new Error('invalid_credentials');

        setStatus('success');
      } catch {
        setStatus('error');
        setServerError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    },
    [form],
  );

  return { form, errors, status, serverError, updateField, handleSubmit };
}
