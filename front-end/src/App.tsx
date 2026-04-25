import { useState, type FormEvent } from 'react';
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
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = leadEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      return;
    }

    localStorage.setItem('lex_lead_email', normalizedEmail);
    setLeadSubmitted(true);
    setLeadEmail('');
  };

  return (
    <div className="min-h-screen text-slate-800 relative">
      <Navbar />
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
