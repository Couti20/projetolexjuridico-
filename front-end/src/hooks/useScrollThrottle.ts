import { useEffect, useState } from 'react';

/**
 * Throttle de scroll para reduzir atualizações de estado em componentes visuais.
 */
export function useScrollThrottle(threshold = 20, delay = 100) {
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.scrollY > threshold;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isThrottled = false;

    const handleScroll = () => {
      if (isThrottled) return;

      isThrottled = true;
      setIsScrolled(window.scrollY > threshold);

      window.setTimeout(() => {
        isThrottled = false;
      }, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [delay, threshold]);

  return isScrolled;
}