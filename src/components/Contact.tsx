import React, { useState } from 'react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { Phone, Mail, MapPin, Clock, Copy, Check } from 'lucide-react';

export const Contact: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-brand-offwhite relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-navy bg-brand-navy/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Direct Access
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-navy font-bold tracking-tight mb-3">
            Contact Yacht Properties
          </h2>
          <p className="text-brand-text/75 text-base sm:text-lg">
            We welcome direct enquiries from property owners, government entities, commercial tenants, and prospective partners.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </div>

        {/* 3-Column Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          
          {/* Phone Card (Navy) */}
          <div className="bg-brand-white rounded-2xl p-7 border border-brand-navy/15 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-white flex items-center justify-center mb-5 shadow-xs">
                <Phone className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-navy/70 block mb-1">
                Telephone & WhatsApp
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy mb-2">
                Direct Line
              </h3>
              <p className="text-sm text-brand-text/75 mb-4">
                Available during standard business hours for urgent project enquiries and property operations.
              </p>
              <a
                href={`tel:${siteContent.company.phoneTel}`}
                className="inline-block text-xl font-bold text-brand-navy hover:text-brand-purple transition-colors py-1 focus-visible:ring-2 focus-visible:ring-brand-navy rounded"
              >
                {siteContent.company.phone}
              </a>
            </div>

            <div className="pt-6 mt-6 border-t border-brand-purple/10 flex items-center gap-3">
              <a
                href={`tel:${siteContent.company.phoneTel}`}
                className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 rounded bg-brand-navy text-brand-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-navy/90 transition-colors"
              >
                Call Office
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(siteContent.company.phone, 'phone')}
                aria-label="Copy phone number"
                className="min-h-[44px] min-w-[44px] rounded border border-brand-purple/20 text-brand-navy flex items-center justify-center hover:bg-brand-offwhite transition-colors"
              >
                {copiedField === 'phone' ? <Check className="w-4 h-4 text-brand-purple" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Email Card (Purple) */}
          <div className="bg-brand-white rounded-2xl p-7 border border-brand-purple/15 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-purple text-brand-white flex items-center justify-center mb-5 shadow-xs">
                <Mail className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-purple/80 block mb-1">
                Electronic Mail
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-purple mb-2">
                Executive Desk
              </h3>
              <p className="text-sm text-brand-text/75 mb-4">
                For formal RFQs, tender tenders, contract documents, and investment proposals.
              </p>
              <a
                href={`mailto:${siteContent.company.email}`}
                className="inline-block text-base sm:text-lg font-bold text-brand-purple hover:text-brand-scarlet transition-colors break-all py-1 focus-visible:ring-2 focus-visible:ring-brand-purple rounded"
              >
                {siteContent.company.email}
              </a>
            </div>

            <div className="pt-6 mt-6 border-t border-brand-purple/10 flex items-center gap-3">
              <a
                href={`mailto:${siteContent.company.email}`}
                className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 rounded bg-brand-purple text-brand-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-purple/90 transition-colors"
              >
                Send Email
              </a>
              <button
                type="button"
                onClick={() => copyToClipboard(siteContent.company.email, 'email')}
                aria-label="Copy email address"
                className="min-h-[44px] min-w-[44px] rounded border border-brand-purple/20 text-brand-purple flex items-center justify-center hover:bg-brand-offwhite transition-colors"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-brand-purple" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Physical Address Card (Scarlet accent) */}
          <div className="bg-brand-white rounded-2xl p-7 border border-brand-scarlet/20 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-scarlet text-brand-white flex items-center justify-center mb-5 shadow-xs">
                <MapPin className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-scarlet block mb-1">
                Physical Office
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy mb-2">
                Headquarters
              </h3>
              <p className="text-sm text-brand-text/75 mb-3">
                Located in Gauteng with operational coverage spanning commercial and residential nodes.
              </p>
              <div className="text-base font-semibold text-brand-text/90 py-1">
                <p>{siteContent.company.address}</p>
                <p className="text-sm text-brand-text/70">{siteContent.company.city}</p>
                <p className="text-xs text-brand-text/50 uppercase tracking-wider mt-0.5">{siteContent.company.country}</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-brand-purple/10 flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-brand-text/70">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" aria-hidden="true" />
                <span>{siteContent.company.hours}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
