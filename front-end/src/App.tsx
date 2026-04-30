/**
 * App.tsx — Roteamento com React Router v6 + BrowserRouter.
 *
 * Rotas públicas:
 *   /              → Landing page
 *   /cadastro      → Tela de cadastro
 *   /login         → Tela de login
 *
 * Rotas internas (pós-login):
 *   /configuracao  → Onboarding (OAB + WhatsApp)
 *   /dashboard     → Painel principal (protegida)
 *   /processos     → Lista de processos (protegida)
 *   /processos/:processId → Detalhe do processo (protegida)
 *   /tarefas       → Planejamento diario e produtividade (protegida)
 *   /configuracoes/assistente → OAB, WhatsApp e notificações (protegida)
 *   /configuracoes/perfil → Preferências de conta (protegida)
 *   /configuracoes/plano-faturamento → Assinatura e cobranças (protegida)
 *   /configuracoes/seguranca → Senha, sessões e proteção (protegida)
 *   /configuracoes/ajuda → Central de ajuda (protegida)
 */

import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SocialProof } from './components/SocialProof';
import { ProblemSection } from './components/ProblemSection';
import { FeaturesSection } from './components/FeaturesSection';
import { BentoSection } from './components/BentoSection';
import { TestimonialSection } from './components/TestimonialSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { TrustSection } from './components/TrustSection';
import { Footer } from './components/Footer';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { SetupPage } from './pages/SetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProcessListPage } from './pages/ProcessListPage';
import { ProcessDetailPage } from './pages/ProcessDetailPage';
import { DailyTasksPage } from './pages/DailyTasksPage';
import { AssistantSettingsPage } from './pages/AssistantSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { BillingPage } from './pages/BillingPage';
import { SecurityPage } from './pages/SecurityPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { PrivateRoute } from './routes/PrivateRoute';
import { useAuth } from './hooks/useAuth';

// ── Helpers de navegação ──────────────────────────────────────────────────────
function useAppNavigation() {
  const navigate = useNavigate();
  return {
    goHome:      () => { navigate('/');             window.scrollTo({ top: 0 }); },
    goSignUp:    () => { navigate('/cadastro');     window.scrollTo({ top: 0 }); },
    goLogin:     () => { navigate('/login');        window.scrollTo({ top: 0 }); },
    goSetup:     () => { navigate('/configuracao'); window.scrollTo({ top: 0 }); },
    goDashboard: () => { navigate('/dashboard');    window.scrollTo({ top: 0 }); },
  };
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage() {
  const { goSignUp, goLogin } = useAppNavigation();
  return (
    <div className="min-h-screen text-slate-800 relative pb-24 md:pb-0">
      <Navbar onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      <HeroSection onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      <SocialProof />
      <ProblemSection />
      <FeaturesSection />
      <BentoSection />
      <TestimonialSection />
      <PricingSection onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      <FaqSection />
      <TrustSection />
      <Footer />
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <button
            type="button"
            onClick={goLogin}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={goSignUp}
            className="btn-primary flex-[1.2] px-4 py-2.5 text-sm font-semibold"
          >
            Teste grátis
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cadastro ──────────────────────────────────────────────────────────────────
function SignUpRoute() {
  const { goHome, goLogin } = useAppNavigation();
  return <SignUpPage onNavigateHome={goHome} onNavigateLogin={goLogin} />;
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { goHome, goSignUp, goSetup } = useAppNavigation();
  const fromPath = (location.state as { from?: string } | null)?.from;

  const goAfterLogin = () => {
    if (fromPath && fromPath.startsWith('/') && fromPath !== '/login') {
      navigate(fromPath);
      window.scrollTo({ top: 0 });
      return;
    }
    goSetup();
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage onNavigateHome={goHome} onNavigateSignUp={goSignUp} onNavigateSetup={goAfterLogin} />;
}

// ── Configuração inicial ──────────────────────────────────────────────────────
function SetupRoute() {
  const { isAuthenticated } = useAuth();
  const { goDashboard } = useAppNavigation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <SetupPage onSkip={goDashboard} onNavigateDashboard={goDashboard} />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<LandingPage />} />
        <Route path="/cadastro"     element={<SignUpRoute />} />
        <Route path="/login"        element={<LoginRoute />} />
        <Route path="/configuracao" element={<SetupRoute />} />
        <Route path="/dashboard"    element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/processos" element={<PrivateRoute><ProcessListPage /></PrivateRoute>} />
        <Route path="/processos/:processId" element={<PrivateRoute><ProcessDetailPage /></PrivateRoute>} />
        <Route path="/tarefas" element={<PrivateRoute><DailyTasksPage /></PrivateRoute>} />
        <Route path="/configuracoes/assistente" element={<PrivateRoute><AssistantSettingsPage /></PrivateRoute>} />
        <Route path="/configuracoes/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/configuracoes/plano-faturamento" element={<PrivateRoute><BillingPage /></PrivateRoute>} />
        <Route path="/configuracoes/seguranca" element={<PrivateRoute><SecurityPage /></PrivateRoute>} />
        <Route path="/configuracoes/ajuda" element={<PrivateRoute><HelpCenterPage /></PrivateRoute>} />
        <Route path="*"             element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
