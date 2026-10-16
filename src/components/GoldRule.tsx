import React from 'react';

interface GoldRuleProps {
  className?: string;
  withCenterAccent?: boolean;
}

export const GoldRule: React.FC<GoldRuleProps> = ({ className = '', withCenterAccent = false }) => {
  if (withCenterAccent) {
    return (
      <div className={`flex items-center justify-center gap-3 w-full my-6 ${className}`} aria-hidden="true">
        <div className="h-[1px] flex-1 bg-brand-gold/40 max-w-xs" />
        <div className="w-1.5 h-1.5 rotate-45 bg-brand-gold/80" />
        <div className="h-[1px] flex-1 bg-brand-gold/40 max-w-xs" />
      </div>
    );
  }

  return (
    <div
      className={`h-[1px] w-full bg-brand-gold/40 my-4 ${className}`}
      aria-hidden="true"
    />
  );
};
