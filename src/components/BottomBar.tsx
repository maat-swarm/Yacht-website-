import React from 'react';

export const BottomBar: React.FC = () => {
  const handleNavigate = () => {
    window.location.href = '/command';
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-brand-navy border-t border-brand-gold/20 h-16 flex items-center justify-center select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Executive Bottom Bar"
    >
      <button
        type="button"
        onClick={handleNavigate}
        className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-lg hover:bg-brand-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold"
        aria-label="Open Command Centre"
      >
        <img
          src="/logo-emblem.png"
          alt="Yacht Properties"
          className="w-8 h-8 object-contain"
        />
        <span className="text-brand-gold text-[10px] font-semibold tracking-wider">
          Command Centre
        </span>
      </button>
    </nav>
  );
};

export default BottomBar;
