import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GalleryItem } from '../lib/supabaseClient';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { MOTION_EASINGS } from '../motion/tokens';

interface LightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const currentItem = items[currentIndex];

  // Focus management & neighbor preloading
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsZoomed(false);

      // Focus close button on open
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);

      // Preload previous and next neighbor images
      if (items[currentIndex - 1]) {
        const prevImg = new Image();
        prevImg.src = items[currentIndex - 1].image_url;
      }
      if (items[currentIndex + 1]) {
        const nextImg = new Image();
        nextImg.src = items[currentIndex + 1].image_url;
      }
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen, currentIndex, items]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsZoomed(false);
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setIsZoomed(false);
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Minimum swipe threshold 50px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery lightbox"
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-text/95 backdrop-blur-md select-none outline-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 text-brand-white bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-brand-gold bg-brand-white/10 px-3 py-1 rounded-full">
              {currentItem.album || 'Showcase'}
            </span>
            <span className="text-xs font-mono text-brand-white/80">
              {currentIndex + 1} / {items.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="min-h-[44px] min-w-[44px] rounded-full bg-brand-white/10 hover:bg-brand-white/20 text-brand-white flex items-center justify-center transition-colors"
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] rounded-full bg-brand-white/10 hover:bg-brand-scarlet text-brand-white flex items-center justify-center transition-colors"
              aria-label="Close lightbox (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Previous Button (Desktop) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 min-h-[44px] min-w-[44px] rounded-full bg-brand-white/10 hover:bg-brand-gold hover:text-brand-navy text-brand-white items-center justify-center transition-all shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button (Desktop) */}
        {currentIndex < items.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 min-h-[44px] min-w-[44px] rounded-full bg-brand-white/10 hover:bg-brand-gold hover:text-brand-navy text-brand-white items-center justify-center transition-all shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Center Image Container with Scale Reveal Animation */}
        <div className="relative max-w-5xl max-h-[85vh] p-4 flex flex-col items-center justify-center overflow-hidden">
          <motion.div
            key={currentItem.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: isZoomed ? 1.4 : 1,
              opacity: 1,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.35, ease: MOTION_EASINGS.default }}
            className={`transition-transform duration-300 ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentItem.image_url}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-brand-gold/30"
            />
          </motion.div>

          {/* Caption & Details Bar */}
          <div className="w-full text-center text-brand-white mt-4 max-w-2xl px-4">
            <h3 className="font-serif text-lg font-bold tracking-wide text-brand-white">
              {currentItem.title}
            </h3>
            {currentItem.caption && (
              <p className="text-xs text-brand-white/75 mt-1 leading-relaxed">
                {currentItem.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
