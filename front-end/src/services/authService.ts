import type { AuthUser } from '../types/auth';
import { ApiError, api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

function toDisplayName(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const pieces = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (pieces.length === 0) return 'Usuario Lex';

  return pieces
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ');
}

function buildMockUser(email: string): AuthUser {
  return {
    id: `user-${email.toLowerCase()}`,
    fullName: toDisplayName(email),
    email: email.toLowerCase(),
    oab: 'OAB/SP 123.456',
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return api.post('/auth/login', payload, ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
      const isValidPassword = typeof password === 'string' && password.length >= 6;

      if (!isValidEmail || !isValidPassword) {
        throw new ApiError(401, 'E-mail ou senha incorretos.', 'invalid_credentials');
      }

      return {
        user: buildMockUser(normalizedEmail),
        accessToken: `mock-token-${Date.now()}`,
        expiresIn: 3600,
      };
    });
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout', {}, () => ({ ok: true }), { minDelayMs: 120, maxDelayMs: 260 });
  },
};
