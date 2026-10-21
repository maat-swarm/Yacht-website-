import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface OpeningSequenceProps {
  onComplete: () => void;
}

const SEEN_KEY = 'yacht_splash_seen';
const FADE_MS = 600;
const MAX_MS = 10000;
const REDUCED_MS = 3000;

const alreadySeen = (): boolean => {
  try {
    if (window.location.search.includes('splash')) return false;
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const [skip] = useState(alreadySeen);
  const [leaving, setLeaving] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const doneRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    setLeaving(true);
    window.setTimeout(onComplete, FADE_MS);
  }, [onComplete]);

  useEffect(() => {
    if (skip) { onComplete(); return; }
    const showPosterOnly = reduced || videoFailed;
    const t = window.setTimeout(finish, showPosterOnly ? REDUCED_MS : MAX_MS);
    return () => window.clearTimeout(t);
  }, [skip, reduced, videoFailed, finish, onComplete]);

  useEffect(() => {
    if (skip || reduced) return;
    videoRef.current?.play().catch(() => setVideoFailed(true));
  }, [skip, reduced]);

  if (skip) return null;

  return (
    <motion.div
      role="dialog"
      aria-label="Yacht Properties"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-offwhite"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE_MS / 1000 }}
    >
      {reduced || videoFailed ? (
        <img
          src="/splash-poster.jpg"
          alt="Yacht Properties"
          className="h-full w-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          poster="/splash-poster.jpg"
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={finish}
          onError={() => setVideoFailed(true)}
        >
          <source src="/splash.mp4" type="video/mp4" />
          <source src="/splash.webm" type="video/webm" />
        </video>
      )}
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-8 right-6 min-h-[44px] min-w-[44px] rounded-xl border border-brand-gold/40 bg-brand-white/80 px-5 py-2 text-sm font-semibold text-brand-navy"
      >
        Skip
      </button>
    </motion.div>
  );
};
