import React from 'react';
import { motion } from 'motion/react';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';

interface GoldRuleProps {
  className?: string;
  withCenterAccent?: boolean;
}

export const GoldRule: React.FC<GoldRuleProps> = ({ className = '', withCenterAccent = false }) => {
  const intensity = useMotionIntensity();

  if (withCenterAccent) {
    return (
      <div className={`flex items-center justify-center gap-3 w-full my-6 ${className}`} aria-hidden="true">
        <motion.div
          className="h-[1px] flex-1 bg-brand-gold/50 max-w-xs origin-right"
          initial={intensity !== 'off' ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.7, ease: MOTION_EASINGS.default }}
        />
        <motion.div
          className="w-1.5 h-1.5 rotate-45 bg-brand-gold/80"
          initial={intensity !== 'off' ? { scale: 0, opacity: 0 } : false}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3, ease: MOTION_EASINGS.bounce }}
        />
        <motion.div
          className="h-[1px] flex-1 bg-brand-gold/50 max-w-xs origin-left"
          initial={intensity !== 'off' ? { scaleX: 0 } : false}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.7, ease: MOTION_EASINGS.default }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full my-4 flex justify-center ${className}`} aria-hidden="true">
      <motion.div
        className="h-[1px] w-full bg-brand-gold/50 origin-center"
        initial={intensity !== 'off' ? { scaleX: 0 } : false}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.8, ease: MOTION_EASINGS.default }}
      />
    </div>
  );
};
