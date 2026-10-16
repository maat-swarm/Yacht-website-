import React from 'react';
import { motion } from 'motion/react';
import { useMotionIntensity, usePageVisible } from '../motion/hooks';

interface AnimatedWaveDividerProps {
  className?: string;
  inverted?: boolean;
  navyColorClass?: string;
  purpleColorClass?: string;
  fillBaseColor?: string; // color of the section below
}

export const AnimatedWaveDivider: React.FC<AnimatedWaveDividerProps> = ({
  className = '',
  inverted = false,
  fillBaseColor = 'fill-brand-white',
}) => {
  const intensity = useMotionIntensity();
  const isPageVisible = usePageVisible();

  // Wave path tiling 2880px wide (two 1440px periods for seamless horizontal looping)
  const waveNavyPath =
    'M 0,35 Q 360,75 720,35 T 1440,35 Q 1800,75 2160,35 T 2880,35 L 2880,120 L 0,120 Z';
  const wavePurplePath =
    'M 0,55 Q 360,15 720,55 T 1440,55 Q 1800,15 2160,55 T 2880,55 L 2880,120 L 0,120 Z';
  const waveGoldLine =
    'M 0,45 Q 360,40 720,45 T 1440,45 Q 1800,40 2160,45 T 2880,45';

  const shouldAnimate = intensity === 'full' && isPageVisible;

  return (
    <div
      className={`w-full overflow-hidden leading-none relative z-10 select-none ${className} ${
        inverted ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <div className="relative w-full h-12 md:h-20 lg:h-24">
        {/* Layer 1: Navy Wave drifting at 30s */}
        <motion.div
          className="absolute inset-0 w-[200%] h-full flex"
          animate={
            shouldAnimate
              ? {
                  x: ['0%', '-50%'],
                }
              : undefined
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            viewBox="0 0 2880 120"
            fill="none"
            className="w-full h-full block text-brand-navy/20 fill-current"
            preserveAspectRatio="none"
          >
            <path d={waveNavyPath} />
          </svg>
        </motion.div>

        {/* Layer 2: Deep Purple Wave drifting at 22s */}
        <motion.div
          className="absolute inset-0 w-[200%] h-full flex"
          animate={
            shouldAnimate
              ? {
                  x: ['-50%', '0%'],
                }
              : undefined
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            viewBox="0 0 2880 120"
            fill="none"
            className={`w-full h-full block ${fillBaseColor}`}
            preserveAspectRatio="none"
          >
            <path d={wavePurplePath} />
          </svg>
        </motion.div>

        {/* Layer 3: Thin Gold Wave Line drifting at 16s */}
        <motion.div
          className="absolute inset-0 w-[200%] h-full flex"
          animate={
            shouldAnimate
              ? {
                  x: ['0%', '-50%'],
                }
              : undefined
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            viewBox="0 0 2880 120"
            fill="none"
            className="w-full h-full block"
            preserveAspectRatio="none"
          >
            <path
              d={waveGoldLine}
              stroke="#C9A24A"
              strokeWidth="2"
              strokeOpacity="0.75"
              fill="none"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
