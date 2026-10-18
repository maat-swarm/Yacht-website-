/**
 * Yacht Properties - Motion & Animation Design Tokens
 * Living Website Layer
 */

export type MotionIntensity = 'full' | 'lite' | 'off';

/**
 * Global motion intensity evaluation
 * 'full': desktop with fine pointer
 * 'lite': touch devices, tablets, and small viewports
 * 'off': user prefers reduced motion
 */
export const getMotionIntensity = (): MotionIntensity => {
  if (typeof window === 'undefined') return 'full';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) return 'lite';
  return 'full';
};

export const MOTION_INTENSITY: MotionIntensity = typeof window !== 'undefined' ? getMotionIntensity() : 'full';

export const MOTION_DURATIONS = {
  fast: 0.25,
  base: 0.6,
  slow: 1.2,
  ambientSlow: 8,
  ambientMedium: 16,
  ambientLong: 24,
  ambientWave: 30,
} as const;

export const MOTION_EASINGS = {
  // Soft ease-out cubic-bezier
  default: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.8, 0.25, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  linear: [0, 0, 1, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
} as const;

export const MOTION_STAGGER = {
  fast: 0.05,
  base: 0.08,
  slow: 0.15,
} as const;

// Transition presets
export const transitions = {
  standard: {
    duration: MOTION_DURATIONS.base,
    ease: MOTION_EASINGS.default,
  },
  fast: {
    duration: MOTION_DURATIONS.fast,
    ease: MOTION_EASINGS.default,
  },
  slow: {
    duration: MOTION_DURATIONS.slow,
    ease: MOTION_EASINGS.default,
  },
  bounce: {
    duration: MOTION_DURATIONS.base,
    ease: MOTION_EASINGS.bounce,
  },
};
