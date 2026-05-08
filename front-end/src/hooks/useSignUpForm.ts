/**
 * Hook encapsulando toda a lógica do formulário de cadastro:
 * - Estado dos campos
 * - Validação síncrona
 * - Submissão (pronta para conectar à API futura)
 * - Feedback de status
 */

import { useState, useCallback, type FormEvent } from 'react';
import type { SignUpFormData, SignUpFormErrors, SignUpStatus } from '../types/auth';
import { authService } from '../services/authService';
import { ApiError } from '../services/api';

const INITIAL_FORM: SignUpFormData = {
  fullName: '',
  email: '',
  oab: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'Mínimo de 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Inclua 1 letra maiúscula.';
  if (!/[a-z]/.test(password)) return 'Inclua 1 letra minúscula.';
  if (!/[0-9]/.test(password)) return 'Inclua 1 número.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Inclua 1 caractere especial.';
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

  if (!data.oab.trim() || !/^[A-Za-z]{2}\s?\d{4,6}$/.test(data.oab.trim())) {
    errors.oab = 'Informe a OAB no formato UF 123456.';
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Senhas diferentes.';
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'Aceite os termos.';
  }

  return errors;
}

export function useSignUpForm() {
  const [form, setForm] = useState<SignUpFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [status, setStatus] = useState<SignUpStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const applyRealtimeValidation = useCallback(
    <K extends keyof SignUpFormData>(field: K, data: SignUpFormData, currentErrors: SignUpFormErrors) => {
      const nextErrors: SignUpFormErrors = { ...currentErrors };

      if (field === 'password') {
        nextErrors.password = validatePassword(data.password);
        if (data.confirmPassword) {
          nextErrors.confirmPassword = data.password === data.confirmPassword ? undefined : 'Senhas diferentes.';
        }
      }

      if (field === 'confirmPassword') {
        if (!data.confirmPassword) {
          nextErrors.confirmPassword = undefined;
        } else {
          nextErrors.confirmPassword = data.password === data.confirmPassword ? undefined : 'Senhas diferentes.';
        }
      }

      if (field === 'acceptedTerms') {
        nextErrors.acceptedTerms = data.acceptedTerms ? undefined : 'Aceite os termos.';
      }

      if (field === 'fullName' && nextErrors.fullName) {
        nextErrors.fullName = undefined;
      }

      if (field === 'email' && nextErrors.email) {
        nextErrors.email = undefined;
      }

      if (field === 'oab' && nextErrors.oab) {
        nextErrors.oab = undefined;
      }

      return nextErrors;
    },
    [],
  );

  const updateField = useCallback(
    <K extends keyof SignUpFormData>(field: K, value: SignUpFormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        setErrors((currentErrors) => applyRealtimeValidation(field, next, currentErrors));
        return next;
      });
    },
    [applyRealtimeValidation],
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
        await authService.register({
          fullName: form.fullName,
          email: form.email,
          oab: form.oab,
          password: form.password,
        });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        if (error instanceof ApiError && error.code === 'email_in_use') {
          setServerError('Este e-mail já está cadastrado. Faça login para continuar.');
          return;
        }
        setServerError('Não foi possível criar sua conta. Tente novamente.');
      }
    },
    [form],
  );

  return { form, errors, status, serverError, updateField, handleSubmit };
}
