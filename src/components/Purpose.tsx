import React from 'react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { Quote } from 'lucide-react';

export const Purpose: React.FC = () => {
  return (
    <section className="bg-brand-purple text-brand-white py-20 sm:py-24 relative overflow-hidden">
      {/* Subtle background architectural line motif */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#C9A24A_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Sub-label */}
        <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold bg-brand-white/10 px-4 py-1.5 rounded-full inline-block mb-6">
          Foundational Mandate
        </span>

        {/* Thin Gold Rule Above */}
        <div className="max-w-md mx-auto mb-8">
          <GoldRule withCenterAccent />
        </div>

        {/* Quote Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-white/10 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <Quote className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        {/* Stewardship Quote */}
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-white font-medium leading-relaxed sm:leading-snug tracking-wide italic max-w-3xl mx-auto mb-8">
          &ldquo;Stewardship for God&apos;s provision to the people less blessed than me.&rdquo;
        </blockquote>

        {/* Supporting Narrative */}
        <p className="text-base sm:text-lg text-brand-white/85 max-w-2xl mx-auto leading-relaxed mb-8">
          {siteContent.purpose.narrative}
        </p>

        {/* Gold Rule Below */}
        <div className="max-w-xs mx-auto mb-6">
          <GoldRule />
        </div>

        {/* Slogan & Attribution */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold tracking-widest uppercase text-brand-gold">
            {siteContent.company.slogan}
          </span>
          <span className="text-xs text-brand-white/70 tracking-wider mt-1">
            {siteContent.company.legalName}
          </span>
        </div>

      </div>
    </section>
  );
};
