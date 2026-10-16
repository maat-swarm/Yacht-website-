import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { siteContent } from '../data/content';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { PhoneCall } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export const Header: React.FC = () => {
  const intensity = useMotionIntensity();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();

  // Scroll listener for header shrink & background solidify
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = ['home', 'services', 'credentials', 'contact', 'enquiry'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-brand-white shadow-md border-b border-brand-purple/10 py-0'
            : 'bg-brand-white/70 backdrop-blur-md border-b border-brand-purple/5 py-1'
        }`}
      >
        {/* Top Emergency / Contact Strip */}
        <div className="bg-brand-navy text-brand-white text-xs py-1.5 px-4 hidden sm:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wider uppercase text-[11px]">
            <span className="text-brand-gold font-medium">South African Property & Construction</span>
            <div className="flex items-center gap-6">
              <a
                href={`tel:${siteContent.company.phoneTel}`}
                className="flex items-center gap-1.5 text-brand-white/90 hover:text-brand-gold transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:outline-none rounded px-1"
                data-interactive="true"
              >
                <PhoneCall className="w-3 h-3 text-brand-gold" aria-hidden="true" />
                <span>{siteContent.company.phone}</span>
              </a>
              <span className="text-brand-white/40">|</span>
              <span className="text-brand-white/80">{siteContent.company.slogan}</span>
            </div>
          </div>
        </div>

        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between relative"
          aria-label="Main Navigation"
        >
          {/* Wordmark on the left (shrinks slightly on scroll) */}
          <a
            href="#home"
            className="flex items-center py-2 rounded focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none"
            aria-label="Yacht Properties - Return to top"
            data-interactive="true"
          >
            <div className="bg-brand-white p-1 rounded-sm">
              <motion.img
                src="/logo-wordmark.png"
                alt="Yacht Properties Wordmark"
                className="w-auto object-contain transition-all duration-300"
                style={{
                  height: scrolled ? '40px' : '48px',
                }}
              />
            </div>
          </a>

          {/* Desktop Nav Links with Sliding Gold Underline */}
          <div className="hidden md:flex items-center gap-8 relative">
            {siteContent.navigation.map((item) => {
              const targetId = item.href.replace('#', '');
              const isActive = activeSection === targetId;
              const isHovered = hoveredNav === item.label;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative py-2 text-sm font-medium tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none rounded ${
                    isActive ? 'text-brand-purple font-semibold' : 'text-brand-navy hover:text-brand-purple'
                  }`}
                  data-interactive="true"
                >
                  <span>{item.label}</span>

                  {/* Sliding gold underline using shared layoutId */}
                  {intensity !== 'off' ? (
                    (isHovered || (isActive && !hoveredNav)) && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold shadow-[0_0_8px_rgba(201,162,74,0.5)]"
                        transition={{ duration: 0.25, ease: MOTION_EASINGS.default }}
                      />
                    )
                  ) : (
                    isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA: Scarlet Enquiry Button */}
          <div className="hidden md:flex items-center gap-4">
            <MagneticButton
              asAnchor
              href="#enquiry"
              className="min-h-[44px] px-6 py-2.5 rounded font-medium text-sm tracking-wider uppercase bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 shadow-sm focus-visible:ring-brand-scarlet"
            >
              Make an Enquiry
            </MagneticButton>
          </div>

          {/* Mobile menu toggle & quick button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90"
            >
              Enquiry
            </a>

            {/* Hamburger morphing button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-navy hover:text-brand-purple rounded p-2 focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none relative z-50"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <motion.span
                  className="w-full h-0.5 bg-brand-navy rounded-full origin-left"
                  animate={mobileMenuOpen ? { rotate: 45, y: -2, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-brand-navy rounded-full"
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-brand-navy rounded-full origin-left"
                  animate={mobileMenuOpen ? { rotate: -45, y: 2, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </button>
          </div>

          {/* Gold Scroll Progress Line along bottom edge of header */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold origin-left shadow-[0_0_8px_rgba(201,162,74,0.6)]"
            style={{ scaleX: scrollYProgress }}
          />
        </nav>
      </header>

      {/* Mobile Menu: Full-height panel sliding from right with dimmed backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Dimmed backdrop */}
            <motion.div
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              className="relative w-4/5 max-w-sm h-full bg-brand-white shadow-2xl z-10 flex flex-col justify-between p-6 border-l border-brand-purple/15 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: MOTION_EASINGS.default }}
            >
              <div>
                {/* Header inside mobile menu */}
                <div className="flex items-center justify-between pb-6 border-b border-brand-purple/10">
                  <img
                    src="/logo-wordmark.png"
                    alt="Yacht Properties"
                    className="h-9 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-navy text-xl"
                    aria-label="Close menu"
                  >
                    &times;
                  </button>
                </div>

                {/* Staggered Links */}
                <div className="py-6 space-y-2">
                  {siteContent.navigation.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * (index + 1), duration: 0.3 }}
                      className={`flex items-center min-h-[48px] px-4 rounded-lg text-lg font-medium transition-colors ${
                        activeSection === item.href.replace('#', '')
                          ? 'bg-brand-purple/10 text-brand-purple font-semibold'
                          : 'text-brand-navy hover:bg-brand-offwhite'
                      }`}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Bottom Mobile Drawer Actions */}
              <div className="pt-6 border-t border-brand-purple/10 space-y-4">
                <a
                  href="#enquiry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center min-h-[48px] w-full px-4 rounded font-medium text-sm tracking-wider uppercase bg-brand-scarlet text-brand-white shadow-md"
                >
                  Make an Enquiry
                </a>

                <div className="text-xs text-center text-brand-text/75 space-y-1">
                  <p>
                    Call:{' '}
                    <a
                      href={`tel:${siteContent.company.phoneTel}`}
                      className="text-brand-navy font-bold"
                    >
                      {siteContent.company.phone}
                    </a>
                  </p>
                  <p className="text-[11px] text-brand-text/60">{siteContent.company.address}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
