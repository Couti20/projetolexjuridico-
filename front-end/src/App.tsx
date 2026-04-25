/**
 * App.tsx — Roteamento com React Router v6 + HashRouter.
 *
 * HashRouter usa o fragmento da URL (#) para navegar,
 * o que funciona perfeitamente com Vite dev server e
 * em qualquer hospedagem estática sem configuração de servidor.
 *
 * Rotas:
 *   /          → Landing page
 *   /cadastro  → Página de cadastro
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

// ─── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate();

  const goToSignUp = () => {
    navigate('/cadastro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-slate-800 relative">
      <Navbar onNavigateSignUp={goToSignUp} />
      <HeroSection onNavigateSignUp={goToSignUp} />
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

// ─── Signup Page wrapper ───────────────────────────────────────────────────────
function SignUpRoute() {
  const navigate = useNavigate();

  return (
    <SignUpPage
      onNavigateHome={() => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cadastro" element={<SignUpRoute />} />
        {/* Fallback: qualquer rota desconhecida volta para home */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
}
