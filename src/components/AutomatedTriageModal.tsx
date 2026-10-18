import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  FileText,
  X,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface TriageResult {
  projectTier: string;
  estimatedDurationWeeks: number;
  statutoryRequirements: {
    cidbRequired: boolean;
    cidbClass: string;
    nhbrcRequired: boolean;
    ppraRequired: boolean;
    municipalApproval: string;
  };
  milestones: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  riskRating: string;
  triageSummary: string;
  priority: string;
  dispatchedTo: string;
}

interface AutomatedTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryData: {
    fullName: string;
    contact: string;
    service: string;
    message: string;
  };
  triageData: TriageResult | null;
  ticketId: string;
}

export const AutomatedTriageModal: React.FC<AutomatedTriageModalProps> = ({
  isOpen,
  onClose,
  enquiryData,
  triageData,
  ticketId,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [pipelineFinished, setPipelineFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(1);
      setPipelineFinished(false);
      return;
    }

    // Step-by-step automation animation sequence
    const s1 = setTimeout(() => setActiveStep(2), 600);
    const s2 = setTimeout(() => setActiveStep(3), 1300);
    const s3 = setTimeout(() => setActiveStep(4), 2100);
    const s4 = setTimeout(() => setPipelineFinished(true), 2800);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-brand-navy/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="triage-title"
    >
      <motion.div
        className="relative w-full max-w-3xl bg-brand-white rounded-2xl shadow-2xl border border-brand-purple/20 overflow-hidden my-8"
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 20 }}
        transition={{ duration: 0.35 }}
      >
        {/* Modal Header */}
        <div className="bg-brand-navy p-5 sm:p-6 text-brand-white flex items-center justify-between border-b-2 border-brand-gold/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-white p-1.5 flex items-center justify-center shadow-xs">
              <img
                src="/logo-wordmark.png"
                alt="Yacht Properties"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="triage-title" className="font-serif text-lg sm:text-xl font-bold">
                  Autonomous Triage & Dispatch Engine
                </h3>
                <span className="bg-brand-scarlet text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full">
                  Automated
                </span>
              </div>
              <p className="text-xs text-brand-gold">
                Ticket Ref: #{ticketId} • Falcon Haven Operations Center
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-white/10 hover:bg-brand-white/20 text-brand-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Automation Pipeline Visualizer */}
        <div className="bg-brand-offwhite p-4 border-b border-brand-purple/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Step 1 */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                activeStep >= 1
                  ? 'bg-brand-white border-brand-purple text-brand-navy shadow-xs font-semibold'
                  : 'bg-transparent border-brand-purple/10 text-brand-text/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider">Step 1</span>
                {activeStep > 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                )}
              </div>
              <p className="text-[11px] truncate">Intake & Scope AI</p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                activeStep >= 2
                  ? 'bg-brand-white border-brand-purple text-brand-navy shadow-xs font-semibold'
                  : 'bg-transparent border-brand-purple/10 text-brand-text/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider">Step 2</span>
                {activeStep > 2 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                ) : activeStep === 2 ? (
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                ) : null}
              </div>
              <p className="text-[11px] truncate">CIDB / NHBRC Audit</p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                activeStep >= 3
                  ? 'bg-brand-white border-brand-purple text-brand-navy shadow-xs font-semibold'
                  : 'bg-transparent border-brand-purple/10 text-brand-text/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider">Step 3</span>
                {activeStep > 3 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                ) : activeStep === 3 ? (
                  <span className="w-2 h-2 rounded-full bg-brand-scarlet animate-pulse" />
                ) : null}
              </div>
              <p className="text-[11px] truncate">Milestone Roadmap</p>
            </div>

            {/* Step 4 */}
            <div
              className={`p-2.5 rounded-lg border transition-all ${
                activeStep >= 4
                  ? 'bg-brand-white border-brand-purple text-brand-navy shadow-xs font-semibold'
                  : 'bg-transparent border-brand-purple/10 text-brand-text/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider">Step 4</span>
                {pipelineFinished ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                ) : activeStep === 4 ? (
                  <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
                ) : null}
              </div>
              <p className="text-[11px] truncate">Executive Dispatch</p>
            </div>
          </div>
        </div>

        {/* Modal Body / Triage Results */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Client Details Summary */}
          <div className="bg-brand-offwhite p-4 rounded-xl border border-brand-purple/10 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-text/50 block">Client</span>
              <span className="font-bold text-brand-navy">{enquiryData.fullName || 'Prospective Client'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-text/50 block">Contact</span>
              <span className="font-semibold text-brand-text">{enquiryData.contact || 'Direct inquiry'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-text/50 block">Service</span>
              <span className="font-semibold text-brand-purple">{enquiryData.service}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-text/50 block">Priority</span>
              <span className="inline-block px-2 py-0.5 rounded font-bold bg-brand-scarlet/10 text-brand-scarlet">
                {triageData?.priority || 'High'}
              </span>
            </div>
          </div>

          {/* AI Assessment & Classification */}
          {triageData && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-brand-purple/20 bg-brand-white shadow-2xs">
                <div className="flex items-center gap-2 mb-2 text-brand-navy font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Executive Assessment</span>
                </div>
                <p className="text-xs text-brand-text/80 leading-relaxed mb-3">
                  {triageData.triageSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-brand-purple/10 text-xs">
                  <div>
                    <span className="text-brand-text/50 text-[10px] uppercase block">Project Tier</span>
                    <span className="font-bold text-brand-navy">{triageData.projectTier}</span>
                  </div>
                  <div>
                    <span className="text-brand-text/50 text-[10px] uppercase block">Est. Duration</span>
                    <span className="font-bold text-brand-purple">{triageData.estimatedDurationWeeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-brand-text/50 text-[10px] uppercase block">Risk Rating</span>
                    <span className="font-bold text-brand-navy">{triageData.riskRating}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Checklist */}
              <div className="p-4 rounded-xl border border-brand-navy/15 bg-brand-offwhite">
                <div className="flex items-center gap-2 mb-2 text-brand-navy font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-brand-navy" />
                  <span>Statutory Compliance Gates</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-2 bg-brand-white p-2.5 rounded-lg border border-brand-purple/10">
                    <CheckCircle2 className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-navy">CIDB Rating</span>
                      <p className="text-[11px] text-brand-text/70">{triageData.statutoryRequirements.cidbClass}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-brand-white p-2.5 rounded-lg border border-brand-purple/10">
                    <CheckCircle2 className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-purple">NHBRC & Warranties</span>
                      <p className="text-[11px] text-brand-text/70">
                        {triageData.statutoryRequirements.nhbrcRequired ? 'Structural warranty enrollment required' : 'Standard general contractor adherence'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Milestone Roadmap */}
              {triageData.milestones && triageData.milestones.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-purple" />
                    <span>Automated Milestone Roadmap</span>
                  </h4>
                  <div className="space-y-2">
                    {triageData.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-brand-white p-3 rounded-xl border border-brand-purple/10 shadow-2xs text-xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-purple text-brand-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-brand-navy">{milestone.phase}</span>
                            <span className="text-[11px] text-brand-gold font-semibold">{milestone.duration}</span>
                          </div>
                          <p className="text-[11px] text-brand-text/75 mt-0.5">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automated Dispatch Status */}
              <div className="p-3.5 bg-brand-gold/15 border border-brand-gold/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-gold" />
                  <span className="text-brand-navy font-semibold">
                    Automated Alert Dispatched to: <strong className="text-brand-purple">{triageData.dispatchedTo}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-brand-navy/60 font-mono">Status: Acknowledged</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-brand-offwhite border-t border-brand-purple/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-brand-text/70 text-center sm:text-left">
            <span>Direct consultation desk: </span>
            <a href="tel:0637590216" className="font-bold text-brand-navy hover:underline">
              063 759 0216
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-lg border border-brand-purple/20 text-brand-navy hover:bg-brand-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Charter</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-2 rounded-lg bg-brand-scarlet text-brand-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-scarlet/90 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
