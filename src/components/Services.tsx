import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { siteContent, ServicePrimary, SecondaryService } from '../data/content';
import { GoldRule } from './GoldRule';
import { useMotionIntensity, usePageVisible } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
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

interface PrimaryCardProps {
  service: ServicePrimary;
  index: number;
  intensity: string;
  isPageVisible: boolean;
}

const PrimaryServiceCard: React.FC<PrimaryCardProps> = ({
  service,
  index,
  intensity,
  isPageVisible,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(cardRef, { once: false, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // 3D Tilt calculation on hover (desktop only, max 6 degrees)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (intensity !== 'full' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

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

  // Idle icon animations
  const renderIcon = () => {
    const shouldAnimate = isInView && isPageVisible && intensity !== 'off';

    if (service.id === 'construction') {
      return (
        <motion.div
          animate={shouldAnimate ? { rotate: [-4, 4, -4] } : undefined}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HardHat className="w-7 h-7 text-brand-white" aria-hidden="true" />
        </motion.div>
      );
    }
    if (service.id === 'property-management') {
      return (
        <motion.div
          animate={shouldAnimate ? { scale: [1, 1.05, 1] } : undefined}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Building2 className="w-7 h-7 text-brand-white" aria-hidden="true" />
        </motion.div>
      );
    }
    return (
      <motion.div
        animate={shouldAnimate ? { y: [0, -3, 0] } : undefined}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <KeyRound className="w-7 h-7 text-brand-white" aria-hidden="true" />
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      initial={
        intensity !== 'off'
          ? { opacity: 0, y: 40, rotate: index % 2 === 0 ? -1.5 : 1.5 }
          : false
      }
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.65,
        delay: index * 0.14,
        ease: MOTION_EASINGS.default,
      }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          intensity === 'full' && isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px)`
            : undefined,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease-out',
      }}
      className={`bg-brand-offwhite rounded-xl shadow-xs overflow-hidden flex flex-col relative transition-all duration-300 ${borderHighlight} ${
        isHovered
          ? 'border-brand-gold/60 shadow-[0_16px_32px_rgba(201,162,74,0.16)]'
          : 'border border-brand-purple/10'
      }`}
    >
      {/* Brand gradient panel placeholder */}
      <div
        className={`h-44 bg-gradient-to-br ${gradientPlaceholder} p-4 flex flex-col justify-between text-brand-white relative overflow-hidden`}
      >
        <div className="flex justify-between items-center relative z-10">
          {/* Circular badge that spins once & pulses on hover */}
          <motion.div
            className={`w-14 h-14 rounded-full ${badgeBg} border-2 border-brand-white flex items-center justify-center shadow-md relative`}
            animate={
              isHovered && intensity === 'full'
                ? { rotate: 360, scale: 1.08 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
          >
            {renderIcon()}
          </motion.div>

          <span className="text-[11px] font-mono tracking-wider uppercase bg-brand-white/20 backdrop-blur-xs px-2.5 py-1 rounded text-brand-white/95 border border-brand-white/20">
            Primary Service
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-white/90 bg-brand-text/30 px-3 py-1.5 rounded backdrop-blur-xs w-fit relative z-10">
          <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{service.placeholderLabel}</span>
        </div>

        {/* Ambient shimmer across gradient on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-white/15 to-transparent -skew-x-12 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8 }}
          />
        )}
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
          className="mt-2 inline-flex items-center justify-center min-h-[44px] w-full px-4 py-2.5 rounded text-sm font-semibold tracking-wider uppercase border border-brand-purple/20 text-brand-purple hover:bg-brand-purple hover:text-brand-white transition-all focus-visible:ring-2 focus-visible:ring-brand-purple"
          data-interactive="true"
        >
          Enquire for {service.title}
        </a>
      </div>
    </motion.div>
  );
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
  const intensity = useMotionIntensity();
  const isPageVisible = usePageVisible();

  return (
    <section id="services" className="py-16 sm:py-24 bg-brand-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Staggered Rise & Fade */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={intensity !== 'off' ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
        >
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
        </motion.div>

        {/* Lead with 3 Primary Cards with Staggered Rise & Settling Rotation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {siteContent.primaryServices.map((service, index) => (
            <PrimaryServiceCard
              key={service.id}
              service={service}
              index={index}
              intensity={intensity}
              isPageVisible={isPageVisible}
            />
          ))}
        </div>

        {/* Second Row: "Also" compact tiles with wave stagger and border lighting */}
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
            {siteContent.secondaryServices.map((item: SecondaryService, index) => (
              <motion.div
                key={item.id}
                initial={intensity !== 'off' ? { opacity: 0, y: 20 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                  ease: MOTION_EASINGS.default,
                }}
                whileHover={{
                  y: -3,
                  boxShadow: '0 8px 18px rgba(201, 162, 74, 0.14)',
                }}
                className="bg-brand-white p-4 rounded-xl border border-brand-purple/10 shadow-2xs hover:border-brand-gold/60 transition-colors group cursor-pointer"
                data-interactive="true"
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
              </motion.div>
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
              data-interactive="true"
            >
              Request project folio &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
