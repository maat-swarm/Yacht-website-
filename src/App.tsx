import React, { useState } from 'react';
import { CommandCentre } from './pages/CommandCentre';
import { PaPortal } from './components/PaPortal';
import { OpeningSequence } from './components/OpeningSequence';
import { LivingBackground } from './components/LivingBackground';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Purpose } from './components/Purpose';
import { GallerySection } from './gallery/GallerySection';
import { Credentials } from './components/Credentials';
import { EnquirySection } from './components/EnquirySection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { BottomBar } from './components/BottomBar';

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);

  // Check if current route is /command
  if (typeof window !== 'undefined' && window.location.pathname === '/command') {
    return <CommandCentre />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite text-brand-text font-sans selection:bg-brand-purple/20 selection:text-brand-purple relative pb-16">
      {/* Living Atmospheric Background (fixed behind all content) */}
      <LivingBackground />

      {/* Opening Ceremonial Sequence (once per session, skippable) */}
      {!introFinished && (
        <OpeningSequence onComplete={() => setIntroFinished(true)} />
      )}

      {/* Desktop Custom Cursor */}
      <CustomCursor />

      {/* Main Single-Page Layout */}
      <Header />
      <main className="flex-1 pb-16">
        <Hero />
        <Services />
        <GallerySection />
        <Purpose />
        <Credentials />
        <EnquirySection />
        <Contact />
      </main>
      <Footer />
      <PaPortal />
      <BottomBar />
    </div>
  );
}
