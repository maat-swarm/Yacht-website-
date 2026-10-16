import React from 'react';
import { siteContent, ServicePrimary, SecondaryService } from '../data/content';
import { GoldRule } from './GoldRule';
import {
  HardHat,
  Building2,
  KeyRound,
  TrendingUp,
  Store,
  GraduationCap,
  Factory,
  FileCheck2,
  ClipboardList,
  FileSignature,
  Users2,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

const primaryIcons: Record<string, React.ReactNode> = {
  construction: <HardHat className="w-7 h-7 text-brand-white" aria-hidden="true" />,
  'property-management': <Building2 className="w-7 h-7 text-brand-white" aria-hidden="true" />,
  'real-estate-services': <KeyRound className="w-7 h-7 text-brand-white" aria-hidden="true" />,
};

const secondaryIcons: Record<string, React.ReactNode> = {
  investment: <TrendingUp className="w-5 h-5 text-brand-navy" aria-hidden="true" />,
  commercial: <Store className="w-5 h-5 text-brand-purple" aria-hidden="true" />,
  housing: <GraduationCap className="w-5 h-5 text-brand-scarlet" aria-hidden="true" />,
  industrial: <Factory className="w-5 h-5 text-brand-navy" aria-hidden="true" />,
  rental: <FileCheck2 className="w-5 h-5 text-brand-purple" aria-hidden="true" />,
  'project-mgmt': <ClipboardList className="w-5 h-5 text-brand-scarlet" aria-hidden="true" />,
  tendering: <FileSignature className="w-5 h-5 text-brand-navy" aria-hidden="true" />,
  smme: <Users2 className="w-5 h-5 text-brand-purple" aria-hidden="true" />,
};

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-16 sm:py-24 bg-brand-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-purple bg-brand-purple/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Core Disciplines
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-navy font-bold tracking-tight mb-3">
            Comprehensive Property & Construction
          </h2>
          <p className="text-brand-text/75 text-base sm:text-lg">
            Grounded in rigorous South African standards, ethical craftsmanship, and dependable stewardship across all asset lifecycles.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </div>

        {/* Lead with 3 Cards matching the Logo Badges (Navy, Purple, Scarlet) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {siteContent.primaryServices.map((service: ServicePrimary) => {
            const badgeBg =
              service.badgeColor === 'navy'
                ? 'bg-brand-navy'
                : service.badgeColor === 'purple'
                ? 'bg-brand-purple'
                : 'bg-brand-scarlet';

            const borderHighlight =
              service.badgeColor === 'navy'
                ? 'border-t-4 border-brand-navy'
                : service.badgeColor === 'purple'
                ? 'border-t-4 border-brand-purple'
                : 'border-t-4 border-brand-scarlet';

            const gradientPlaceholder =
              service.badgeColor === 'navy'
                ? 'from-brand-navy/90 to-brand-navy/60'
                : service.badgeColor === 'purple'
                ? 'from-brand-purple/90 to-brand-purple/60'
                : 'from-brand-scarlet/90 to-brand-scarlet/60';

            return (
              <div
                key={service.id}
                className={`bg-brand-offwhite rounded-xl shadow-xs border border-brand-purple/10 overflow-hidden flex flex-col transition-all hover:shadow-md ${borderHighlight}`}
              >
                {/* Brand-coloured gradient panel placeholder */}
                <div
                  className={`h-44 bg-gradient-to-br ${gradientPlaceholder} p-4 flex flex-col justify-between text-brand-white relative`}
                >
                  <div className="flex justify-between items-center">
                    {/* Rounded Circular Icon Badge from Logo */}
                    <div
                      className={`w-14 h-14 rounded-full ${badgeBg} border-2 border-brand-white flex items-center justify-center shadow-md`}
                    >
                      {primaryIcons[service.id]}
                    </div>
                    <span className="text-[11px] font-mono tracking-wider uppercase bg-brand-white/20 backdrop-blur-xs px-2.5 py-1 rounded text-brand-white/95 border border-brand-white/20">
                      Primary Service
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-brand-white/90 bg-brand-text/30 px-3 py-1.5 rounded backdrop-blur-xs w-fit">
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{service.placeholderLabel}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-brand-navy mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-brand-text/80 leading-relaxed mb-5">
                      {service.description}
                    </p>

                    <GoldRule className="my-3 opacity-60" />

                    <h4 className="text-xs uppercase font-semibold tracking-wider text-brand-purple mb-3">
                      Core Scope of Work
                    </h4>
                    <ul className="space-y-2.5 text-sm text-brand-text/85 mb-6">
                      {service.scope.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              service.badgeColor === 'navy'
                                ? 'text-brand-navy'
                                : service.badgeColor === 'purple'
                                ? 'text-brand-purple'
                                : 'text-brand-scarlet'
                            }`}
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#enquiry"
                    className="mt-2 inline-flex items-center justify-center min-h-[44px] w-full px-4 py-2.5 rounded text-sm font-semibold tracking-wider uppercase border border-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-brand-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-purple"
                  >
                    Enquire for {service.title}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Second Row: "Also" compact tiles */}
        <div className="bg-brand-offwhite rounded-2xl p-6 sm:p-10 border border-brand-purple/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-purple/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-scarlet">
                Extended Portfolio
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-navy">
                Also Provided by Yacht Properties
              </h3>
            </div>
            <p className="text-sm text-brand-text/70 max-w-md">
              Specialized turnkey capabilities covering institutional, municipal, and commercial client mandates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {siteContent.secondaryServices.map((item: SecondaryService) => (
              <div
                key={item.id}
                className="bg-brand-white p-4 rounded-xl border border-brand-purple/5 shadow-2xs hover:border-brand-purple/30 transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-offwhite flex items-center justify-center mb-3 group-hover:bg-brand-purple/10 transition-colors">
                  {secondaryIcons[item.id]}
                </div>
                <h4 className="font-semibold text-brand-navy text-sm mb-1 group-hover:text-brand-purple transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-brand-text/75 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Project showcase placeholder note */}
          <div className="mt-8 pt-6 border-t border-brand-purple/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-white/80 p-4 rounded-xl">
            <div className="flex items-center gap-3 text-xs text-brand-text/80">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
              <span>{siteContent.showcasePlaceholder}</span>
            </div>
            <a
              href="#enquiry"
              className="text-xs font-semibold text-brand-purple hover:text-brand-scarlet underline underline-offset-4 shrink-0"
            >
              Request project folio &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
