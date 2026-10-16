import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { useMotionIntensity } from '../motion/hooks';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  asAnchor?: boolean;
  href?: string;
  maxOffset?: number; // max 8px as required
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  asAnchor = false,
  href,
  maxOffset = 8,
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  const intensity = useMotionIntensity();
  const ref = useRef<HTMLElement | null>(null);

  // Springs for magnetic pull
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (intensity !== 'full' || !ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Constrain to maxOffset
    const pullX = Math.max(-maxOffset, Math.min(maxOffset, distanceX * 0.25));
    const pullY = Math.max(-maxOffset, Math.min(maxOffset, distanceY * 0.25));

    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const commonMotionProps = {
    style: intensity === 'full' ? { x, y } : undefined,
    whileHover: { filter: 'brightness(1.06)' },
    whileTap: { scale: 0.97 },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  if (asAnchor && href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`inline-flex items-center justify-center transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none ${className}`}
        data-interactive="true"
        {...commonMotionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none ${className}`}
      data-interactive="true"
      {...commonMotionProps}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};
