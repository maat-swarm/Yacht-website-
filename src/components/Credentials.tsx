import React from 'react';
import { siteContent, CredentialShield } from '../data/content';
import { GoldRule } from './GoldRule';
import { ShieldCheck, Award } from 'lucide-react';

export const Credentials: React.FC = () => {
  return (
    <section id="credentials" className="py-16 sm:py-24 bg-brand-offwhite relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-navy bg-brand-navy/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Statutory Compliance & Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-navy font-bold tracking-tight mb-3">
            Industry Registrations & Accreditations
          </h2>
          <p className="text-brand-text/75 text-base sm:text-lg">
            Operating in strict accordance with South African statutory oversight, consumer protection, and contracting governance.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </div>

        {/* 3 Shield Badges: CIDB (navy), NHBRC (purple), PPRA (scarlet) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {siteContent.credentials.map((cred: CredentialShield) => {
            const shieldBg =
              cred.badgeColor === 'navy'
                ? 'bg-brand-navy text-brand-white'
                : cred.badgeColor === 'purple'
                ? 'bg-brand-purple text-brand-white'
                : 'bg-brand-scarlet text-brand-white';

            const borderAccent =
              cred.badgeColor === 'navy'
                ? 'border-brand-navy/20 hover:border-brand-navy'
                : cred.badgeColor === 'purple'
                ? 'border-brand-purple/20 hover:border-brand-purple'
                : 'border-brand-scarlet/20 hover:border-brand-scarlet';

            return (
              <div
                key={cred.id}
                className={`bg-brand-white rounded-2xl p-7 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${borderAccent}`}
              >
                <div>
                  {/* Shield Badge Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl ${shieldBg} flex items-center justify-center shadow-sm shrink-0`}
                    >
                      <ShieldCheck className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-2xl font-serif font-bold text-brand-navy block">
                        {cred.name}
                      </span>
                      <span className="text-xs text-brand-text/70 uppercase tracking-wider font-semibold">
                        Regulated Entity
                      </span>
                    </div>
                  </div>

                  {/* Full Title */}
                  <h3 className="text-base font-semibold text-brand-text mb-2">
                    {cred.fullTitle}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-brand-text/80 leading-relaxed mb-6">
                    {cred.description}
                  </p>
                </div>

                {/* Marked Placeholder for Registration Numbers */}
                <div className="pt-4 border-t border-brand-purple/10">
                  <div className="bg-brand-offwhite rounded-lg p-3 text-center border border-brand-purple/10">
                    <span className="text-xs font-mono text-brand-text/70 font-medium block">
                      {cred.regPlaceholder}
                    </span>
                    <span className="text-[11px] text-brand-text/50 mt-1 block">
                      Official certificates furnished upon tender qualification
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical commitment badge banner */}
        <div className="mt-12 max-w-2xl mx-auto bg-brand-white rounded-xl p-5 border border-brand-gold/30 flex items-center gap-4 text-left shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-brand-navy">
              Good Standing & Regulatory Governance
            </h4>
            <p className="text-xs text-brand-text/75 leading-relaxed mt-0.5">
              All operations uphold South African construction codes, consumer warranty mandates, and estate agency trust accounts.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
