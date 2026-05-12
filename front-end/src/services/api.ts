/**
 * api.ts — Camada de HTTP centralizada.
 *
<<<<<<< HEAD
 * O token JWT é lido do localStorage (chave: lex-auth-token).
 *
 * Se o back-end retornar 401, dispara CustomEvent('lex:unauthorized').
 * O AuthProvider escuta esse evento e faz logout + redi-reciona via React Router.
 * Isso evita window.location.href (hard reload que destroça o estado React).
=======
 * Estratégia de fallback:
 *   Cada método aceita um `resolver` opcional.
 *   Se o back-end estiver offline ou retornar erro de rede,
 *   o resolver é executado como fallback (dados simulados / mock).
 *   Erros de negócio (4xx/5xx com payload) ainda são propagados normalmente.
 *
 * O token JWT é lido do localStorage (chave: lex-auth-token).
 * Se o back-end retornar 401, dispara CustomEvent('lex:unauthorized').
>>>>>>> develop
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

<<<<<<< HEAD
// ── JWT helpers ───────────────────────────────────────────────────────────────────
=======
// ── JWT helpers ────────────────────────────────────────────────────
>>>>>>> develop
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

<<<<<<< HEAD
// ── Interceptor de fetch com JWT ──────────────────────────────────────────
function dispatchUnauthorized(): void {
  // Emite evento global — o AuthProvider escuta e faz logout sem hard reload
=======
// ── Interceptor de fetch com JWT ────────────────────────────────────────
function dispatchUnauthorized(): void {
>>>>>>> develop
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
<<<<<<< HEAD
    dispatchUnauthorized(); // ← event— sem hard reload
=======
    dispatchUnauthorized();
>>>>>>> develop
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

<<<<<<< HEAD
// ── Helpers de delay (usados em animações de loading opcionais) ────────────
=======
// ── Helpers de delay ─────────────────────────────────────────────────────────────────
>>>>>>> develop
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

<<<<<<< HEAD
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
=======
// ── Verifica se o erro é de rede/indisponibilidade (não de negócio) ──────────────
// Erros de negócio (ApiError com status 4xx/5xx) são propagados normalmente.
// Erros de rede (TypeError: Failed to fetch, 404 de rota inexistente) ativam o fallback.
function isNetworkOrNotFound(err: unknown): boolean {
  if (err instanceof TypeError) return true; // Failed to fetch, CORS, offline
  if (err instanceof ApiError && err.status === 404) return true; // rota ainda não existe
  return false;
}

// ── Interface pública ──────────────────────────────────────────────────────────────────
export const api = {
  async get<T>(
    path: string,
    resolver?: () => T | Promise<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return withOptionalDelay(async () => {
      try {
        return await fetchWithAuth<T>(path);
      } catch (err) {
        if (resolver && isNetworkOrNotFound(err)) {
          return resolver();
        }
        throw err;
      }
    }, options);
  },

  async post<TBody, TResponse>(
    path: string,
    body: TBody,
    resolver?: (body: TBody) => TResponse | Promise<TResponse>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return withOptionalDelay(async () => {
      try {
        return await fetchWithAuth<TResponse>(path, { method: 'POST', body: JSON.stringify(body) });
      } catch (err) {
        if (resolver && isNetworkOrNotFound(err)) {
          return resolver(body);
        }
        throw err;
      }
    }, options);
  },

  async put<TBody, TResponse>(
    path: string,
    body: TBody,
    resolver?: (body: TBody) => TResponse | Promise<TResponse>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return withOptionalDelay(async () => {
      try {
        return await fetchWithAuth<TResponse>(path, { method: 'PUT', body: JSON.stringify(body) });
      } catch (err) {
        if (resolver && isNetworkOrNotFound(err)) {
          return resolver(body);
        }
        throw err;
      }
    }, options);
  },

  async delete<TResponse>(
    path: string,
    resolver?: () => TResponse | Promise<TResponse>,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return withOptionalDelay(async () => {
      try {
        return await fetchWithAuth<TResponse>(path, { method: 'DELETE' });
      } catch (err) {
        if (resolver && isNetworkOrNotFound(err)) {
          return resolver();
        }
        throw err;
      }
    }, options);
>>>>>>> develop
  },
};
