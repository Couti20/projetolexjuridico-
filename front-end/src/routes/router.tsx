/**
 * router.tsx — Configuração central de rotas com createBrowserRouter (React Router v6).
 *
 * Árvore PÚBLICA  → Landing, Cadastro, Login  (sem AppLayout)
 * Árvore PRIVADA  → Dashboard, Processos, Tarefas, Configurações  (com AppLayout)
 *
 * Todas as views privadas e pesadas usam React.lazy para code-splitting automático.
 * O Recharts (usado no Dashboard) é carregado apenas no chunk do Dashboard.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PrivateRoute } from './PrivateRoute';
import { PageLoader } from '../components/PageLoader';

// ── Árvore PÚBLICA (carregada imediatamente — bundle principal) ───────────────
import LandingPage       from '../pages/public/LandingPage';
import { SignUpPage }    from '../pages/SignUpPage';
import { LoginPage }     from '../pages/LoginPage';

// ── Árvore PRIVADA (lazy — carregadas sob demanda) ────────────────────────────
const SetupPage               = lazy(() => import('../pages/SetupPage').then(m => ({ default: m.SetupPage })));
const DashboardPage           = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProcessListPage         = lazy(() => import('../pages/ProcessListPage').then(m => ({ default: m.ProcessListPage })));
const ProcessDetailPage       = lazy(() => import('../pages/ProcessDetailPage').then(m => ({ default: m.ProcessDetailPage })));
const DailyTasksPage          = lazy(() => import('../pages/DailyTasksPage').then(m => ({ default: m.DailyTasksPage })));
const AssistantSettingsPage   = lazy(() => import('../pages/AssistantSettingsPage').then(m => ({ default: m.AssistantSettingsPage })));
const ProfilePage             = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const BillingPage             = lazy(() => import('../pages/BillingPage').then(m => ({ default: m.BillingPage })));
const SecurityPage            = lazy(() => import('../pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const HelpCenterPage          = lazy(() => import('../pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // ── Rotas públicas ──────────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/cadastro',
    element: <SignUpPage onNavigateHome={() => { window.location.href = '/'; }} onNavigateLogin={() => { window.location.href = '/login'; }} />,
  },
  {
    path: '/login',
    element: <LoginPage onNavigateHome={() => { window.location.href = '/'; }} onNavigateSignUp={() => { window.location.href = '/cadastro'; }} onNavigateSetup={() => { window.location.href = '/configuracao'; }} />,
  },

  // ── Configuração inicial (semi-privada) ─────────────────────────────────────
  {
    path: '/configuracao',
    element: (
      <Lazy>
        <SetupPage onSkip={() => { window.location.href = '/dashboard'; }} onNavigateDashboard={() => { window.location.href = '/dashboard'; }} />
      </Lazy>
    ),
  },

  // ── Rotas privadas ──────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    element: <PrivateRoute><Lazy><DashboardPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/processos',
    element: <PrivateRoute><Lazy><ProcessListPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/processos/:processId',
    element: <PrivateRoute><Lazy><ProcessDetailPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/tarefas',
    element: <PrivateRoute><Lazy><DailyTasksPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/configuracoes/assistente',
    element: <PrivateRoute><Lazy><AssistantSettingsPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/configuracoes/perfil',
    element: <PrivateRoute><Lazy><ProfilePage /></Lazy></PrivateRoute>,
  },
  {
    path: '/configuracoes/plano-faturamento',
    element: <PrivateRoute><Lazy><BillingPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/configuracoes/seguranca',
    element: <PrivateRoute><Lazy><SecurityPage /></Lazy></PrivateRoute>,
  },
  {
    path: '/configuracoes/ajuda',
    element: <PrivateRoute><Lazy><HelpCenterPage /></Lazy></PrivateRoute>,
  },

  // ── Fallback ────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
