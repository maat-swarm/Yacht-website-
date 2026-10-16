import React, { useState } from 'react';
import { motion } from 'motion/react';
import { siteContent, CredentialShield } from '../data/content';
import { GoldRule } from './GoldRule';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { ShieldCheck, Award } from 'lucide-react';

export const Credentials: React.FC = () => {
  const intensity = useMotionIntensity();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="credentials" className="py-16 sm:py-24 bg-brand-offwhite relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={intensity !== 'off' ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
        >
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
        </motion.div>

        {/* 3 Shield Badges: CIDB (navy), NHBRC (purple), PPRA (scarlet) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {siteContent.credentials.map((cred: CredentialShield, index: number) => {
            const isHovered = hoveredCard === cred.id;

            const shieldBg =
              cred.badgeColor === 'navy'
                ? 'bg-brand-navy text-brand-white'
                : cred.badgeColor === 'purple'
                ? 'bg-brand-purple text-brand-white'
                : 'bg-brand-scarlet text-brand-white';

            const glowShadow =
              cred.badgeColor === 'navy'
                ? '0 16px 32px rgba(27, 42, 107, 0.18)'
                : cred.badgeColor === 'purple'
                ? '0 16px 32px rgba(75, 29, 122, 0.18)'
                : '0 16px 32px rgba(165, 28, 48, 0.18)';

            const borderAccent =
              cred.badgeColor === 'navy'
                ? 'border-brand-navy/20 hover:border-brand-navy'
                : cred.badgeColor === 'purple'
                ? 'border-brand-purple/20 hover:border-brand-purple'
                : 'border-brand-scarlet/20 hover:border-brand-scarlet';

            return (
              <motion.div
                key={cred.id}
                initial={
                  intensity !== 'off'
                    ? { y: -50, opacity: 0 }
                    : false
                }
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.16,
                  ease: [0.34, 1.56, 0.64, 1], // small bounce drop-in
                }}
                onMouseEnter={() => setHoveredCard(cred.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  boxShadow: isHovered ? glowShadow : undefined,
                  transform: isHovered ? 'translateY(-6px)' : undefined,
                  transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
                }}
                className={`bg-brand-white rounded-2xl p-7 border relative overflow-hidden flex flex-col justify-between ${borderAccent}`}
              >
                {/* Single metallic shine sweep across card after landing */}
                {intensity !== 'off' && (
                  <motion.div
                    className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-brand-white/40 to-transparent skew-x-12 pointer-events-none"
                    initial={{ x: '-150%' }}
                    whileInView={{ x: '350%' }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.8 + index * 0.18,
                      duration: 0.9,
                      ease: MOTION_EASINGS.default,
                    }}
                  />
                )}

                <div>
                  {/* Shield Badge Header with Tilt on Hover */}
                  <div className="flex items-center gap-4 mb-5">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl ${shieldBg} flex items-center justify-center shadow-sm shrink-0`}
                      animate={
                        isHovered && intensity === 'full'
                          ? { rotate: [-2, 4, 0], scale: 1.05 }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <ShieldCheck className="w-8 h-8" aria-hidden="true" />
                    </motion.div>
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

                  {/* Short label sliding up beneath on hover */}
                  <motion.div
                    className="overflow-hidden mb-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={
                      isHovered
                        ? { height: 'auto', opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.25 }}
                  >
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded">
                      Verified Compliance Mandate
                    </span>
                  </motion.div>
                </div>

                {/* Shimmering Skeleton Skeleton Placeholder for Registration Numbers */}
                <div className="pt-4 border-t border-brand-purple/10">
                  <div className="bg-brand-offwhite rounded-lg p-3 text-center border border-brand-purple/10 relative overflow-hidden">
                    {/* Light skeleton shimmer in muted tones */}
                    {intensity !== 'off' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-white/70 to-transparent pointer-events-none"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    )}
                    <span className="text-xs font-mono text-brand-text/70 font-medium block relative z-10">
                      {cred.regPlaceholder}
                    </span>
                    <span className="text-[11px] text-brand-text/50 mt-1 block relative z-10">
                      Official certificates furnished upon tender qualification
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ethical Commitment Banner with subtle hover lift */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto bg-brand-white rounded-xl p-5 border border-brand-gold/30 flex items-center gap-4 text-left shadow-2xs"
          initial={intensity !== 'off' ? { opacity: 0, y: 15 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -2 }}
        >
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
        </motion.div>

      </div>
    </section>
  );
};
