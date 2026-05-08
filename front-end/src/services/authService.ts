import { ApiError, api, clearAuthToken } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  oab: string;
  password: string;
}

function isValidLoginResponse(value: unknown): value is LoginResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const user = candidate.user as Record<string, unknown> | undefined;

  return Boolean(
    user &&
    typeof user.id === 'string' &&
    typeof user.fullName === 'string' &&
    typeof user.email === 'string' &&
    typeof user.oab === 'string' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.expiresIn === 'number',
  );
}

function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    throw new ApiError(500, 'VITE_API_URL não configurada no front-end.', 'api_url_missing');
  }
  return url.replace(/\/+$/, '');
}

async function fetchAuthEndpoint<TBody extends Record<string, unknown>, TResponse>(
  path: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => ({})) as Record<string, unknown>;

  if (!response.ok) {
    const detail = typeof responseBody.detail === 'string'
      ? responseBody.detail
      : typeof responseBody.message === 'string'
      ? responseBody.message
      : 'Erro inesperado.';

    const code =
      response.status === 401 ? 'invalid_credentials'
      : response.status === 409 ? 'email_in_use'
      : response.status === 422 ? 'validation_error'
      : response.status === 503 ? 'service_unavailable'
      : 'request_failed';

    throw new ApiError(response.status, detail, code);
  }

  return responseBody as TResponse;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const isValidPassword = typeof payload.password === 'string' && payload.password.length >= 6;

    if (!isValidEmail || !isValidPassword) {
      throw new ApiError(401, 'E-mail ou senha incorretos.', 'invalid_credentials');
    }

    const response = await fetchAuthEndpoint<{ email: string; password: string }, LoginResponse>(
      '/auth/login',
      {
        email: normalizedEmail,
        password: payload.password,
      },
    );
    if (!isValidLoginResponse(response)) {
      throw new ApiError(502, 'Resposta inválida do servidor de autenticação.', 'invalid_auth_response');
    }

    return response;
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    return fetchAuthEndpoint<
      { full_name: string; email: string; oab: string; password: string },
      LoginResponse
    >('/auth/register', {
      full_name: payload.fullName.trim(),
      email: normalizedEmail,
      oab: payload.oab.trim().toUpperCase(),
      password: payload.password,
    });
  },

  async logout(): Promise<void> {
    const token = window.localStorage.getItem('lex-auth-token') ?? undefined;
    try {
      if (token) {
        await fetchAuthEndpoint('/auth/logout', {}, token);
      } else {
        await api.post('/auth/logout', {}, () => ({ ok: true }), { minDelayMs: 120, maxDelayMs: 260 });
      }
    } finally {
      clearAuthToken();
    }
  },
};
