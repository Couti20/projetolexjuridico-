
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession, AuthUser } from '../types/auth';
import { clearAuthToken, getAuthToken } from '../services/api';

const AUTH_STORAGE_KEY = 'lex-auth-session';

/**
 * Tempo máximo de validade de uma sessão armazenada localmente.
 * Após esse período o usuário é deslogado automaticamente na próxima visita.
 * Valor: 8 horas (ajustável conforme política de segurança do produto).
 */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas em milissegundos
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSetupCompleted: boolean;
  session: AuthSession | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  completeSetup: (oab?: string) => void;
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

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
      setupCompleted:
        typeof candidate.setupCompleted === 'boolean'
          ? candidate.setupCompleted
          : Boolean(typeof user.oab === 'string' && user.oab.trim()),
    };
  } catch (error) {
    console.error('Nao foi possivel restaurar a sessao local.', error);
    return null;
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

  const hasToken = typeof window !== 'undefined' ? Boolean(getAuthToken()) : false;
  const safeSession = hasToken ? session : null;

  const login = useCallback((user: AuthUser) => {
    const nextSession: AuthSession = {
      user,
      authenticatedAt: Date.now(),
      setupCompleted: Boolean(user.oab?.trim()),
    };
    setSession(nextSession);
    storeSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    clearAuthToken();
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
        setupCompleted:
          prev.setupCompleted || Boolean((partialUser.oab ?? prev.user.oab)?.trim()),
      };

      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  const completeSetup = useCallback((oab?: string) => {
    setSession((prev) => {
      if (!prev) return prev;

      const nextSession: AuthSession = {
        ...prev,
        user: {
          ...prev.user,
          oab: oab?.trim() || prev.user.oab,
        },
        setupCompleted: true,
      };

      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: safeSession?.user ?? null,
      isAuthenticated: Boolean(safeSession?.user),
      isSetupCompleted: Boolean(safeSession?.setupCompleted),
      session: safeSession,
      login,
      logout,
      updateUser,
      completeSetup,
    }),
    [completeSetup, login, logout, safeSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
