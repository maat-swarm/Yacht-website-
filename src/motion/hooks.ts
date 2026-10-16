import { useState, useEffect } from 'react';
import { MotionIntensity } from './tokens';

/**
 * Hook to detect system reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/**
 * Hook to detect touch device (pointer: coarse) or screen <= 768px
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      const hasCoarse = window.matchMedia('(pointer: coarse)').matches;
      const isSmall = window.innerWidth < 1024;
      const hasTouchEvents = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouch(hasCoarse || isSmall || hasTouchEvents);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

/**
 * Hook to pause ambient loops when browser tab is inactive/hidden
 */
export function usePageVisible(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handler = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return isVisible;
}

/**
 * Master motion intensity hook
 * 'off': prefers-reduced-motion
 * 'lite': touch device, tablet or phone
 * 'full': desktop with fine pointer
 */
export function useMotionIntensity(): MotionIntensity {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouch();

  if (reducedMotion) return 'off';
  if (isTouch) return 'lite';
  return 'full';
}
