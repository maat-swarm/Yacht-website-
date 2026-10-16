import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useMotionIntensity, usePageVisible } from '../motion/hooks';

export const LivingBackground: React.FC = () => {
  const intensity = useMotionIntensity();
  const isPageVisible = usePageVisible();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll-linked tone shift
  const { scrollYProgress } = useScroll();
  
  // Background tone shifts gently: warm off-white near hero -> cooler slate/navy near services -> deep royal purple near purpose
  const bgOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.03, 0.06, 0.09, 0.05]);

  // Particle Canvas for Layer B: Fine Gold Dust
  useEffect(() => {
    if (intensity === 'off' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = intensity === 'full' ? 40 : 12;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.6,
      speedY: Math.random() * 0.35 + 0.15, // Slow upward float
      speedX: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.45 + 0.25,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      if (!isPageVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.twinklePhase += p.twinkleSpeed;

        // Reset when floating off top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Soft twinkle
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinklePhase));

        // Draw soft gold particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 162, 74, ${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, isPageVisible]);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* Dynamic tone shift overlay */}
      <motion.div
        className="absolute inset-0 bg-brand-purple"
        style={{ opacity: bgOpacity }}
      />

      {/* Layer A: Drifting gradient mesh shapes */}
      {intensity !== 'off' ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* Shape 1: Deep Purple orb */}
          <motion.div
            className={`absolute -top-32 -left-32 ${
              intensity === 'full' ? 'w-[600px] h-[600px]' : 'w-[280px] h-[280px]'
            } rounded-full bg-brand-purple/6 blur-3xl`}
            animate={
              intensity === 'full' && isPageVisible
                ? {
                    x: [0, 60, -30, 0],
                    y: [0, 40, -20, 0],
                    scale: [1, 1.08, 0.95, 1],
                  }
                : undefined
            }
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Shape 2: Navy orb */}
          <motion.div
            className={`absolute top-1/3 -right-32 ${
              intensity === 'full' ? 'w-[550px] h-[550px]' : 'w-[260px] h-[260px]'
            } rounded-full bg-brand-navy/5 blur-3xl`}
            animate={
              intensity === 'full' && isPageVisible
                ? {
                    x: [0, -50, 30, 0],
                    y: [0, -40, 30, 0],
                    scale: [1, 0.92, 1.05, 1],
                  }
                : undefined
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />

          {/* Shape 3: Subtle Scarlet accent orb (very low opacity) */}
          <motion.div
            className={`absolute bottom-1/4 left-1/4 ${
              intensity === 'full' ? 'w-[450px] h-[450px]' : 'w-[220px] h-[220px]'
            } rounded-full bg-brand-scarlet/4 blur-3xl`}
            animate={
              intensity === 'full' && isPageVisible
                ? {
                    x: [0, 40, -40, 0],
                    y: [0, 30, -30, 0],
                  }
                : undefined
            }
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4,
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-radial from-brand-purple/5 via-transparent to-brand-navy/5" />
      )}

      {/* Layer C: Very faint light rays sweeping across hero from top (temple doorway motif) */}
      {intensity === 'full' && (
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none opacity-[0.07]"
          style={{
            background:
              'conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(201, 162, 74, 0.5) 20deg, transparent 40deg, rgba(201, 162, 74, 0.3) 60deg, transparent 80deg)',
          }}
          animate={
            isPageVisible
              ? {
                  rotate: [-3, 3, -3],
                }
              : undefined
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Layer B: Fine Gold Dust Canvas */}
      {intensity !== 'off' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
};
