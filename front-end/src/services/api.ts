/**
 * api.ts — Camada de HTTP centralizada.
 *
 * Em desenvolvimento: usa mockRequest (sem servidor real).
 * Em produção: usa fetch nativo com interceptor JWT automático.
 *
 * O token JWT é lido do localStorage (chave: lex-auth-token).
 * Se o backend retornar 401, a sessão é invalidada e o user é
 * redirecionado para /login.
 *
 * TODO: quando o back-end estiver pronto, remover o bloco mockRequest
 * e ativar apenas o fetchWithAuth abaixo.
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

// ── JWT helpers ───────────────────────────────────────────────────────────────
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

// ── Interceptor de fetch com JWT ──────────────────────────────────────────────
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
    // Redireciona para login sem depender de React Router
    window.location.href = '/login';
    throw new ApiError(401, 'Sessão expirada. Faça login novamente.', 'unauthorized');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new ApiError(
      response.status,
      typeof body.message === 'string' ? body.message : 'Erro inesperado.',
      typeof body.code === 'string' ? body.code : undefined,
    );
  }

  return response.json() as Promise<T>;
}

// ── Mock (desenvolvimento sem backend) ───────────────────────────────────────
interface MockRequestOptions {
  minDelayMs?: number;
  maxDelayMs?: number;
  failWhenOffline?: boolean;
}

function getDelayMs(options?: MockRequestOptions): number {
  const min = options?.minDelayMs ?? 180;
  const max = options?.maxDelayMs ?? 540;
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function mockRequest<T>(
  resolver: () => T | Promise<T>,
  options?: MockRequestOptions,
): Promise<T> {
  if (options?.failWhenOffline !== false && typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new ApiError(0, 'Sem conexão com a internet.', 'offline');
  }
  await wait(getDelayMs(options));
  return resolver();
}

// ── Interface pública ─────────────────────────────────────────────────────────
const IS_MOCK = import.meta.env.DEV;

export const api = {
  get<T>(
    path: string,
    resolver: () => T | Promise<T>,
    options?: MockRequestOptions,
  ) {
    if (IS_MOCK) return mockRequest(resolver, options);
    return fetchWithAuth<T>(path);
  },

  post<TBody, TResponse>(
    path: string,
    body: TBody,
    resolver: (body: TBody) => TResponse | Promise<TResponse>,
    options?: MockRequestOptions,
  ) {
    if (IS_MOCK) return mockRequest(() => resolver(body), options);
    return fetchWithAuth<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<TBody, TResponse>(
    path: string,
    body: TBody,
    resolver: (body: TBody) => TResponse | Promise<TResponse>,
    options?: MockRequestOptions,
  ) {
    if (IS_MOCK) return mockRequest(() => resolver(body), options);
    return fetchWithAuth<TResponse>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
};
