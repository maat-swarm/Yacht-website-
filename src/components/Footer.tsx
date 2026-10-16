import React from 'react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { ArrowUp, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-navy text-brand-white pt-16 pb-12 border-t-2 border-brand-gold/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-brand-white/10">
          
          {/* Brand Column (md:col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            {/* The Logo on a White Rounded Card on dark background as required */}
            <div className="bg-brand-white px-4 py-2.5 rounded-xl inline-block shadow-sm">
              <img
                src="/logo-wordmark.png"
                alt="Yacht Properties Wordmark"
                className="h-10 sm:h-12 w-auto object-contain"
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

          {/* Quick Links (md:col-span-3) */}
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
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#enquiry"
                  className="text-brand-scarlet hover:underline font-medium inline-block py-1"
                >
                  Make an Enquiry &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Summary (md:col-span-4) */}
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
                >
                  {siteContent.company.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${siteContent.company.email}`}
                  className="hover:text-brand-gold transition-colors"
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

            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-white/70 hover:text-brand-gold transition-colors min-h-[44px]"
              >
                <ArrowUp className="w-4 h-4" aria-hidden="true" />
                <span>Back to top</span>
              </button>
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
          <p className="text-brand-white/50 text-[11px] tracking-wide">
            {siteContent.footer.attribution}
          </p>
        </div>

      </div>
    </footer>
  );
};
