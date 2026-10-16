import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { useMotionIntensity } from '../motion/hooks';

export const CustomCursor: React.FC = () => {
  const intensity = useMotionIntensity();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOverInput, setIsOverInput] = useState(false);

  // Smooth springs for trailing ring
  const mouseX = useSpring(0, { damping: 28, stiffness: 350 });
  const mouseY = useSpring(0, { damping: 28, stiffness: 350 });

  // Direct position for instant gold dot
  const [rawPos, setRawPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (intensity !== 'full') return;

    const handleMouseMove = (e: MouseEvent) => {
      setRawPos({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      setIsOverInput(isInput);

      const isInteractive =
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('[role="button"]') !== null ||
        target.dataset.interactive === 'true';

      setIsHovered(isInteractive && !isInput);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [intensity, isVisible, mouseX, mouseY]);

  if (intensity !== 'full' || !isVisible || isOverInput) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {/* Trailing soft gold ring */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-gold/70 shadow-[0_0_12px_rgba(201,162,74,0.3)] pointer-events-none transition-transform"
        style={{
          x: mouseX,
          y: mouseY,
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          backgroundColor: isHovered ? 'rgba(201, 162, 74, 0.12)' : 'transparent',
        }}
      />

      {/* Central crisp gold dot */}
      <div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-gold pointer-events-none shadow-xs"
        style={{
          transform: `translate3d(${rawPos.x}px, ${rawPos.y}px, 0)`,
          opacity: isHovered ? 0.3 : 1,
        }}
      />
    </div>
  );
};
