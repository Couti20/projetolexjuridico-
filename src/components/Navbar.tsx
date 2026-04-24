import { useState, useEffect, useRef } from 'react';
import { Scale, Menu, X } from 'lucide-react';
import { useScrolled } from '../hooks/useScrolled';

const NAV_LINKS = [
  { label: 'Recursos',       href: '#features'  },
  { label: 'Como Funciona',  href: '#solution'  },
  { label: 'Planos',         href: '#pricing'   },
] as const;

export function Navbar() {
  const isScrolled = useScrolled(20);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Trap focus inside mobile menu & close on Escape
  useEffect(() => {
    if (!menuOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2" aria-label="PrazoAlert — ir para o topo">
              <div className="bg-blue-600 text-white p-2 rounded-xl" aria-hidden="true">
                <Scale size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">PrazoAlert</span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="flex items-center gap-4 ml-4">
                <a
                  href="#security"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Segurança
                </a>
                <a href="#hero-form">
                  <button type="button" className="btn-primary px-5 py-2.5 text-sm">
                    Teste Grátis
                  </button>
                </a>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="md:hidden text-slate-600 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="md:hidden fixed inset-0 z-40 glass-panel border-none pt-24 px-6 pb-8 flex flex-col gap-6"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={closeMenu}
              className="text-lg font-medium text-slate-800 hover:text-blue-600 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="h-px bg-slate-200/50" role="separator" />
          <a
            href="#security"
            onClick={closeMenu}
            className="text-lg font-medium text-slate-800 hover:text-blue-600 transition-colors"
          >
            Segurança
          </a>
          <button
            type="button"
            onClick={closeMenu}
            className="btn-primary w-full py-3 rounded-xl text-lg font-semibold mt-4"
          >
            Teste Grátis de 7 Dias
          </button>
        </div>
      )}
    </>
  );
}
