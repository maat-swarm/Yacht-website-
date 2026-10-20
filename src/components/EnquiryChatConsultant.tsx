import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMotionIntensity } from '../motion/hooks';
import { MOTION_EASINGS } from '../motion/tokens';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Calculator,
  ShieldCheck,
  FileText,
  RotateCcw,
  Copy,
  Check,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionData?: {
    type: 'estimate' | 'compliance' | 'triage';
    data: any;
  };
}

interface AiAgentChatProps {
  onAutoFillEnquiry?: (details: { fullName?: string; contact?: string; service?: string; message: string }) => void;
}

export const AiAgentChat: React.FC<AiAgentChatProps> = ({ onAutoFillEnquiry }) => {
  const intensity = useMotionIntensity();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Greetings. I am the Yacht Properties AI Operations Officer at Falcon Haven. I can calculate project timelines, audit CIDB and NHBRC statutory compliance, advise on property management portfolios, or prepare your project brief for Sam Maripane.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'estimator' | 'compliance'>('chat');

  // Estimator Form State
  const [estService, setEstService] = useState('Construction');
  const [estArea, setEstArea] = useState('450');
  const [estScope, setEstScope] = useState('Turnkey office park and light industrial warehouse');
  const [isEstimating, setIsEstimating] = useState(false);

  // Compliance Form State
  const [compSector, setCompSector] = useState<'construction' | 'residential' | 'real_estate'>('construction');
  const [compBudget, setCompBudget] = useState('R3.5M - R6M');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          context: {
            currentSection: 'Enquiry & Consultation Hub',
            company: 'Yacht Properties (Pty) Ltd',
            directDesk: 'Sam Maripane 063 759 0216',
          },
        }),
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Resilient fallback reply
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          'Thank you for your project query. Yacht Properties coordinates civil and building projects in strict accordance with CIDB (GB/CE) and NHBRC warranty frameworks. For immediate scheduling or pricing, you may call executive management directly on 063 759 0216 or send your enquiry via the adjacent form.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEstimating(true);

    try {
      const res = await fetch('/api/agent/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: estService,
          areaSqm: estArea,
          projectScope: estScope,
        }),
      });

      const data = await res.json();
      const estimate = data.estimate;

      const aiMsg: ChatMessage = {
        id: `ai-est-${Date.now()}`,
        role: 'assistant',
        content: `Preliminary Estimate for ${estService} (${estArea} m²):\n\n• Estimated Duration: ~${estimate.estimatedWeeks} Weeks\n• Key Construction Trades: ${estimate.keyTrades.join(', ')}\n• Statutory Gates: ${estimate.statutoryGates.join(' • ')}\n\n${estimate.preliminaryNotes}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionData: {
          type: 'estimate',
          data: estimate,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setActiveTab('chat');
    } catch (err) {
      console.error('Estimate error:', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterPrompts = [
    'What CIDB grade is required for commercial projects?',
    'Estimate timeline for 450m² residential housing',
    'How do you manage commercial tenant portfolios?',
    'What is your Falcon Haven office address and hours?',
  ];

  return (
    <div className="bg-brand-white rounded-2xl border border-brand-purple/20 shadow-sm overflow-hidden flex flex-col h-full min-h-[580px] relative">
      {/* Animated subtle gold border glow in full mode */}
      {intensity === 'full' && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30"
          style={{
            padding: '2px',
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(201, 162, 74, 0.6) 35deg, transparent 70deg)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Header with Agent Identity and Status */}
      <div className="bg-brand-navy p-4 sm:p-5 text-brand-white flex items-center justify-between relative z-10 border-b border-brand-gold/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-white p-1 flex items-center justify-center shadow-xs">
            <img
              src="/logo-wordmark.png"
              alt="Yacht Properties"
              className="h-5 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-bold text-base text-brand-white leading-tight">
                Ask Yacht Properties
              </h4>
              <span className="inline-flex items-center gap-1 bg-brand-scarlet text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                Live Agent
              </span>
            </div>
            <span className="text-[11px] text-brand-gold tracking-wider uppercase font-semibold">
              AI Assistant • Falcon Haven Ops Desk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  role: 'assistant',
                  content:
                    'Conversation refreshed. How may our operations desk assist your construction or property management brief today?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            title="Reset conversation"
            className="w-8 h-8 rounded-lg bg-brand-white/10 hover:bg-brand-white/20 text-brand-white/80 flex items-center justify-center transition-colors text-xs"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-brand-purple/10 bg-brand-offwhite/60 text-xs font-semibold uppercase tracking-wider text-brand-navy relative z-10">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-brand-white text-brand-purple border-b-2 border-brand-purple font-bold shadow-2xs'
              : 'text-brand-text/70 hover:text-brand-purple'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agent Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('estimator')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'estimator'
              ? 'bg-brand-white text-brand-purple border-b-2 border-brand-purple font-bold shadow-2xs'
              : 'text-brand-text/70 hover:text-brand-purple'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Timeline Estimator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 py-2.5 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'compliance'
              ? 'bg-brand-white text-brand-purple border-b-2 border-brand-purple font-bold shadow-2xs'
              : 'text-brand-text/70 hover:text-brand-purple'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CIDB / NHBRC</span>
        </button>
      </div>

      {/* Tab 1: Live Chat Interface */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative z-10">
          {/* Scrollable messages container */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 max-h-[380px]">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-purple text-brand-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-brand-navy text-brand-white rounded-tr-xs shadow-xs'
                      : 'bg-brand-offwhite text-brand-text border border-brand-purple/15 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5 text-[10px] text-brand-text/50">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        {onAutoFillEnquiry && (
                          <button
                            type="button"
                            onClick={() =>
                              onAutoFillEnquiry({
                                message: `Discussed with AI Agent: ${msg.content.substring(0, 160)}...`,
                              })
                            }
                            className="text-brand-purple hover:text-brand-scarlet transition-colors flex items-center gap-1 font-semibold"
                            title="Insert into Enquiry Form"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Copy to Form</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="hover:text-brand-purple transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-brand-purple" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-brand-scarlet text-brand-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Thinking / Typing animation */}
            {isLoading && (
              <motion.div
                className="flex items-center gap-2 bg-brand-offwhite p-3 rounded-xl border border-brand-purple/10 w-fit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Bot className="w-4 h-4 text-brand-purple" />
                <span className="text-xs text-brand-text/60">Yacht Agent analyzing brief...</span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-4 py-2 bg-brand-offwhite/50 border-t border-brand-purple/10">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-text/50 block mb-1.5">
              Suggested Brief Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] bg-brand-white hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple px-2.5 py-1 rounded-full border border-brand-purple/15 transition-all text-left truncate max-w-full cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 sm:p-4 bg-brand-white border-t border-brand-purple/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about construction, CIDB, timelines, or property briefs..."
                className="flex-1 min-h-[44px] px-4 rounded-lg bg-brand-offwhite border border-brand-purple/20 text-brand-text placeholder:text-brand-text/50 text-xs focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="min-h-[44px] min-w-[44px] px-4 rounded-lg bg-brand-scarlet text-brand-white font-semibold text-xs uppercase tracking-wider hover:bg-brand-scarlet/90 transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Automated Scoping & Timeline Estimator */}
      {activeTab === 'estimator' && (
        <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-brand-offwhite/40">
          <div className="bg-brand-white p-4 rounded-xl border border-brand-purple/10 shadow-2xs">
            <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm mb-1">
              <Calculator className="w-4 h-4 text-brand-purple" />
              <span>Automated Construction Estimator</span>
            </div>
            <p className="text-xs text-brand-text/70 leading-relaxed mb-4">
              Enter your project parameters below. The AI Agent will generate a preliminary timeline, key trade sequencing, and statutory milestones.
            </p>

            <form onSubmit={handleRunEstimate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Discipline
                </label>
                <select
                  value={estService}
                  onChange={(e) => setEstService(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-brand-offwhite border border-brand-purple/20 text-brand-text"
                >
                  <option value="General Building Construction">General Building Construction</option>
                  <option value="Civil Engineering & Earthworks">Civil Engineering & Earthworks</option>
                  <option value="Residential Housing Development">Residential Housing Development</option>
                  <option value="Commercial Office Fit-out">Commercial Office Fit-out</option>
                  <option value="Industrial & Warehousing">Industrial & Warehousing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Approximate Area (m²)
                </label>
                <input
                  type="number"
                  value={estArea}
                  onChange={(e) => setEstArea(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-brand-offwhite border border-brand-purple/20 text-brand-text"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-navy mb-1">
                  Scope Brief
                </label>
                <textarea
                  rows={2}
                  value={estScope}
                  onChange={(e) => setEstScope(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-brand-offwhite border border-brand-purple/20 text-brand-text"
                />
              </div>

              <button
                type="submit"
                disabled={isEstimating}
                className="w-full min-h-[40px] bg-brand-purple hover:bg-brand-purple/90 text-brand-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                {isEstimating ? (
                  <span>Running AI Engine...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Generate AI Milestone Estimate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Statutory Compliance Audit (CIDB, NHBRC, PPRA) */}
      {activeTab === 'compliance' && (
        <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-brand-offwhite/40">
          <div className="bg-brand-white p-4 rounded-xl border border-brand-purple/10 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-brand-scarlet" />
              <span>South African Regulatory Gate Checker</span>
            </div>
            <p className="text-xs text-brand-text/70 leading-relaxed">
              Verify statutory contractor class and registration safeguards governing your project under South African law.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-brand-navy/20 bg-brand-navy/5">
                <span className="text-xs font-bold text-brand-navy block">CIDB Classification</span>
                <p className="text-[11px] text-brand-text/75 mt-0.5">
                  Applies to all public sector tenders and commercial building works. Yacht Properties operates with General Building (GB) and Civil Engineering (CE) capacity.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-brand-purple/20 bg-brand-purple/5">
                <span className="text-xs font-bold text-brand-purple block">NHBRC Home Warranty</span>
                <p className="text-[11px] text-brand-text/75 mt-0.5">
                  Mandatory under the Housing Consumers Protection Measures Act. Structural guarantees for all residential homes and student accommodations.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-brand-scarlet/20 bg-brand-scarlet/5">
                <span className="text-xs font-bold text-brand-scarlet block">PPRA Property Practice</span>
                <p className="text-[11px] text-brand-text/75 mt-0.5">
                  Protects client trust accounts, tenant deposits, and ethical leasing representation under the Property Practitioners Act.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSend('Please audit the statutory compliance requirements (CIDB grading, NHBRC warranty, municipal approvals) for our development.');
                setActiveTab('chat');
              }}
              className="w-full min-h-[40px] bg-brand-navy hover:bg-brand-navy/90 text-brand-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Ask Agent to Audit My Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Hotline Strip */}
      <div className="p-2.5 bg-brand-offwhite text-[10px] text-brand-text/60 border-t border-brand-purple/10 flex items-center justify-between px-4">
        <span>Falcon Haven Executive Desk</span>
        <a
          href="tel:0637590216"
          className="text-brand-purple font-semibold hover:text-brand-scarlet flex items-center gap-1"
        >
          <PhoneCall className="w-2.5 h-2.5" />
          <span>063 759 0216</span>
        </a>
      </div>
    </div>
  );
};
