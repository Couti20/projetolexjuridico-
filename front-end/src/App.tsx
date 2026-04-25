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
  return window.location.hash === '#/cadastro' ? 'signup' : 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash);

  // Sincroniza o estado com mudanças no hash (botão voltar do browser incluído)
  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /**
   * Função de navegação centralizada.
   * Toda mudança de rota passa por aqui — nunca via href direto.
   */
  const navigateTo = (target: Route) => {
    const hash = target === 'home' ? '#/' : `#/${target}`;
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route === 'signup') {
    return <SignUpPage onNavigateHome={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen text-slate-800 relative">
      {/*
       * onNavigateSignUp é passado explicitamente para cada componente
       * que precisa do botão de CTA — nunca via Context ou prop drilling desnecessário.
       * Navbar e HeroSection são os dois pontos de entrada de cadastro na landing.
       */}
      <Navbar onNavigateSignUp={() => navigateTo('signup')} />
      <HeroSection onNavigateSignUp={() => navigateTo('signup')} />
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
