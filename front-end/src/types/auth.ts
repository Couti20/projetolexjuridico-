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

// ── Sessão (contexto de autenticação) ─────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  oab?: string;
}

export interface AuthSession {
  user: AuthUser;
  authenticatedAt: number;
}
