import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';

interface OpeningSequenceProps {
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const intensity = useMotionIntensity();
  const [phase, setPhase] = useState<'line' | 'doorway' | 'logo' | 'curtains' | 'done'>('line');
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check session storage
    if (typeof window === 'undefined') return;
    const hasSeen = sessionStorage.getItem('yacht_properties_intro_seen');

    if (hasSeen || intensity === 'off') {
      onComplete();
      return;
    }

    setShouldRender(true);

    if (intensity === 'lite') {
      // Shorter sequence for lite mode (1.5 seconds)
      const timer = setTimeout(() => {
        sessionStorage.setItem('yacht_properties_intro_seen', 'true');
        setPhase('curtains');
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 400);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Full 3-second sequence
    const t1 = setTimeout(() => setPhase('doorway'), 600);
    const t2 = setTimeout(() => setPhase('logo'), 1200);
    const t3 = setTimeout(() => setPhase('curtains'), 2400);
    const t4 = setTimeout(() => {
      sessionStorage.setItem('yacht_properties_intro_seen', 'true');
      setPhase('done');
      onComplete();
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [intensity, onComplete]);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('yacht_properties_intro_seen', 'true');
    }
    setPhase('done');
    onComplete();
  };

  if (!shouldRender || phase === 'done') {
    return null;
  }

  const isCurtainsOpened = phase === 'curtains';

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Yacht Properties"
    >
      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 text-xs uppercase tracking-widest px-4 py-2 rounded-full bg-brand-white/10 hover:bg-brand-white/20 text-brand-gold border border-brand-gold/40 transition-colors backdrop-blur-sm min-h-[44px] flex items-center"
      >
        Skip intro
      </button>

      {/* Left Curtain Panel (Navy, echoing left wing of logo) */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-brand-navy shadow-2xl z-20"
        initial={{ x: 0 }}
        animate={{ x: isCurtainsOpened ? '-100%' : '0%' }}
        transition={{ duration: 0.75, ease: MOTION_EASINGS.default }}
      >
        {/* Subtle decorative temple pillar highlight on curtain */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-gold/30" />
      </motion.div>

      {/* Right Curtain Panel (Scarlet, echoing right wing of logo) */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-brand-scarlet shadow-2xl z-20"
        initial={{ x: 0 }}
        animate={{ x: isCurtainsOpened ? '100%' : '0%' }}
        transition={{ duration: 0.75, ease: MOTION_EASINGS.default }}
      >
        {/* Subtle decorative temple pillar highlight on curtain */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold/30" />
      </motion.div>

      {/* Central Content Area during reveal */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#2D0D4E] via-[#4B1D7A] to-[#1B2A6B]">
        {/* Background ambient gold aura */}
        <motion.div
          className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-brand-gold/20 blur-3xl pointer-events-none -z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: phase === 'logo' || phase === 'curtains' ? 1.25 : 0.8,
            opacity: phase === 'logo' || phase === 'curtains' ? 0.7 : 0,
          }}
          transition={{ duration: 1.2, ease: MOTION_EASINGS.gentle }}
        />

        {/* Thin Gold Line drawing outward from center */}
        <motion.div
          className="h-[1.5px] bg-brand-gold shadow-[0_0_12px_#C9A24A]"
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: phase === 'line' ? '180px' : '360px',
            opacity: phase !== 'curtains' ? 1 : 0,
            scaleY: phase === 'doorway' ? 2 : 1,
          }}
          transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
        />

        {/* Vertical Doorway Frame Lines splitting upward */}
        <AnimatePresence>
          {(phase === 'doorway' || phase === 'logo') && (
            <div className="relative w-72 sm:w-80 h-64 sm:h-72 my-4 flex items-center justify-center">
              {/* Left doorway post */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[1px] bg-brand-gold/70"
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, ease: MOTION_EASINGS.default }}
              />
              {/* Right doorway post */}
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-[1px] bg-brand-gold/70"
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, ease: MOTION_EASINGS.default }}
              />
              {/* Top doorway lintel */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[1px] bg-brand-gold/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: MOTION_EASINGS.default }}
              />

              {/* Logo rising from behind doorway */}
              <motion.div
                className="bg-brand-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-brand-gold/40 flex flex-col items-center"
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                animate={{
                  opacity: phase === 'logo' ? 1 : 0,
                  y: phase === 'logo' ? 0 : 30,
                  scale: phase === 'logo' ? 1 : 0.94,
                }}
                transition={{ duration: 0.8, ease: MOTION_EASINGS.default }}
              >
                <img
                  src="/logo-hero.png"
                  alt="Yacht Properties Emblem"
                  className="w-48 sm:w-56 h-auto object-contain hero-halo-glow"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Ceremonial Slogan Reveal */}
        <motion.p
          className="font-serif text-lg sm:text-xl text-brand-gold italic mt-4 tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'logo' ? 1 : 0, y: phase === 'logo' ? 0 : 10 }}
          transition={{ duration: 0.5 }}
        >
          We are You
        </motion.p>
      </div>
    </div>
  );
};
