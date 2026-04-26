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
  const { goSignUp } = useAppNavigation();
  return (
    <div className="min-h-screen text-slate-800 relative">
      <Navbar onNavigateSignUp={goSignUp} />
      <HeroSection onNavigateSignUp={goSignUp} />
      <SocialProof />
      <ProblemSection />
      <FeaturesSection />
      <BentoSection />
      <TestimonialSection />
      <PricingSection />
      <FaqSection />
      <TrustSection />
      <Footer />
    </div>
  );
}

// ── Cadastro ──────────────────────────────────────────────────────────────────
function SignUpRoute() {
  const { goHome } = useAppNavigation();
  return <SignUpPage onNavigateHome={goHome} />;
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
