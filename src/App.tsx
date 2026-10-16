/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Purpose } from './components/Purpose';
import { Credentials } from './components/Credentials';
import { EnquirySection } from './components/EnquirySection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite text-brand-text font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
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
