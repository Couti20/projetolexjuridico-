import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { PrivateRoute } from './PrivateRoute';

// Import lazy (secundário, sob demanda)
const SignUpPage = lazy(async () => {
  const module = await import('../pages/SignUpPage');
  return { default: module.SignUpPage };
});
const LoginPage = lazy(async () => {
  const module = await import('../pages/LoginPage');
  return { default: module.LoginPage };
});
const SetupPage = lazy(async () => {
  const module = await import('../pages/SetupPage');
  return { default: module.SetupPage };
});
const DashboardPage = lazy(async () => {
  const module = await import('../pages/DashboardPage');
  return { default: module.DashboardPage };
});
const ProcessListPage = lazy(async () => {
  const module = await import('../pages/ProcessListPage');
  return { default: module.ProcessListPage };
});
const ProcessDetailPage = lazy(async () => {
  const module = await import('../pages/ProcessDetailPage');
  return { default: module.ProcessDetailPage };
});
const DailyTasksPage = lazy(async () => {
  const module = await import('../pages/DailyTasksPage');
  return { default: module.DailyTasksPage };
});
const AssistantSettingsPage = lazy(async () => {
  const module = await import('../pages/AssistantSettingsPage');
  return { default: module.AssistantSettingsPage };
});
const ProfilePage = lazy(async () => {
  const module = await import('../pages/ProfilePage');
  return { default: module.ProfilePage };
});
const BillingPage = lazy(async () => {
  const module = await import('../pages/BillingPage');
  return { default: module.BillingPage };
});
const SecurityPage = lazy(async () => {
  const module = await import('../pages/SecurityPage');
  return { default: module.SecurityPage };
});
const HelpCenterPage = lazy(async () => {
  const module = await import('../pages/HelpCenterPage');
  return { default: module.HelpCenterPage };
});

// Fallback básico para Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-500">Carregando...</div>
    </div>
  );
}

export function AppRoutes() {
  const navigate = useNavigate();

  const withLoader = (element: React.ReactNode) => (
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  );

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/cadastro"
        element={withLoader(
          <SignUpPage
            onNavigateHome={() => navigate('/')}
            onNavigateLogin={() => navigate('/login')}
          />
        )}
      />
      <Route
        path="/login"
        element={withLoader(
          <LoginPage
            onNavigateHome={() => navigate('/')}
            onNavigateSignUp={() => navigate('/cadastro')}
            onNavigateSetup={() => navigate('/configuracao')}
          />
        )}
      />

      {/* Protegidas (setup) */}
      <Route
        path="/configuracao"
        element={
          <PrivateRoute>
            {withLoader(
              <SetupPage
                onSkip={() => navigate('/dashboard')}
                onNavigateDashboard={() => navigate('/dashboard')}
              />,
            )}
          </PrivateRoute>
        }
      />

      {/* Protegidas (app) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            {withLoader(<DashboardPage />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/processos"
        element={
          <PrivateRoute>
            {withLoader(<ProcessListPage />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/processos/:processId"
        element={
          <PrivateRoute>
            {withLoader(<ProcessDetailPage />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/tarefas"
        element={
          <PrivateRoute>
            {withLoader(<DailyTasksPage />)}
          </PrivateRoute>
        }
      />

      {/* Lazy-loaded config routes */}
      <Route 
        path="/configuracoes/assistente" 
        element={
          <PrivateRoute>
            {withLoader(<AssistantSettingsPage />)}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/configuracoes/perfil" 
        element={
          <PrivateRoute>
            {withLoader(<ProfilePage />)}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/configuracoes/plano-faturamento" 
        element={
          <PrivateRoute>
            {withLoader(<BillingPage />)}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/configuracoes/seguranca" 
        element={
          <PrivateRoute>
            {withLoader(<SecurityPage />)}
          </PrivateRoute>
        } 
      />
      <Route 
        path="/configuracoes/ajuda" 
        element={
          <PrivateRoute>
            {withLoader(<HelpCenterPage />)}
          </PrivateRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
