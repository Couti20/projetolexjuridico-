import { Suspense, lazy, memo } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { SocialProof } from '../components/SocialProof';
import { ProblemSection } from '../components/ProblemSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { useAppNavigation } from '../hooks/useAppNavigation';

// Lazy load seções abaixo da dobra
const BentoSection = lazy(() => import('../components/BentoSection'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const PricingSection = lazy(() => import('../components/PricingSection'));
const FaqSection = lazy(() => import('../components/FaqSection'));
const TrustSection = lazy(() => import('../components/TrustSection'));
const Footer = lazy(() => import('../components/Footer'));

// Skeleton loading para seções
function SectionSkeleton() {
  return (
    <div className="h-96 bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse" />
  );
}

function LandingPageContent() {
  const { goSignUp, goLogin } = useAppNavigation();

  return (
    <div className="min-h-screen text-slate-800 relative pb-24 md:pb-0">
      {/* Crítico: acima da dobra, sem lazy */}
      <Navbar onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      <HeroSection onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      <SocialProof />
      <ProblemSection />
      <FeaturesSection />

      {/* Lazy: abaixo da dobra */}
      <Suspense fallback={<SectionSkeleton />}>
        <BentoSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PricingSection onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FaqSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TrustSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Footer />
      </Suspense>

      <MobileBottomBar onNavigateSignUp={goSignUp} onNavigateLogin={goLogin} />
    </div>
  );
}

// Memoizar para evitar re-renders desnecessários
export const LandingPage = memo(LandingPageContent);
