// Hook for `prefers-reduced-motion: reduce`. Apple HIG, WCAG 2.3.3, and App
// Store Review Guidelines all expect respect for this preference. When set,
// the OS user has signaled vestibular sensitivity — minimize moving objects,
// kill drift, dampen amplitude. Re-evaluates live if the preference changes.
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    // Safari < 14 used addListener; modern uses addEventListener. Cover both.
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  return reduced;
}
