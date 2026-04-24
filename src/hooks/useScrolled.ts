import { useState, useEffect } from 'react';

/**
 * Returns `true` once the page has scrolled past the given threshold (px).
 * Cleans up the event listener on unmount.
 */
export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);

    // Check on mount in case the page is already scrolled (e.g. hard refresh)
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
