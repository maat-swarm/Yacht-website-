import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { Quote } from 'lucide-react';

export const Purpose: React.FC = () => {
  const intensity = useMotionIntensity();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Silhouette rising with parallax
  const silhouetteY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const quoteLines = [
    'Stewardship for God&apos;s provision',
    'to the people less blessed than me.',
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-brand-purple text-brand-white py-20 sm:py-28 relative overflow-hidden"
    >
      {/* Animated Deep Purple Gradient Shift */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#391261] via-brand-purple to-[#23083F]"
        animate={
          intensity !== 'off'
            ? {
                opacity: [0.85, 1, 0.85],
              }
            : undefined
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Faint Huge Temple Silhouette rising with parallax (geometric columns, not logo) */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[850px] pointer-events-none opacity-[0.06] flex flex-col items-center -z-0"
        style={{ y: intensity === 'full' ? silhouetteY : 0 }}
        aria-hidden="true"
      >
        {/* Classical Pediment */}
        <div className="w-0 h-0 border-l-[380px] border-l-transparent border-r-[380px] border-r-transparent border-b-[80px] border-b-brand-gold" />
        <div className="w-[760px] h-6 bg-brand-gold mt-1" />
        {/* Classical Colonnade Columns */}
        <div className="w-[720px] flex justify-between h-[360px] mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-16 h-full bg-brand-gold flex flex-col justify-between">
              <div className="w-20 -ml-2 h-4 bg-brand-gold" />
              <div className="w-20 -ml-2 h-4 bg-brand-gold" />
            </div>
          ))}
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Sub-label */}
        <motion.span
          className="text-xs uppercase tracking-widest font-semibold text-brand-gold bg-brand-white/10 px-4 py-1.5 rounded-full inline-block mb-6 backdrop-blur-xs"
          initial={intensity !== 'off' ? { opacity: 0, y: 15 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASINGS.default }}
        >
          Foundational Mandate
        </motion.span>

        {/* Thin Gold Rule Above (Draws outward) */}
        <div className="max-w-md mx-auto mb-8">
          <GoldRule withCenterAccent />
        </div>

        {/* Quote Icon with Soft Glow */}
        <motion.div
          className="flex justify-center mb-6"
          initial={intensity !== 'off' ? { scale: 0.8, opacity: 0 } : false}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-full bg-brand-white/10 border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-[0_0_20px_rgba(201,162,74,0.3)]">
            <Quote className="w-6 h-6" aria-hidden="true" />
          </div>
        </motion.div>

        {/* Stewardship Quote revealed line by line */}
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-white font-medium leading-relaxed sm:leading-snug tracking-wide italic max-w-3xl mx-auto mb-8">
          <p className="space-y-2">
            <span className="block">&ldquo;Stewardship for God&apos;s provision</span>
            <span className="block text-brand-white/95">to the people less blessed than me.&rdquo;</span>
          </p>
        </blockquote>

        {/* Supporting Narrative */}
        <motion.p
          className="text-base sm:text-lg text-brand-white/85 max-w-2xl mx-auto leading-relaxed mb-8"
          initial={intensity !== 'off' ? { opacity: 0, y: 16 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {siteContent.purpose.narrative}
        </motion.p>

        {/* Gold Rule Below */}
        <div className="max-w-xs mx-auto mb-6">
          <GoldRule />
        </div>

        {/* Slogan & Attribution */}
        <motion.div
          className="flex flex-col items-center"
          initial={intensity !== 'off' ? { opacity: 0 } : false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-brand-gold">
            {siteContent.company.slogan}
          </span>
          <span className="text-xs text-brand-white/70 tracking-wider mt-1">
            {siteContent.company.legalName}
          </span>
        </motion.div>

      </div>
    </section>
  );
};
