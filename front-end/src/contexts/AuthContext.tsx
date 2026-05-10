/**
 * AuthContext
 *
 * Gerencia sessão do usuário autenticado.
 *
 * Problema corrigido:
 * Anteriormente, `setupCompleted` era derivado de `Boolean(user.oab?.trim())`.
 * Isso fazia com que, ao fazer login após logout, o usuário fosse redirecionado
 * para o setup novamente — pois o OAB vindo do back-end pode ser string vazia.
 *
 * Solução:
 * `setupCompleted` agora é uma flag independente, armazenada em chave própria
 * no localStorage (`lex-setup-completed-{userId}`) e nunca mais é recalculada
 * a partir do valor do OAB. Uma vez marcada como `true`, permanece assim.
 */

import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { AuthSession, AuthUser } from '../types/auth';
import { clearAuthToken, getAuthToken } from '../services/api';

// ─── Constantes ──────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEY  = 'lex-auth-session';
const SESSION_TTL_MS    = 8 * 60 * 60 * 1000; // 8 horas

// ─── Helpers: flag de setup por usuário ──────────────────────────────────────

function setupKey(userId: string): string {
  return `lex-setup-completed-${userId}`;
}

function readSetupFlag(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(setupKey(userId)) === 'true';
}

function writeSetupFlag(userId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(setupKey(userId), 'true');
}

// ─── Helpers: sessão ─────────────────────────────────────────────────────────

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
    if (
      typeof user.id !== 'string' ||
      typeof user.fullName !== 'string' ||
      typeof user.email !== 'string'
    ) return null;

    const authenticatedAt =
      typeof candidate.authenticatedAt === 'number' ? candidate.authenticatedAt : 0;

    if (Date.now() - authenticatedAt > SESSION_TTL_MS) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    // setupCompleted: lê da flag dedicada por usuário (fonte da verdade)
    const setupCompleted = readSetupFlag(user.id);

    return {
      user: {
        id:       user.id,
        fullName: user.fullName,
        email:    user.email,
        oab:      typeof user.oab === 'string' ? user.oab : undefined,
      },
      authenticatedAt,
      setupCompleted,
    };
  } catch (error) {
    console.error('Não foi possível restaurar a sessão local.', error);
    return null;
  }
}

function storeSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:             AuthUser | null;
  isAuthenticated:  boolean;
  isSetupCompleted: boolean;
  session:          AuthSession | null;
  login:            (user: AuthUser) => void;
  logout:           () => void;
  updateUser:       (partialUser: Partial<AuthUser>) => void;
  completeSetup:    (oab?: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

  const hasToken   = typeof window !== 'undefined' ? Boolean(getAuthToken()) : false;
  const safeSession = hasToken ? session : null;

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback((user: AuthUser) => {
    // setupCompleted lido da flag persistida — não depende do oab vindo do back-end
    const setupCompleted = readSetupFlag(user.id);

    const nextSession: AuthSession = {
      user,
      authenticatedAt: Date.now(),
      setupCompleted,
    };
    setSession(nextSession);
    storeSession(nextSession);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setSession(null);
    clearAuthToken();
    storeSession(null);
    // Não apaga a flag de setup — o usuário já completou, não deve refazer.
  }, []);

  // ── updateUser ────────────────────────────────────────────────────────────
  const updateUser = useCallback((partialUser: Partial<AuthUser>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextSession: AuthSession = {
        ...prev,
        user: { ...prev.user, ...partialUser },
      };
      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  // ── completeSetup ─────────────────────────────────────────────────────────
  const completeSetup = useCallback((oab?: string) => {
    setSession((prev) => {
      if (!prev) return prev;

      // Persiste a flag de setup vinculada ao userId — sobrevive a logout/login
      writeSetupFlag(prev.user.id);

      const nextSession: AuthSession = {
        ...prev,
        user: { ...prev.user, oab: oab?.trim() || prev.user.oab },
        setupCompleted: true,
      };
      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  // ── value ─────────────────────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user:             safeSession?.user ?? null,
      isAuthenticated:  Boolean(safeSession?.user),
      isSetupCompleted: Boolean(safeSession?.setupCompleted),
      session:          safeSession,
      login,
      logout,
      updateUser,
      completeSetup,
    }),
    [completeSetup, login, logout, safeSession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
