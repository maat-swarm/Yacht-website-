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

interface AIAgentChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const PA_PASSPHRASE = 'yacht2024';

const GREETING: Message = {
  role: 'assistant',
  content: 'Good day. I\'m Yacht Concierge, your assistant for Yacht Properties (Pty) Ltd. I can answer questions about our services, credentials, and how we work. How can I help you today?',
  timestamp: new Date(),
};

export const AIAgentChat: React.FC<AIAgentChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'pa'>('chat');
  const [paUnlocked, setPaUnlocked] = useState(false);
  const [paInput, setPaInput] = useState('');
  const [paPassInput, setPaPassInput] = useState('');
  const [paLoading, setPaLoading] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [expandedDraft, setExpandedDraft] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([GREETING]);
      setInput('');
      setProspects([]);
      setTab('chat');
    }
  }, [isOpen]);

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
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting. Please call Sam directly on 063 759 0216.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const findProspects = async () => {
    const text = paInput.trim();
    if (!text || paLoading) return;
    setPaLoading(true);
    setProspects([]);

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: text }),
      });
      const data = await res.json();
      if (data.success && data.prospects) {
        setProspects(data.prospects);
      } else {
        setProspects([]);
      }
    } catch {
      setProspects([]);
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
            className="relative w-full sm:max-w-md h-[92vh] sm:h-[640px] bg-brand-navy border border-brand-purple/30 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-purple/20 bg-brand-navy/90 shrink-0">
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
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-brand-white/10 hover:bg-brand-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5 text-brand-white" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brand-purple/20 shrink-0">
              <button
                onClick={() => setTab('chat')}
                className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${tab === 'chat' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-brand-white/50 hover:text-brand-white/80'}`}
              >
                Concierge
              </button>
              <button
                onClick={() => setTab('pa')}
                className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${tab === 'pa' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-brand-white/50 hover:text-brand-white/80'}`}
              >
                SA Business Finder
              </button>
            </div>

            {/* Chat Tab */}
            {tab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-brand-purple" />
                        </div>
                      )}
                      <div className={`max-w-[78%] px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-brand-scarlet text-brand-white rounded-br-sm' : 'bg-brand-white/8 border border-brand-purple/15 text-brand-white/90 rounded-bl-sm'}`}>
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
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-4 py-3 border-t border-brand-purple/20 bg-brand-navy/80 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ask about our services…"
                      className="flex-1 bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-purple/50 transition-colors"
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="w-9 h-9 rounded-lg bg-brand-scarlet hover:bg-brand-scarlet/80 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
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
                      <p className="text-[11px] text-brand-white/50 leading-relaxed">Find South African prospect companies and get a drafted intro message for each.</p>
                    </div>
                    <input
                      type="password"
                      value={paPassInput}
                      onChange={e => setPaPassInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && paPassInput === PA_PASSPHRASE && setPaUnlocked(true)}
                      placeholder="Enter access code"
                      className="w-full bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-gold/50 transition-colors text-center"
                    />
                    <button
                      onClick={() => paPassInput === PA_PASSPHRASE && setPaUnlocked(true)}
                      className="w-full py-2 rounded-lg bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-xs font-semibold hover:bg-brand-gold/30 transition-colors"
                    >
                      Access Finder
                    </button>
                    {paPassInput && paPassInput !== PA_PASSPHRASE && (
                      <p className="text-[10px] text-brand-scarlet">Incorrect access code</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="px-4 pt-4 pb-3 shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={paInput}
                          onChange={e => setPaInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && findProspects()}
                          placeholder="e.g. student housing developer in Soweto"
                          className="flex-1 bg-brand-white/8 border border-brand-purple/20 rounded-lg px-3 py-2 text-xs text-brand-white placeholder-brand-white/30 focus:outline-none focus:border-brand-gold/50 transition-colors"
                          disabled={paLoading}
                        />
                        <button
                          onClick={findProspects}
                          disabled={paLoading || !paInput.trim()}
                          className="w-9 h-9 rounded-lg bg-brand-gold/20 border border-brand-gold/30 hover:bg-brand-gold/30 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
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
                      {!paLoading && prospects.length === 0 && paInput && (
                        <p className="text-[11px] text-brand-white/40 text-center py-8">No results yet. Run a search above.</p>
                      )}
                      {prospects.map((p, idx) => (
                        <div key={idx} className="bg-brand-white/5 border border-brand-purple/15 rounded-xl p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-brand-white">{p.name}</p>
                              <span className="inline-block text-[10px] text-brand-gold border border-brand-gold/30 rounded px-1.5 py-0.5 mt-0.5">{p.type}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-brand-white/60 leading-relaxed">{p.why}</p>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(p.searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-brand-purple/70 hover:text-brand-purple transition-colors"
                          >
                            <Search className="w-2.5 h-2.5" />
                            Find contact details
                            <ChevronRight className="w-2.5 h-2.5" />
                          </a>
                          <div>
                            <button
                              onClick={() => setExpandedDraft(expandedDraft === idx ? null : idx)}
                              className="text-[10px] text-brand-gold hover:text-brand-gold/80 font-semibold transition-colors flex items-center gap-1"
                            >
                              {expandedDraft === idx ? 'Hide draft' : 'View intro draft'}
                              <ChevronRight className={`w-2.5 h-2.5 transition-transform ${expandedDraft === idx ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedDraft === idx && (
                              <div className="mt-2 bg-brand-navy/60 border border-brand-white/10 rounded-lg p-2.5 relative">
                                <p className="text-[10px] text-brand-white/70 leading-relaxed whitespace-pre-wrap">{p.draftMessage}</p>
                                <button
                                  onClick={() => copyDraft(idx, p.draftMessage)}
                                  className="absolute top-2 right-2 w-6 h-6 rounded bg-brand-white/10 hover:bg-brand-white/20 flex items-center justify-center transition-colors"
                                  aria-label="Copy draft"
                                >
                                  {copied === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-brand-white/50" />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
