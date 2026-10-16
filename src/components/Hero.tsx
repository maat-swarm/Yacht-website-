import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { AnimatedWaveDivider } from './AnimatedWaveDivider';
import { MagneticButton } from './MagneticButton';
import { useMotionIntensity, usePageVisible } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { ArrowDownRight, Compass, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const intensity = useMotionIntensity();
  const isPageVisible = usePageVisible();

  // Mouse Parallax for desktop only
  const mouseX = useSpring(0, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (intensity !== 'full') return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = ((e.clientX - centerX) / centerX) * 12; // max ~12px
      const offsetY = ((e.clientY - centerY) / centerY) * 12;
      mouseX.set(offsetX);
      mouseY.set(offsetY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity, mouseX, mouseY]);

  // Scroll-based parallax and exit fade
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.25]);
  const logoParallaxY = useTransform(scrollY, [0, 600], [0, 110]);
  const textParallaxY = useTransform(scrollY, [0, 600], [0, 160]);

  // Scroll hint visibility
  const [showScrollHint, setShowScrollHint] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headlineWords = ['We', 'are', 'You'];

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-brand-white via-brand-offwhite to-brand-white pt-8 sm:pt-14 overflow-hidden select-none"
    >
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        style={{ opacity: intensity !== 'off' ? heroOpacity : 1 }}
      >
        {/* Emblem and Wordmark with Floating, Breathing Gold Glow, Shine Sweep, and Parallax */}
        <motion.div
          className="flex justify-center mb-6 sm:mb-8"
          style={{ y: intensity === 'full' ? logoParallaxY : 0 }}
        >
          {/* Logo container with mouse parallax */}
          <motion.div
            className="relative inline-block"
            style={intensity === 'full' ? { x: mouseX, y: mouseY } : undefined}
          >
            {/* Breathing Gold Glow behind the emblem */}
            <motion.div
              className="absolute inset-0 -m-6 rounded-3xl bg-brand-gold/30 blur-2xl -z-10 pointer-events-none"
              animate={
                intensity !== 'off' && isPageVisible
                  ? {
                      scale: [1, 1.08, 1],
                      opacity: [0.5, 0.9, 0.5],
                    }
                  : undefined
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-hidden="true"
            />

            {/* Logo Card with 6-second vertical float */}
            <motion.div
              className="relative p-4 sm:p-6 bg-brand-white rounded-2xl shadow-md border border-brand-purple/10 overflow-hidden"
              animate={
                intensity !== 'off' && isPageVisible
                  ? {
                      y: [-4, 4, -4],
                    }
                  : undefined
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Shine sweep crossing logo every 8s */}
              {intensity !== 'off' && isPageVisible && (
                <motion.div
                  className="absolute inset-0 w-1/2 h-[200%] -top-1/2 -left-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-25 pointer-events-none z-20"
                  animate={{
                    x: ['-100%', '350%'],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatDelay: 6.2, // ~8s cycle
                    ease: MOTION_EASINGS.default,
                  }}
                  aria-hidden="true"
                />
              )}

              <img
                src="/logo-hero.png"
                alt="Yacht Properties emblem and wordmark"
                className="w-64 sm:w-80 md:w-96 max-w-full h-auto object-contain mx-auto hero-halo-glow relative z-10"
                width="384"
                height="340"
              />
            </motion.div>

            {/* Breathing soft shadow beneath floating logo */}
            <motion.div
              className="w-3/4 h-3 mx-auto mt-2 bg-brand-navy/15 rounded-full blur-md"
              animate={
                intensity !== 'off' && isPageVisible
                  ? {
                      scaleX: [0.9, 1.05, 0.9],
                      opacity: [0.35, 0.65, 0.35],
                    }
                  : undefined
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-hidden="true"
            />
          </motion.div>
        </motion.div>

        {/* Text Container with parallax */}
        <motion.div
          style={{ y: intensity === 'full' ? textParallaxY : 0 }}
          className="relative z-10"
        >
          {/* Thin Gold Rule */}
          <div className="max-w-md mx-auto">
            <GoldRule withCenterAccent />
          </div>

          {/* Headline "We are You" reveals word by word with fade & blur */}
          <div className="flex items-center justify-center gap-2.5 my-3">
            {headlineWords.map((word, idx) => (
              <motion.span
                key={word}
                className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-purple font-bold tracking-wide inline-block"
                initial={
                  intensity !== 'off'
                    ? { opacity: 0, y: 20, filter: 'blur(6px)' }
                    : false
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + idx * 0.12,
                  ease: MOTION_EASINGS.default,
                }}
              >
                {idx === 0 && <span className="font-serif italic mr-0.5">&ldquo;</span>}
                {word}
                {idx === headlineWords.length - 1 && <span className="font-serif italic ml-0.5">&rdquo;</span>}
              </motion.span>
            ))}
          </div>

          {/* One line on what the company does */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed font-sans mb-8 sm:mb-10"
            initial={intensity !== 'off' ? { opacity: 0, y: 15 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: MOTION_EASINGS.default }}
          >
            {siteContent.company.summary}
          </motion.p>

          {/* Staggered Cascade Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pb-8 sm:pb-12"
            initial={intensity !== 'off' ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: MOTION_EASINGS.default }}
          >
            <MagneticButton
              asAnchor
              href="#enquiry"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded text-sm sm:text-base font-medium uppercase tracking-wider bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 shadow-md focus-visible:ring-brand-scarlet"
            >
              Make an Enquiry
              <ArrowDownRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </MagneticButton>

            <MagneticButton
              asAnchor
              href="#services"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded text-sm sm:text-base font-medium uppercase tracking-wider border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-white focus-visible:ring-brand-navy"
            >
              <Compass className="w-4 h-4 mr-2" aria-hidden="true" />
              Our Services
            </MagneticButton>
          </motion.div>

          {/* Scroll Hint: Gentle Bobbing Chevron */}
          {showScrollHint && intensity !== 'off' && (
            <motion.div
              className="flex flex-col items-center justify-center text-brand-gold text-xs font-medium tracking-widest uppercase pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span className="text-[11px] mb-1">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5 text-brand-gold" aria-hidden="true" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Animated Wave Layers: 3 Horizontal Drifting Wave Swooshes (Navy, Purple, Gold Line) */}
      <AnimatedWaveDivider
        className="-mb-1"
        fillBaseColor="text-brand-white fill-current"
      />
    </section>
  );
};
