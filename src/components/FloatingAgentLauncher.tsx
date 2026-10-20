import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';
import { useMotionIntensity } from '../motion/hooks';

export const FloatingAgentLauncher: React.FC = () => {
  const intensity = useMotionIntensity();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-6 z-40 select-none"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            type="button"
            onClick={() => {
              window.location.href = '/command';
            }}
            whileHover={intensity === 'full' ? { scale: 1.05 } : undefined}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 bg-brand-navy hover:bg-brand-purple border border-brand-gold/50 text-brand-white px-4 py-2.5 rounded-full shadow-xl transition-colors cursor-pointer"
            aria-label="Open Command Centre"
          >
            <div className="w-7 h-7 rounded-full bg-brand-scarlet text-brand-white flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold leading-none">Command Centre</span>
              <Sparkles className="w-3 h-3 text-brand-gold animate-pulse inline ml-1" />
              <span className="text-[10px] text-brand-gold/90 font-medium leading-none block">
                Executive Portal
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingAgentLauncher;
