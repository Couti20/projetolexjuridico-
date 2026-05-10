/**
 * api.ts — Camada de HTTP centralizada.
 *
 * O token JWT é lido do localStorage (chave: lex-auth-token).
 *
 * Se o back-end retornar 401, dispara CustomEvent('lex:unauthorized').
 * O AuthProvider escuta esse evento e faz logout + redi-reciona via React Router.
 * Isso evita window.location.href (hard reload que destroça o estado React).
 */

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ── JWT helpers ───────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'lex-auth-token';

export function getAuthToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

// ── Interceptor de fetch com JWT ──────────────────────────────────────────
function dispatchUnauthorized(): void {
  // Emite evento global — o AuthProvider escuta e faz logout sem hard reload
  window.dispatchEvent(new CustomEvent('lex:unauthorized'));
}

async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_URL ?? '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    dispatchUnauthorized(); // ← event— sem hard reload
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.', 'unauthorized');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const detail =
      typeof body.detail === 'string' ? body.detail :
      typeof body.message === 'string' ? body.message :
      'Erro inesperado.';
    throw new ApiError(
      response.status,
      detail,
      typeof body.code === 'string' ? body.code : undefined,
    );
  }

  return response.json() as Promise<T>;
}

// ── Helpers de delay (usados em animações de loading opcionais) ────────────
interface RequestOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
}

function wait(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function withOptionalDelay<T>(fn: () => Promise<T>, options?: RequestOptions): Promise<T> {
  const min = options?.minDelayMs ?? 0;
  const max = options?.maxDelayMs ?? 0;
  if (max > 0 && max > min) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await wait(delay);
  }
  return fn();
}

// ── Interface pública ───────────────────────────────────────────────────────────────────
export const api = {
  get<T>(
    path: string,
    _resolver?: () => T | Promise<T>,
    options?: RequestOptions,
  ) {
    return withOptionalDelay(() => fetchWithAuth<T>(path), options);
  },

  post<TBody, TResponse>(
    path: string,
    body: TBody,
    _resolver?: (body: TBody) => TResponse | Promise<TResponse>,
    options?: RequestOptions,
  ) {
    return withOptionalDelay(
      () => fetchWithAuth<TResponse>(path, { method: 'POST', body: JSON.stringify(body) }),
      options,
    );
  },

  put<TBody, TResponse>(
    path: string,
    body: TBody,
    _resolver?: (body: TBody) => TResponse | Promise<TResponse>,
    options?: RequestOptions,
  ) {
    return withOptionalDelay(
      () => fetchWithAuth<TResponse>(path, { method: 'PUT', body: JSON.stringify(body) }),
      options,
    );
  },

  delete<TResponse>(
    path: string,
    options?: RequestOptions,
  ) {
    return withOptionalDelay(
      () => fetchWithAuth<TResponse>(path, { method: 'DELETE' }),
      options,
    );
  },
};
