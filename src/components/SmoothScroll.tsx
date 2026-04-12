'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Initialize Lenis with a "natural" feeling curve, to avoid motion blur issues and be accessible.
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
