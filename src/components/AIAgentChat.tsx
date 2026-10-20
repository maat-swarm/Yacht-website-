import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Search, ChevronRight, Copy, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Prospect {
  name: string;
  type: string;
  why: string;
  searchQuery: string;
  draftMessage: string;
}

export interface AIAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'chat' | 'pa';
  paUnlocked?: boolean;
  fullWidth?: boolean;
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Good day. I\'m Yacht Concierge, your assistant for Yacht Properties (Pty) Ltd. I can answer questions about our services, credentials, and how we work. How can I help you today?',
  timestamp: new Date(),
};

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  isOpen,
  onClose,
  defaultTab = 'chat',
  paUnlocked: initialPaUnlocked = false,
  fullWidth = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'pa'>(defaultTab);
  const [paUnlocked, setPaUnlocked] = useState(initialPaUnlocked);
  const [paErr, setPaErr] = useState(false);
  const [tender, setTender] = useState<{ answer: string; citations: string[] } | null>(null);
  const [tenderLoading, setTenderLoading] = useState(false);
  const [paInput, setPaInput] = useState('');
  const [paPassInput, setPaPassInput] = useState('');
  const [paLoading, setPaLoading] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [expandedDraft, setExpandedDraft] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPaUnlocked) {
      setPaUnlocked(true);
    }
  }, [initialPaUnlocked]);

  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab);
    }
  }, [defaultTab]);

  const unlockPA = async () => {
    try {
      const r = await fetch('/api/pa-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass: paPassInput }),
      });
      const j = await r.json();
      if (j.ok) {
        setPaErr(false);
        setPaUnlocked(true);
      } else {
        setPaErr(true);
      }
    } catch {
      setPaErr(true);
    }
  };

  useEffect(() => {
    if (!paUnlocked) return;
    setTenderLoading(true);
    fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'South Africa construction property tenders this week',
        focus: 'tenders',
      }),
    })
      .then((r) => r.json())
      .then((j) =>
        setTender({
          answer: j.answer || (j.error ? 'Research unavailable: ' + JSON.stringify(j.error).slice(0, 200) : ''),
          citations: j.citations || [],
        })
      )
      .catch(() => setTender({ answer: 'Research unavailable.', citations: [] }))
      .finally(() => setTenderLoading(false));
  }, [paUnlocked]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen && !fullWidth) {
      setMessages([GREETING]);
      setInput('');
      setProspects([]);
      setTab(defaultTab);
    }
  }, [isOpen, fullWidth, defaultTab]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: data.reply || 'Thank you. Sam will be in touch with you shortly.',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please call Sam directly on 063 759 0216.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const findProspects = async () => {
    const query = paInput.trim();
    if (!query || paLoading) return;

    setPaLoading(true);
    setProspects([]);
    setExpandedDraft(null);

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: query }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.prospects)) {
        setProspects(data.prospects);
      }
    } catch {
      // ignore
    } finally {
      setPaLoading(false);
    }
  };

  const copyDraft = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const contentUI = (
    <div className={`relative w-full ${fullWidth ? 'h-full min-h-[640px]' : 'sm:max-w-md h-[92vh] sm:h-[640px]'} bg-brand-navy border border-brand-purple/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-purple/20 bg-brand-navy shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-purple" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-white tracking-wider uppercase">Yacht Concierge</p>
            <p className="text-[10px] text-brand-gold font-medium">Yacht Properties (Pty) Ltd</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {!fullWidth && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-brand-white/10 hover:bg-brand-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 text-brand-white" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-purple/20 shrink-0 bg-brand-navy">
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'chat'
              ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-white/5'
              : 'text-brand-white/50 hover:text-brand-white/80'
          }`}
        >
          Concierge Chat
        </button>
        <button
          onClick={() => setTab('pa')}
          className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            tab === 'pa'
              ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-white/5'
              : 'text-brand-white/50 hover:text-brand-white/80'
          }`}
        >
          PA / Business Finder
        </button>
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-brand-purple" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-scarlet text-brand-white rounded-br-sm'
                      : 'bg-brand-white/8 border border-brand-purple/15 text-brand-white/90 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-brand-scarlet/20 border border-brand-scarlet/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-brand-scarlet" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-brand-purple" />
                </div>
                <div className="bg-brand-white/8 border border-brand-purple/15 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-white/40 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-white/40 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-white/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-brand-purple/10 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {['Commercial projects', 'Grade 1 GB capacity', 'Request a quote'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                }}
                className="text-[10px] text-brand-white/60 hover:text-brand-gold bg-brand-white/5 hover:bg-brand-white/10 border border-brand-purple/20 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-brand-purple/20 bg-brand-navy shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about our services…"
                className="flex-1 bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-purple/50 transition-colors"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-brand-scarlet hover:bg-brand-scarlet/80 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5 text-brand-white" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* PA Tab */}
      {tab === 'pa' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!paUnlocked ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
                <Search className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-brand-white mb-1">Business Finder</p>
                <p className="text-[11px] text-brand-white/50 leading-relaxed">
                  Find South African prospect companies and get a drafted intro message for each.
                </p>
              </div>
              <input
                type="password"
                value={paPassInput}
                onChange={(e) => setPaPassInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && unlockPA()}
                placeholder="Enter access code"
                className="w-full bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-gold/50 transition-colors text-center"
              />
              <button
                onClick={() => unlockPA()}
                className="w-full py-2 rounded-lg bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-xs font-semibold hover:bg-brand-gold/30 transition-colors cursor-pointer"
              >
                Access Finder
              </button>
              {paErr && <p className="text-[10px] text-brand-scarlet">Incorrect access code</p>}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="px-4 pt-4 pb-3 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paInput}
                    onChange={(e) => setPaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findProspects()}
                    placeholder="e.g. student housing developer in Soweto"
                    className="flex-1 bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-gold/50 transition-colors"
                    disabled={paLoading}
                  />
                  <button
                    onClick={findProspects}
                    disabled={paLoading || !paInput.trim()}
                    className="w-9 h-9 rounded-lg bg-brand-gold/20 border border-brand-gold/30 hover:bg-brand-gold/30 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    aria-label="Find prospects"
                  >
                    {paLoading ? (
                      <span className="w-3.5 h-3.5 border border-brand-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-brand-gold" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {paLoading && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[11px] text-brand-white/50">Finding prospects…</p>
                  </div>
                )}
                {tenderLoading && (
                  <p className="text-[11px] text-brand-white/50">Scanning live tenders and market signals…</p>
                )}
                {tender && (
                  <div className="mb-3 p-3 rounded-xl border border-brand-white/10 text-[11px] text-brand-white/80 whitespace-pre-wrap bg-brand-white/5">
                    {tender?.answer}
                    {(tender?.citations?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {(tender?.citations ?? []).slice(0, 6).map((c, i) => (
                          <a
                            key={i}
                            href={c}
                            target="_blank"
                            rel="noreferrer"
                            className="underline break-all text-brand-gold hover:text-brand-gold/80"
                          >
                            {c}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!paLoading && prospects.length === 0 && !tender && (
                  <p className="text-[11px] text-brand-white/40 text-center py-8">
                    Enter an opportunity focus above to find South African prospects.
                  </p>
                )}
                {prospects.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-brand-white/5 border border-brand-purple/15 rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-brand-white">{p.name}</p>
                        <span className="inline-block text-[10px] text-brand-gold border border-brand-gold/30 rounded px-1.5 py-0.5 mt-0.5">
                          {p.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-brand-white/70 leading-relaxed">{p.why}</p>
                    <div className="pt-1 border-t border-brand-purple/10 flex items-center justify-between gap-2">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(p.searchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-brand-gold/80 hover:text-brand-gold underline flex items-center gap-1"
                      >
                        Find contact page <ChevronRight className="w-2.5 h-2.5" />
                      </a>
                      <button
                        onClick={() => setExpandedDraft(expandedDraft === idx ? null : idx)}
                        className="text-[10px] text-brand-white/50 hover:text-brand-white/80 transition-colors cursor-pointer"
                      >
                        {expandedDraft === idx ? 'Hide draft' : 'View draft message'}
                      </button>
                    </div>
                    {expandedDraft === idx && (
                      <div className="mt-2 p-2.5 bg-brand-white/5 border border-brand-purple/10 rounded-lg space-y-2">
                        <p className="text-[10px] text-brand-white/80 whitespace-pre-wrap leading-relaxed">
                          {p.draftMessage}
                        </p>
                        <button
                          onClick={() => copyDraft(idx, p.draftMessage)}
                          className="flex items-center gap-1.5 text-[10px] text-brand-gold border border-brand-gold/30 rounded px-2 py-1 hover:bg-brand-gold/10 transition-colors cursor-pointer"
                        >
                          {copied === idx ? (
                            <>
                              <Check className="w-3 h-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy message
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullWidth) {
    return contentUI;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full sm:max-w-md"
          >
            {contentUI}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAgentChat;
