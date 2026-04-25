/**
 * App.tsx — Roteamento baseado em hash (sem React Router por enquanto).
 *
 * Rotas disponíveis:
 *   #/          → Landing page
 *   #/cadastro  → Página de cadastro
 *
 * Quando React Router for adicionado, substituir o useHashRouter
 * pelo <BrowserRouter> com <Routes>.
 */

import { useState, useEffect } from 'react';
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

type Route = 'home' | 'signup';

function getRouteFromHash(): Route {
  const hash = window.location.hash;
  if (hash === '#/cadastro') return 'signup';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (target: Route) => {
    window.location.hash = target === 'home' ? '#/' : `#/${target}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route === 'signup') {
    return <SignUpPage onNavigateHome={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen text-slate-800 relative">
      <Navbar onNavigateSignUp={() => navigateTo('signup')} />
      <HeroSection />
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
