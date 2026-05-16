/**
 * router.tsx — Configuração central de rotas (React Router v6).
 *
 * Toda navegação interna usa useNavigate() — nunca window.location.href.
 */

import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PrivateRoute } from './PrivateRoute';
import { PageLoader } from '../components/PageLoader';

import LandingPage       from '../pages/public/LandingPage';
import { SignUpPage }    from '../pages/SignUpPage';
import { LoginPage }     from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

const SetupPage               = lazy(() => import('../pages/SetupPage').then(m => ({ default: m.SetupPage })));
const DashboardPage           = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProcessListPage         = lazy(() => import('../pages/ProcessListPage').then(m => ({ default: m.ProcessListPage })));
const ProcessDetailPage       = lazy(() => import('../pages/ProcessDetailPage').then(m => ({ default: m.ProcessDetailPage })));
const DailyTasksPage          = lazy(() => import('../pages/DailyTasksPage').then(m => ({ default: m.DailyTasksPage })));
const AssistantSettingsPage   = lazy(() => import('../pages/AssistantSettingsPage').then(m => ({ default: m.AssistantSettingsPage })));
const SettingsPage            = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage             = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const BillingPage             = lazy(() => import('../pages/BillingPage').then(m => ({ default: m.BillingPage })));
const SecurityPage            = lazy(() => import('../pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const HelpCenterPage          = lazy(() => import('../pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function LoginPageWrapper() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onNavigateHome={()      => navigate('/')}
      onNavigateSignUp={()    => navigate('/cadastro')}
      onNavigateForgotPassword={() => navigate('/recuperar-senha')}
      onNavigateSetup={()     => navigate('/configuracao')}
      onNavigateDashboard={()  => navigate('/dashboard')}
    />
  );
}

function SignUpPageWrapper() {
  const navigate = useNavigate();
  return (
    <SignUpPage
      onNavigateHome={() => navigate('/')}
      onNavigateLogin={() => navigate('/login')}
    />
  );
}

function SetupPageWrapper() {
  const navigate = useNavigate();
  return (
    <PrivateRoute requireSetup={false}>
      <Lazy>
        <SetupPage onNavigateDashboard={() => navigate('/dashboard')} />
      </Lazy>
    </PrivateRoute>
  );
}

function ForgotPasswordPageWrapper() {
  const navigate = useNavigate();
  return (
    <ForgotPasswordPage
      onNavigateHome={() => navigate('/')}
      onNavigateLogin={() => navigate('/login')}
    />
  );
}

function ResetPasswordPageWrapper() {
  const navigate = useNavigate();
  return (
    <ResetPasswordPage
      onNavigateHome={() => navigate('/')}
      onNavigateLogin={() => navigate('/login')}
    />
  );
}

export const router = createBrowserRouter([
  // Públicas
  { path: '/',         element: <LandingPage /> },
  { path: '/cadastro', element: <SignUpPageWrapper /> },
  { path: '/login',    element: <LoginPageWrapper /> },
  { path: '/recuperar-senha', element: <ForgotPasswordPageWrapper /> },
  { path: '/redefinir-senha', element: <ResetPasswordPageWrapper /> },

  // Onboarding (só aparece se setupCompleted === false)
  { path: '/configuracao', element: <SetupPageWrapper /> },

  // Privadas
  { path: '/dashboard',            element: <PrivateRoute><Lazy><DashboardPage /></Lazy></PrivateRoute> },
  { path: '/processos',            element: <PrivateRoute><Lazy><ProcessListPage /></Lazy></PrivateRoute> },
  { path: '/processos/:processId', element: <PrivateRoute><Lazy><ProcessDetailPage /></Lazy></PrivateRoute> },
  { path: '/tarefas',              element: <PrivateRoute><Lazy><DailyTasksPage /></Lazy></PrivateRoute> },

  // WhatsApp
  { path: '/whatsapp', element: <PrivateRoute><Lazy><AssistantSettingsPage /></Lazy></PrivateRoute> },

  // Hub de configurações
  { path: '/configuracoes',                   element: <PrivateRoute><Lazy><SettingsPage /></Lazy></PrivateRoute> },
  { path: '/configuracoes/perfil',            element: <PrivateRoute><Lazy><ProfilePage /></Lazy></PrivateRoute> },
  { path: '/configuracoes/plano-faturamento', element: <PrivateRoute><Lazy><BillingPage /></Lazy></PrivateRoute> },
  { path: '/configuracoes/seguranca',         element: <PrivateRoute><Lazy><SecurityPage /></Lazy></PrivateRoute> },
  { path: '/configuracoes/ajuda',             element: <PrivateRoute><Lazy><HelpCenterPage /></Lazy></PrivateRoute> },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
]);
