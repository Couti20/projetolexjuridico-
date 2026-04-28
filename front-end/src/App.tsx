/**
 * App.tsx — Roteamento com React Router v6 + HashRouter.
 *
 * Rotas:
 *   /          → Landing page
 *   /cadastro  → Tela de cadastro
 *   /login     → Tela de login
 */

import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
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

// ── Helpers de navegação ──────────────────────────────────────────────────────
function useAppNavigation() {
  const navigate = useNavigate();
  return {
    goHome:   () => { navigate('/');          window.scrollTo({ top: 0 }); },
    goSignUp: () => { navigate('/cadastro');  window.scrollTo({ top: 0 }); },
    goLogin:  () => { navigate('/login');     window.scrollTo({ top: 0 }); },
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
  const { goHome, goSignUp } = useAppNavigation();
  return <LoginPage onNavigateHome={goHome} onNavigateSignUp={goSignUp} />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/cadastro" element={<SignUpRoute />} />
        <Route path="/login"    element={<LoginRoute />} />
        <Route path="*"          element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
}
