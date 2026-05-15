/**
 * Hook encapsulando toda a lógica do formulário de login:
 * - Estado dos campos
 * - Validação síncrona
 * - Submissão (pronta para conectar à API futura)
 * - Feedback de status e erro de servidor
 * - Contador regressivo quando a conta está bloqueada (429)
 */

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import type { AuthUser, LoginFormData, LoginFormErrors, LoginStatus } from '../types/auth';
import { authService } from '../services/authService';
import { ApiError, setAuthToken } from '../services/api';
import { isAdminLogin } from '../services/adminAuth';

const INITIAL_FORM: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

function validateForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const adminShortcut = isAdminLogin(data.email, data.password);

  if (!adminShortcut && (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!adminShortcut && (!data.password || data.password.length < 6)) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export function useLoginForm() {
  const [form, setForm] = useState<LoginFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  // Contador regressivo de bloqueio (segundos restantes)
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inicia o contador quando bloqueado
  const startCountdown = useCallback((seconds: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setLockCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Limpa o intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const isLocked = lockCountdown > 0;

  const updateField = useCallback(
    <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof LoginFormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      if (serverError) setServerError(null);
      if (authenticatedUser) setAuthenticatedUser(null);
    },
    [authenticatedUser, errors, serverError],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Bloqueia novo envio enquanto o contador estiver ativo
      if (isLocked) return;

      setServerError(null);
      setAuthenticatedUser(null);

      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setStatus('loading');

      try {
        const response = await authService.login({
          email: form.email,
          password: form.password,
        });

        setAuthToken(response.accessToken);
        setAuthenticatedUser(response.user);
        setStatus('success');
      } catch (error) {
        setStatus('error');

        if (error instanceof ApiError) {
          // 429 — conta bloqueada: mostra mensagem do back + inicia contador
          if (error.status === 429) {
            if (error.retryAfter && error.retryAfter > 0) {
              startCountdown(error.retryAfter);
            }
            // A mensagem já vem formatada do back-end (ex: "bloqueada por 5 minuto(s)")
            setServerError(error.message);
            return;
          }

          // 401 — credenciais erradas
          if (error.code === 'invalid_credentials' || error.status === 401) {
            setServerError('E-mail ou senha incorretos. Verifique suas credenciais.');
            return;
          }
        }

        setServerError('Não foi possível autenticar agora. Tente novamente em instantes.');
      }
    },
    [form, isLocked, startCountdown],
  );

  return {
    form,
    errors,
    status,
    serverError,
    authenticatedUser,
    lockCountdown,
    isLocked,
    updateField,
    handleSubmit,
  };
}
