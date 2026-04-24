import { useState, useEffect } from 'react';
import { Scale, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Scale size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">PrazoAlert</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#solution" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Como Funciona</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Planos</a>
              <div className="flex items-center gap-4 ml-4">
                <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Segurança</a>
                <button type="button" className="btn-primary px-5 py-2.5 text-sm">
                  Teste Grátis
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          onKeyDown={(e) => { if (e.key === 'Escape') setMobileMenuOpen(false); }}
          className="md:hidden fixed inset-0 z-40 glass-panel border-none pt-24 px-4 pb-6 flex flex-col gap-6"
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Recursos</a>
          <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Como Funciona</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Planos</a>
          <div className="h-px bg-slate-200/50 my-2" />
          <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Segurança</a>
          <button type="button" className="btn-primary w-full py-3 rounded-xl text-lg font-semibold mt-4">
            Teste Grátis de 7 Dias
          </button>
        </div>
      )}
    </>
  );
}
