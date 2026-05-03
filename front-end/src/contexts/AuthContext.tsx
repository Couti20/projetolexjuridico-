
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession, AuthUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'lex-auth-session';
const DEV_MOCK_DISABLED_KEY = 'lex-dev-mock-disabled';

/**
 * Tempo máximo de validade de uma sessão armazenada localmente.
 * Após esse período o usuário é deslogado automaticamente na próxima visita.
 * Valor: 8 horas (ajustável conforme política de segurança do produto).
 */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas em milissegundos
const ENABLE_DEV_MOCK_USER = import.meta.env.DEV;

const DEV_MOCK_USER: AuthUser = {
  id: 'user-lex-admin',
  fullName: 'Admin Lex',
  email: 'admin@lexjuridico.local',
  oab: 'OAB/SP 123.456',
};

function createDevMockSession(): AuthSession {
  return {
    user: DEV_MOCK_USER,
    authenticatedAt: Date.now(),
  };
}

function isDevMockDisabled() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DEV_MOCK_DISABLED_KEY) === 'true';
}

function setDevMockDisabled(disabled: boolean) {
  if (typeof window === 'undefined') return;

  if (disabled) {
    window.localStorage.setItem(DEV_MOCK_DISABLED_KEY, 'true');
    return;
  }

  window.localStorage.removeItem(DEV_MOCK_DISABLED_KEY);
}

function shouldUseDevMockUser() {
  return ENABLE_DEV_MOCK_USER && !isDevMockDisabled();
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  session: AuthSession | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return shouldUseDevMockUser() ? createDevMockSession() : null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const candidate = parsed as Record<string, unknown>;
    const user = candidate.user as Record<string, unknown> | undefined;

    if (!user || typeof user !== 'object') return null;
    if (typeof user.id !== 'string' || typeof user.fullName !== 'string' || typeof user.email !== 'string') {
      return null;
    }

    const authenticatedAt = typeof candidate.authenticatedAt === 'number'
      ? candidate.authenticatedAt
      : 0;

    const sessionAge = Date.now() - authenticatedAt;
    if (sessionAge > SESSION_TTL_MS) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        oab: typeof user.oab === 'string' ? user.oab : undefined,
      },
      authenticatedAt,
    };
  } catch (error) {
    console.error('Nao foi possivel restaurar a sessao local.', error);
    return shouldUseDevMockUser() ? createDevMockSession() : null;
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    if (ENABLE_DEV_MOCK_USER) {
      setDevMockDisabled(true);
    }
    return;
  }

  setDevMockDisabled(false);
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

  const login = useCallback((user: AuthUser) => {
    const nextSession: AuthSession = {
      user,
      authenticatedAt: Date.now(),
    };
    setSession(nextSession);
    storeSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    storeSession(null);
  }, []);

  const updateUser = useCallback((partialUser: Partial<AuthUser>) => {
    setSession((prev) => {
      if (!prev) return prev;

      const nextSession: AuthSession = {
        ...prev,
        user: {
          ...prev.user,
          ...partialUser,
        },
      };

      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      session,
      login,
      logout,
      updateUser,
    }),
    [login, logout, session, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
