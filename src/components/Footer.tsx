import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { AnimatedWaveDivider } from './AnimatedWaveDivider';
import { useMotionIntensity } from '../motion/hooks';
import { ArrowUp, Phone, Mail, MapPin } from 'lucide-react';
import { DeveloperModal } from '../developer/DeveloperModal';

export const Footer: React.FC = () => {
  const intensity = useMotionIntensity();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-navy text-brand-white relative overflow-hidden">
      {/* Gentle drifting footer wave divider at top of footer */}
      <AnimatedWaveDivider
        className="w-full rotate-180 -mt-1 opacity-90"
        fillBaseColor="text-brand-navy fill-current"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-brand-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            {/* Logo on white rounded card with 10s shimmer pass */}
            <div className="relative bg-brand-white px-4 py-2.5 rounded-xl inline-block shadow-sm overflow-hidden">
              {intensity !== 'off' && (
                <motion.div
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 pointer-events-none"
                  animate={{
                    x: ['-100%', '250%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 8.5, // ~10s cycle
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                />
              )}
              <img
                src="/logo-wordmark.png"
                alt="Yacht Properties Wordmark"
                className="h-10 sm:h-12 w-auto object-contain relative z-10"
              />
            </div>

            <p className="font-serif text-xl text-brand-gold font-medium italic mt-2">
              &ldquo;{siteContent.company.slogan}&rdquo;
            </p>

            <p className="text-sm text-brand-white/75 max-w-sm leading-relaxed">
              {siteContent.company.summary}
            </p>

            <p className="text-xs text-brand-white/60 tracking-wider uppercase font-semibold">
              {siteContent.company.legalName}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-gold mb-3">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-white/80">
              {siteContent.navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-brand-gold transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold rounded py-1 inline-block"
                    data-interactive="true"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#enquiry"
                  className="text-brand-scarlet hover:underline font-medium inline-block py-1"
                  data-interactive="true"
                >
                  Make an Enquiry &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-gold mb-3">
              Direct Office
            </h4>
            <div className="space-y-2.5 text-sm text-brand-white/80">
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${siteContent.company.phoneTel}`}
                  className="hover:text-brand-gold transition-colors"
                  data-interactive="true"
                >
                  {siteContent.company.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${siteContent.company.email}`}
                  className="hover:text-brand-gold transition-colors"
                  data-interactive="true"
                >
                  {siteContent.company.email}
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {siteContent.company.address}, {siteContent.company.city}
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Thin Gold Rule */}
        <GoldRule className="my-6 opacity-40" />

        {/* Bottom Credits & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-white/65">
          <p>
            &copy; {new Date().getFullYear()} {siteContent.company.legalName}. {siteContent.footer.copyrightNote}
          </p>
          <div className="flex items-center gap-4 text-brand-white/50 text-[11px] tracking-wide">
            <span>{siteContent.footer.attribution}</span>
            <span className="text-brand-white/20">|</span>
            <button
              type="button"
              onClick={() => setIsDevModalOpen(true)}
              className="text-brand-white/30 hover:text-brand-gold text-[10px] tracking-wider transition-colors cursor-pointer select-none font-mono"
              data-interactive="true"
            >
              Developer
            </button>
          </div>
        </div>

      </div>

      {/* Developer Operations Console Modal */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />

      {/* Floating Circular Gold-outlined "Back to Top" Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            className="fixed bottom-6 right-6 z-40"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={scrollToTop}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Back to top"
              className="w-12 h-12 rounded-full border-2 border-brand-gold bg-brand-white text-brand-navy shadow-lg flex items-center justify-center hover:bg-brand-gold hover:text-brand-white transition-colors cursor-pointer group"
              data-interactive="true"
            >
              <motion.div
                animate={intensity !== 'off' ? { y: [0, -3, 0] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowUp className="w-5 h-5" aria-hidden="true" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};
