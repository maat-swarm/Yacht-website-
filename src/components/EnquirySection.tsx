import React, { useState } from 'react';
import { siteContent } from '../data/content';
import { GoldRule } from './GoldRule';
import { Send, CheckCircle, MessageSquare, Bot, AlertCircle } from 'lucide-react';

export interface EnquiryFormData {
  fullName: string;
  contact: string;
  service: string;
  message: string;
}

export const EnquirySection: React.FC = () => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    fullName: '',
    contact: '',
    service: 'Construction',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Clearly named function where a backend endpoint (e.g., /api/enquiries or Firestore)
   * can be wired in later without structural changes.
   */
  const submitEnquiry = async (data: EnquiryFormData) => {
    // Current behavior: log to console and simulate brief submission
    console.log('[Yacht Properties] New Enquiry Received:', data);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
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

  /**
   * Placeholder hook for when the AI assistant backend endpoint is wired in later.
   */
  const handleChatAssistantSubmit = (_message: string) => {
    // Structured hook ready for future API integration
    console.log('[Ask Yacht Properties] Backend chat integration coming online.');
  };

  return (
    <section id="enquiry" className="py-16 sm:py-24 bg-brand-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
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
        </div>

        {/* 2-Column Grid: Left = Form, Right = Chat Shell */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Enquiry Form (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-brand-offwhite rounded-2xl p-6 sm:p-9 border border-brand-purple/10 shadow-sm">
            <div className="mb-6">
              <h3 className="font-serif text-2xl font-bold text-brand-navy mb-1">
                Project & Consultation Request
              </h3>
              <p className="text-sm text-brand-text/70">
                Please complete your details. We review all requests promptly with senior management.
              </p>
            </div>

            {submitted ? (
              <div className="bg-brand-white rounded-xl p-8 text-center border border-brand-purple/15 shadow-xs space-y-4">
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
                  >
                    Send Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
                    Full Name <span className="text-brand-scarlet">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Sipho Sithole"
                    className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
                    Email Address or Phone Number <span className="text-brand-scarlet">*</span>
                  </label>
                  <input
                    id="contact"
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. sam@example.co.za or 082 123 4567"
                    className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
                    Service of Interest <span className="text-brand-scarlet">*</span>
                  </label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full min-h-[44px] px-4 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all"
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

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-2">
                    Brief Message or Project Overview <span className="text-brand-scarlet">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please outline the scope, site location, timeline, or specific questions..."
                    className="w-full px-4 py-3 rounded-lg bg-brand-white border border-brand-purple/20 text-brand-text placeholder:text-brand-text/40 text-sm focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] px-8 py-3 rounded text-sm font-semibold uppercase tracking-wider bg-brand-scarlet text-brand-white hover:bg-brand-scarlet/90 transition-all shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-scarlet focus-visible:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span>Recording Enquiry...</span>
                    ) : (
                      <>
                        <span>Submit Project Enquiry</span>
                        <Send className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-brand-text/60 text-center mt-3">
                    Direct confidential review. Your details are never shared with external marketers.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Visual Shell Chat Panel "Ask Yacht Properties" (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-brand-white rounded-2xl border border-brand-purple/15 shadow-sm overflow-hidden flex flex-col h-full min-h-[520px]">
            
            {/* Chat Panel Header */}
            <div className="bg-brand-navy p-4 sm:p-5 text-brand-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-white p-1 flex items-center justify-center shadow-xs">
                  <img
                    src="/logo-wordmark.png"
                    alt="Yacht Properties"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-brand-white leading-tight">
                    Ask Yacht Properties
                  </h4>
                  <span className="text-[11px] text-brand-gold tracking-wider uppercase font-semibold">
                    Interactive Shell
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-white/10 px-2.5 py-1 rounded text-[11px] text-brand-white/80">
                <span className="w-2 h-2 rounded-full bg-brand-gold" />
                <span>Standby</span>
              </div>
            </div>

            {/* Chat Panel Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-brand-offwhite/50 space-y-4">
              
              <div className="space-y-4">
                {/* Assistant Welcome Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-purple text-brand-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="bg-brand-white p-4 rounded-2xl rounded-tl-xs border border-brand-purple/10 text-xs text-brand-text/85 leading-relaxed shadow-2xs">
                    <p className="font-semibold text-brand-navy mb-1">
                      Welcome to Yacht Properties (Pty) Ltd
                    </p>
                    <p>
                      We can assist with queries on our construction disciplines, property management mandates, and project consultations. Please submit your brief through the enquiry form, or reach our direct office line below.
                    </p>
                  </div>
                </div>

                {/* Example Query Prompts (decorative shell) */}
                <div className="pl-11 space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-text/50 block">
                    Common Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['CIDB & NHBRC scope', 'Property management rates', 'Falcon Haven office'].map((topic) => (
                      <span
                        key={topic}
                        className="text-[11px] bg-brand-white px-3 py-1.5 rounded-full border border-brand-purple/10 text-brand-text/75"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-brand-text/80">
                <AlertCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Assistant interface is in preparation. Backend conversational endpoints can be plugged directly into this shell without layout changes.
                </span>
              </div>

            </div>

            {/* Chat Input Shell (Disabled appearance as specified) */}
            <div className="p-4 bg-brand-white border-t border-brand-purple/10">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    disabled
                    placeholder="Assistant coming online..."
                    aria-label="Assistant input coming online"
                    className="w-full min-h-[44px] pl-4 pr-10 rounded-lg bg-brand-offwhite/80 border border-brand-purple/15 text-brand-text/50 text-xs italic cursor-not-allowed select-none focus:outline-none"
                  />
                  <MessageSquare className="w-4 h-4 text-brand-text/30 absolute right-3 top-3.5" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  disabled
                  aria-label="Send message (disabled)"
                  onClick={() => handleChatAssistantSubmit('')}
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-brand-text/10 text-brand-text/30 flex items-center justify-center cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-brand-text/50 text-center mt-2">
                For prompt replies, call <a href={`tel:${siteContent.company.phoneTel}`} className="text-brand-purple font-semibold hover:underline">{siteContent.company.phone}</a>.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
