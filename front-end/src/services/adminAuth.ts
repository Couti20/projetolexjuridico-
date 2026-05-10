import type { AuthUser } from '../types/auth';

export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASSWORD = 'admin';
export const ADMIN_ACCESS_TOKEN = 'lex-admin-token';

export function normalizeLogin(value: string): string {
  return value.trim().toLowerCase();
}

export function isAdminLogin(email: string, password: string): boolean {
  const normalizedLogin = normalizeLogin(email);
  return (normalizedLogin === ADMIN_LOGIN || normalizedLogin === 'admin@lex.local') && password === ADMIN_PASSWORD;
}

export function isAdminToken(token?: string | null): boolean {
  return token === ADMIN_ACCESS_TOKEN;
}

export function getAdminUser(): AuthUser {
  return {
    id: 'admin-user',
    fullName: 'Administrador Lex',
    email: 'admin@lex.local',
    oab: '',
    setupCompleted: true,
    isAdmin: true,
  };
}
