/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OpeningSequence } from './components/OpeningSequence';
import { LivingBackground } from './components/LivingBackground';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Purpose } from './components/Purpose';
import { Credentials } from './components/Credentials';
import { EnquirySection } from './components/EnquirySection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite text-brand-text font-sans selection:bg-brand-purple/20 selection:text-brand-purple relative">
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
      <main className="flex-1">
        <Hero />
        <Services />
        <Purpose />
        <Credentials />
        <EnquirySection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
