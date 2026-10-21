import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import { Send, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { AiAgentChat } from './EnquiryChatConsultant';
import { AutomatedTriageModal, TriageResult } from './AutomatedTriageModal';
import { supabase } from '../lib/supabaseClient';

export interface EnquiryFormData {
  fullName: string;
  contact: string;
  service: string;
  message: string;
}

export const EnquirySection: React.FC = () => {
  const intensity = useMotionIntensity();
  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: '',
    contact: '',
    service: 'Construction',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState(false);

  // Triage Modal state
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [ticketId, setTicketId] = useState<string>('');

  const submitEnquiry = async (data: EnquiryFormData) => {
    if (!data.fullName.trim() || !data.contact.trim() || !data.message.trim()) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 800);
      return;
    }

    setIsSubmitting(true);
    const newTicketId = `YP-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newTicketId);

    // Save lead to Supabase if configured
    if (supabase) {
      try {
        const { error: leadErr } = await supabase.from('leads').insert({
        full_name: data.fullName,
        contact: data.contact,
        service: data.service,
        message: data.message,
        status: 'new',
      });
      if (leadErr) console.warn('Lead save failed:', leadErr.message);
      } catch (err) {
        console.warn('Notice saving lead to Supabase:', err);
      }
    }

    // Call backend triage engine
    try {
      const res = await fetch('/api/agent/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.triageData) {
          setTriageResult(json.triageData);
          setTriageModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('Triage endpoint error:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleAutoFillEnquiry = (details: { fullName?: string; contact?: string; service?: string; message: string }) => {
    setFormData((prev) => ({
      ...prev,
      fullName: details.fullName || prev.fullName,
      contact: details.contact || prev.contact,
      service: details.service || prev.service,
      message: details.message || prev.message,
    }));
    const formElement = document.getElementById('enquiry-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEnquiry(formData);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      contact: '',
      service: 'Construction',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <section id="enquiry" className="py-16 sm:py-24 bg-brand-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Staggered Rise & Fade */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-14"
          initial={intensity !== 'off' ? { opacity: 0, y: 24 } : false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: MOTION_EASINGS.default }}
        >
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-scarlet bg-brand-scarlet/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Direct Consultation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-navy font-bold tracking-tight mb-3">
            Make an Enquiry
          </h2>
          <p className="text-brand-text/75 text-base sm:text-lg">
            Connect directly with our principals for project tenders, property management portfolios, or commercial developments.
          </p>
          <div className="max-w-xs mx-auto">
            <GoldRule withCenterAccent />
          </div>
        </motion.div>

        {/* 2-Column Grid: Form & Chat Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Enquiry Form with Floating Labels & Gold Underlines */}
          <motion.div
            className="lg:col-span-7 bg-brand-offwhite rounded-2xl p-6 sm:p-9 border border-brand-purple/10 shadow-sm"
            initial={intensity !== 'off' ? { opacity: 0, x: -25 } : false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.65, ease: MOTION_EASINGS.default }}
          >
            <div className="mb-6">
              <h3 className="font-serif text-2xl font-bold text-brand-navy mb-1">
                Project & Consultation Request
              </h3>
              <p className="text-sm text-brand-text/70">
                Please complete your details. We review all requests promptly with senior management.
              </p>
            </div>

            {submitted ? (
              <motion.div
                className="bg-brand-white rounded-xl p-8 text-center border border-brand-purple/15 shadow-xs space-y-4 relative overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: MOTION_EASINGS.bounce }}
              >
                {/* Gold particle burst on successful submission */}
                {intensity !== 'off' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-brand-gold"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: (Math.random() - 0.5) * 200,
                          y: (Math.random() - 0.5) * 200,
                          opacity: 0,
                          scale: 0.2,
                        }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                      />
                    ))}
                  </div>
                )}

                <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-brand-navy">
                  Thank You for Your Enquiry
                </h4>
                <p className="text-sm text-brand-text/80 max-w-md mx-auto leading-relaxed">
                  Your details have been recorded. Our team will contact you directly via phone or email regarding your project requirements.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] px-6 py-2 rounded text-sm font-semibold tracking-wider uppercase border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-navy"
                    data-interactive="true"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field */}
                <motion.div
                  className="relative"
                  animate={validationError && !formData.fullName ? { x: [-4, 4, -4, 4, 0] } : undefined}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="fullName"
                    className={`block text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      focusedField === 'fullName' ? 'text-brand-purple' : 'text-brand-navy'
                    } mb-1.5`}
                  >
                    Full Name <span className="text-brand-scarlet">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Sipho Sithole"
                      className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                    />
                    {/* Gold Underline Growing from Centre */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold origin-center pointer-events-none rounded-b-lg"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'fullName' ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                </motion.div>

                {/* Email or Phone Field */}
                <motion.div
                  className="relative"
                  animate={validationError && !formData.contact ? { x: [-4, 4, -4, 4, 0] } : undefined}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="contact"
                    className={`block text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      focusedField === 'contact' ? 'text-brand-purple' : 'text-brand-navy'
                    } mb-1.5`}
                  >
                    Email Address or Phone Number <span className="text-brand-scarlet">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="contact"
                      type="text"
                      required
                      value={formData.contact}
                      onFocus={() => setFocusedField('contact')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="e.g. sam@example.co.za or 082 123 4567"
                      className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                    />
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold origin-center pointer-events-none rounded-b-lg"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'contact' ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                </motion.div>

                {/* Service of Interest */}
                <div>
                  <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                    Service of Interest <span className="text-brand-scarlet">*</span>
                  </label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="Construction">Construction & Civil Contracting</option>
                    <option value="Property Management">Property Management & Facilities</option>
                    <option value="Real Estate Services">Real Estate Services & Acquisitions</option>
                    <option value="Property Investment">Property Investment Advisory</option>
                    <option value="Commercial & Retail">Commercial & Retail Developments</option>
                    <option value="Residential & Student Housing">Residential & Student Housing</option>
                    <option value="Industrial & Mixed-Use">Industrial & Mixed-Use Facilities</option>
                    <option value="Rental & Leasing">Rental & Leasing Services</option>
                    <option value="Project Management">Turnkey Project Management</option>
                    <option value="Tendering & Contracting">Tendering & Public Sector Contracting</option>
                    <option value="SMME Partnerships">SMME Subcontracting & Partnerships</option>
                    <option value="General Enquiry">Other / General Enquiry</option>
                  </select>
                </div>

                {/* Message Field */}
                <motion.div
                  className="relative"
                  animate={validationError && !formData.message ? { x: [-4, 4, -4, 4, 0] } : undefined}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="message"
                    className={`block text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      focusedField === 'message' ? 'text-brand-purple' : 'text-brand-navy'
                    } mb-1.5`}
                  >
                    Brief Message or Project Overview <span className="text-brand-scarlet">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      required
                      rows={4}
                      value={formData.message}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please outline the scope, site location, timeline, or specific questions..."
                      className="w-full px-4 py-3 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all resize-y"
                    />
                    <motion.div
                      className="absolute bottom-1.5 left-0 right-0 h-[2px] bg-brand-gold origin-center pointer-events-none rounded-b-lg"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: focusedField === 'message' ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                </motion.div>

                {/* Submit Button with Slow Pulse Ring every 4s, press scale, and checkmark morph */}
                <div className="pt-2 relative">
                  <div className="relative inline-block w-full">
                    {intensity !== 'off' && !isSubmitting && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-brand-scarlet pointer-events-none -z-10"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0, 0.45, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ filter: 'brightness(1.06)' }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full min-h-[48px] px-8 py-3 rounded text-sm font-semibold uppercase tracking-wider bg-brand-scarlet text-brand-white shadow-md focus-visible:ring-2 focus-visible:ring-brand-scarlet focus-visible:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-all select-none"
                      data-interactive="true"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4 animate-spin" />
                          <span>Recording Brief...</span>
                        </span>
                      ) : (
                        <>
                          <span>Submit Project Enquiry</span>
                          <Send className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className="text-[11px] text-brand-text/60 text-center mt-3">
                    Direct confidential review. Your details are never shared with external marketers.
                  </p>
                </div>
              </form>
            )}
          </motion.div>

          {/* Right Column: Live AI Technical Operations Desk */}
          <div className="lg:col-span-5 h-full">
            <AiAgentChat onAutoFillEnquiry={handleAutoFillEnquiry} />
          </div>

        </div>

      </div>

      {/* Automated Triage & Statutory Audit Pipeline Modal */}
      {triageModalOpen && (
        <AutomatedTriageModal
          isOpen={triageModalOpen}
          onClose={() => setTriageModalOpen(false)}
          enquiryData={formData}
          triageData={triageResult}
          ticketId={ticketId}
        />
      )}
    </section>
  );
};
