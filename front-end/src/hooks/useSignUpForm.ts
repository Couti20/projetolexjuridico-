/**
 * Hook encapsulando toda a lógica do formulário de cadastro:
 * - Estado dos campos
 * - Validação síncrona
 * - Submissão (pronta para conectar à API futura)
 * - Feedback de status
 */

import { useState, useCallback, type FormEvent } from 'react';
import type { SignUpFormData, SignUpFormErrors, SignUpStatus } from '../types/auth';

const INITIAL_FORM: SignUpFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Inclua ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(password)) return 'Inclua ao menos um número.';
  return undefined;
}

function validateForm(data: SignUpFormData): SignUpFormErrors {
  const errors: SignUpFormErrors = {};

  if (!data.fullName.trim() || data.fullName.trim().split(' ').length < 2) {
    errors.fullName = 'Informe seu nome completo (nome e sobrenome).';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'Você precisa aceitar os termos para continuar.';
  }

  return errors;
}

export function useSignUpForm() {
  const [form, setForm] = useState<SignUpFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [status, setStatus] = useState<SignUpStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof SignUpFormData>(field: K, value: SignUpFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Limpa o erro do campo ao editar
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
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
         * Exemplo: await authService.signUp(form);
         */
        await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulação
        setStatus('success');
      } catch {
        setStatus('error');
        setServerError('Não foi possível criar sua conta. Tente novamente.');
      }
    },
    [form],
  );

  return { form, errors, status, serverError, updateField, handleSubmit };
}
