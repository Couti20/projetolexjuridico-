import { useState, useEffect, useRef, type FormEvent } from 'react';
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

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) mobileMenuRef.current?.focus();
  }, [mobileMenuOpen]);

  const handleLeadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = leadEmail.trim().toLowerCase();
    if (!normalizedEmail) return;
    localStorage.setItem('lex_lead_email', normalizedEmail);
    setLeadSubmitted(true);
    setLeadEmail('');
  };

  return (
    <div className="min-h-screen text-slate-800 relative">
      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
      />
      <HeroSection
        leadEmail={leadEmail}
        setLeadEmail={setLeadEmail}
        leadSubmitted={leadSubmitted}
        setLeadSubmitted={setLeadSubmitted}
        handleLeadSubmit={handleLeadSubmit}
      />
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
