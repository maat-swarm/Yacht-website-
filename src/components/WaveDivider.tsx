import React from 'react';

interface WaveDividerProps {
  className?: string;
  inverted?: boolean;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({ className = '', inverted = false }) => {
  return (
    <div
      className={`w-full overflow-hidden leading-none relative z-10 ${className} ${
        inverted ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-12 md:h-20 lg:h-24 block preserve-3d"
        preserveAspectRatio="none"
      >
        {/* Layer 1: Navy wave swoosh */}
        <path
          d="M0,45 C280,110 520,10 820,70 C1120,125 1320,30 1440,55 L1440,120 L0,120 Z"
          className="text-brand-navy/15 fill-current"
        />
        {/* Layer 2: Deep Purple wave swoosh */}
        <path
          d="M0,65 C340,15 620,110 940,40 C1180,85 1360,65 1440,80 L1440,120 L0,120 Z"
          className="text-brand-purple fill-current"
        />
      </svg>
    </div>
  );
};
