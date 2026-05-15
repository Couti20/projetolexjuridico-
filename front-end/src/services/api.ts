/**
 * api.ts — Camada de HTTP centralizada.
 *
 * Estratégia de fallback:
 * Cada método aceita um `resolver` opcional.
 * Se o back-end estiver offline (erro de rede) ou a rota não existir (404),
 * o resolver é executado como fallback (dados simulados / mock).
 * Erros de negócio (4xx/5xx com payload) continuam sendo propagados.
 *
 * O token JWT é lido do localStorage (chave: lex-auth-token).
 * Se o back-end retornar 401, dispara CustomEvent('lex:unauthorized').
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  /** Segundos restantes até poder tentar novamente (somente em respostas 429). */
  retryAfter?: number;
  /** Data/hora ISO em que o bloqueio expira (somente em respostas 429). */
  lockedUntil?: string;

  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfter?: number,
    lockedUntil?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
    this.lockedUntil = lockedUntil;
  }
}

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

function dispatchUnauthorized(): void {
  window.dispatchEvent(new CustomEvent('lex:unauthorized'));
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as T;
}

async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_URL ?? '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    dispatchUnauthorized();
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.', 'unauthorized');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const detail =
      typeof body.detail === 'string'
        ? body.detail
        : typeof body.message === 'string'
        ? body.message
        : 'Erro inesperado.';

    // Extrai retryAfter e lockedUntil presentes nas respostas 429 do back-end
    const retryAfter   = typeof body.retryAfter  === 'number' ? body.retryAfter  : undefined;
    const lockedUntil  = typeof body.lockedUntil === 'string' ? body.lockedUntil : undefined;

    throw new ApiError(
      response.status,
      detail,
      typeof body.code === 'string' ? body.code : undefined,
      retryAfter,
      lockedUntil,
    );
  }

  return parseResponseBody<T>(response);
}

interface RequestOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
}

function wait(ms: number): Promise<void> {
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

function isNetworkOrNotFound(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof ApiError && err.status === 404) return true;
  return false;
}

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
  },
};
