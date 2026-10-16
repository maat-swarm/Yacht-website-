import React, { useState } from 'react';
import { siteContent } from '../data/content';
import { Menu, X, PhoneCall } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-white/95 backdrop-blur-md border-b border-brand-purple/10 shadow-xs">
      {/* Top subtle emergency/contact strip for quick access */}
      <div className="bg-brand-navy text-brand-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wider uppercase text-[11px]">
          <span className="text-brand-gold font-medium">South African Property & Construction</span>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${siteContent.company.phoneTel}`}
              className="flex items-center gap-1.5 text-brand-white/90 hover:text-brand-gold transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:outline-none rounded px-1"
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        aria-label="Main Navigation"
      >
        {/* Wordmark on the left */}
        <a
          href="#home"
          className="flex items-center gap-3 py-2 rounded focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none"
          aria-label="Yacht Properties - Return to top"
        >
          <div className="bg-brand-white p-1 rounded">
            <img
              src="/logo-wordmark.png"
              alt="Yacht Properties Wordmark"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {siteContent.navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-brand-navy hover:text-brand-purple font-medium text-sm tracking-wide transition-colors py-2 focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none rounded"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#enquiry"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded font-medium text-sm tracking-wider uppercase bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-brand-scarlet focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]"
          >
            Make an Enquiry
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="#enquiry"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 transition-all"
          >
            Enquiry
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-navy hover:text-brand-purple rounded p-2 focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-purple/10 bg-brand-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {siteContent.navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-4 rounded text-base font-medium text-brand-navy hover:text-brand-purple hover:bg-brand-offwhite transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-brand-purple/10">
            <a
              href="#enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center min-h-[44px] w-full px-4 rounded font-medium text-sm tracking-wider uppercase bg-brand-scarlet text-brand-white shadow-sm"
            >
              Make an Enquiry
            </a>
          </div>
          <div className="pt-3 text-xs text-center text-brand-text/70 space-y-1">
            <p>Direct line: <a href={`tel:${siteContent.company.phoneTel}`} className="text-brand-navy font-semibold">{siteContent.company.phone}</a></p>
            <p className="text-[11px] text-brand-text/60">{siteContent.company.address}</p>
          </div>
        </div>
      )}
    </header>
  );
};
