/**
 * Tipos do fluxo de autenticação (cadastro e login).
 */

// ── Cadastro ────────────────────────────────────────────────
export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface SignUpFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
}

export type SignUpStatus = 'idle' | 'loading' | 'success' | 'error';

// ── Login ───────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export type LoginStatus = 'idle' | 'loading' | 'success' | 'error';
