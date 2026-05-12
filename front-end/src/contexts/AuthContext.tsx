/**
 * AuthContext
 *
 * Gerencia sessão do usuário autenticado.
 *
 * Fonte da verdade para setupCompleted:
 * - Antes: flag no localStorage por usuário (não sincronizava entre dispositivos).
 * - Agora: campo `setupCompleted` vindo do back-end no login/register response.
 *   O localStorage ainda guarda a sessão local, mas o valor de setupCompleted
 *   sempre vem do objeto AuthUser retornado pela API.
 *
 * Tratamento de 401 (token expirado):
 * - api.ts dispara CustomEvent('lex:unauthorized') ao receber 401.
 * - AuthProvider escuta esse evento e chama logout() + redireciona via
 *   onUnauthorized callback.
 * - Isso evita window.location.href (hard reload) dentro de um módulo utilitário.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, AuthUser } from '../types/auth';
import { clearAuthToken, getAuthToken } from '../services/api';

// ── Constantes ──────────────────────────────────────────────────────────
const AUTH_STORAGE_KEY = 'lex-auth-session';
const SESSION_TTL_MS   = 8 * 60 * 60 * 1000; // 8 horas

// ── Helpers: sessão ─────────────────────────────────────────────────────
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

    return {
      user: {
        id:             user.id,
        fullName:       user.fullName,
        email:          user.email,
        oab:            typeof user.oab === 'string' ? user.oab : undefined,
<<<<<<< HEAD
=======
        isAdmin:        typeof user.isAdmin === 'boolean' ? user.isAdmin : false,
>>>>>>> develop
        setupCompleted: typeof user.setupCompleted === 'boolean' ? user.setupCompleted : false,
      },
      authenticatedAt,
      setupCompleted: typeof candidate.setupCompleted === 'boolean' ? candidate.setupCompleted : false,
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

// ── Context ──────────────────────────────────────────────────────────────
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
  /** Chamado quando o back-end retorna 401 (token expirado/revogado). */
  onUnauthorized?: () => void;
}

export function AuthProvider({ children, onUnauthorized }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => { onUnauthorizedRef.current = onUnauthorized; }, [onUnauthorized]);

  const hasToken    = typeof window !== 'undefined' ? Boolean(getAuthToken()) : false;
  const safeSession = hasToken ? session : null;

  // ── Escuta evento global de 401 (disparado por api.ts) ───────────────────
  useEffect(() => {
    const handler = () => {
      setSession(null);
      clearAuthToken();
      storeSession(null);
      onUnauthorizedRef.current?.();
    };
    window.addEventListener('lex:unauthorized', handler);
    return () => window.removeEventListener('lex:unauthorized', handler);
  }, []);

  // ── login ────────────────────────────────────────────────────────────
  const login = useCallback((user: AuthUser) => {
    // setupCompleted vem diretamente do back-end (campo no AuthUser)
    // Não recalculamos mais a partir do oab nem do localStorage
<<<<<<< HEAD
    const setupCompleted = user.setupCompleted ?? false;
=======
    const setupCompleted = user.isAdmin ? true : (user.setupCompleted ?? false);
>>>>>>> develop

    const nextSession: AuthSession = {
      user,
      authenticatedAt: Date.now(),
      setupCompleted,
    };
    setSession(nextSession);
    storeSession(nextSession);
  }, []);

  // ── logout ───────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setSession(null);
    clearAuthToken();
    storeSession(null);
  }, []);

  // ── updateUser ─────────────────────────────────────────────────────
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

  // ── completeSetup ───────────────────────────────────────────────────
  const completeSetup = useCallback((oab?: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextSession: AuthSession = {
        ...prev,
        user: {
          ...prev.user,
          oab: oab?.trim() || prev.user.oab,
          setupCompleted: true,
        },
        setupCompleted: true,
      };
      storeSession(nextSession);
      return nextSession;
    });
  }, []);

  // ── value ─────────────────────────────────────────────────────────────
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
