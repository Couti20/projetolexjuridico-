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

export const api = {
  get<T>(
    _path: string,
    resolver: () => T | Promise<T>,
    options?: MockRequestOptions,
  ) {
    return mockRequest(resolver, options);
  },

  post<TBody, TResponse>(
    _path: string,
    body: TBody,
    resolver: (body: TBody) => TResponse | Promise<TResponse>,
    options?: MockRequestOptions,
  ) {
    return mockRequest(() => resolver(body), options);
  },
};
