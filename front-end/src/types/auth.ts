/**
 * Tipos relacionados ao fluxo de autenticação (cadastro e login).
 * Centralizado aqui para reuso entre hooks, páginas e futuros serviços de API.
 */

export interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export interface SignUpFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  acceptedTerms?: string;
}

export type SignUpStatus = 'idle' | 'loading' | 'success' | 'error';
