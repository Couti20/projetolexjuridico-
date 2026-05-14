/**
 * userService.ts
 * Serviços de perfil do usuário autenticado.
 *
 * GET  /users/me          → getMe()
 * PUT  /users/me/password → changePassword()
 */
import { ApiError } from './api';
import { getAdminUser, isAdminToken } from './adminAuth';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  oab: string;
  plan: string;
  created_at: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

function getBaseUrl(): string {
  if (import.meta.env.DEV) return '';
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!url) throw new ApiError(500, 'VITE_API_URL não configurada.', 'api_url_missing');
  return url.replace(/\/+$/, '');
}

function getAuthHeader(): HeadersInit {
  const token = window.localStorage.getItem('lex-auth-token');
  if (!token) throw new ApiError(401, 'Sessão expirada. Faça login novamente.', 'no_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;

  if (!response.ok) {
    const detail =
      typeof body.detail === 'string' ? body.detail :
      typeof body.message === 'string' ? body.message :
      'Erro inesperado.';

    const code =
      response.status === 401 ? 'unauthorized' :
      response.status === 422 ? 'validation_error' :
      response.status === 404 ? 'not_found' :
      'request_failed';

    throw new ApiError(response.status, detail, code);
  }

  return body as T;
}

export const userService = {
  /**
   * Busca o perfil completo do usuário logado.
   * Usado para sincronizar o AuthContext após atualizações.
   */
  async getMe(): Promise<UserProfile> {
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      const admin = getAdminUser();
      return {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        oab: admin.oab ?? '',
        plan: 'Enterprise',
        created_at: new Date().toISOString(),
      };
    }
    const response = await fetch(`${getBaseUrl()}/users/me`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse<UserProfile>(response);
  },

  /**
   * Troca a senha do usuário autenticado.
   * O back-end valida a senha atual antes de persistir a nova.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ ok: boolean; message: string }> {
    const token = window.localStorage.getItem('lex-auth-token');
    if (isAdminToken(token)) {
      if (!payload.newPassword || payload.newPassword.length < 6) {
        throw new ApiError(422, 'A nova senha deve ter ao menos 6 caracteres.', 'validation_error');
      }

      return { ok: true, message: 'Senha do admin atualizada com sucesso.' };
    }
    const response = await fetch(`${getBaseUrl()}/users/me/password`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      }),
    });
    return handleResponse<{ ok: boolean; message: string }>(response);
  },
};
