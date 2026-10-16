import React from 'react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { WaveDivider } from './WaveDivider';
import { ArrowDownRight, Compass } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative bg-gradient-to-b from-brand-white via-brand-offwhite to-brand-white pt-8 sm:pt-14 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Emblem and Wordmark on Clean White Base with soft gold halo glow */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative inline-block p-4 sm:p-6 bg-brand-white rounded-2xl shadow-sm border border-brand-purple/5">
            {/* The soft gold glow behind the emblem */}
            <div
              className="absolute inset-0 rounded-2xl bg-brand-gold/15 blur-2xl -z-10 pointer-events-none"
              aria-hidden="true"
            />
            <img
              src="/logo-hero.png"
              alt="Yacht Properties emblem and wordmark"
              className="w-64 sm:w-80 md:w-96 max-w-full h-auto object-contain mx-auto hero-halo-glow"
              width="384"
              height="340"
            />
          </div>
        </div>

        {/* Thin Gold Rule */}
        <div className="max-w-md mx-auto">
          <GoldRule withCenterAccent />
        </div>

        {/* Slogan */}
        <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-purple font-semibold tracking-wide mt-2 mb-3">
          &ldquo;{siteContent.company.slogan}&rdquo;
        </p>

        {/* One line on what the company does */}
        <p className="text-base sm:text-lg md:text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed font-sans mb-8 sm:mb-10">
          {siteContent.company.summary}
        </p>

        {/* Two Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pb-10 sm:pb-14">
          <a
            href="#enquiry"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded text-sm sm:text-base font-medium uppercase tracking-wider bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 transition-all shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-scarlet focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Make an Enquiry
            <ArrowDownRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded text-sm sm:text-base font-medium uppercase tracking-wider border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-white transition-all focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 mr-2" aria-hidden="true" />
            Our Services
          </a>
        </div>
      </div>

      {/* Layered Wave Divider in Navy and Purple */}
      <WaveDivider className="-mb-1" />
    </section>
  );
};
