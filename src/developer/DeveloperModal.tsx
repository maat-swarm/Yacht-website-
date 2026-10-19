import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { GalleryManagerTab } from './GalleryManagerTab';
import { LeadsTab } from './LeadsTab';
import { ContentTab } from './ContentTab';
import { AssistantTab } from './AssistantTab';
import { SqlSetupTab } from './SqlSetupTab';
import {
  X,
  Lock,
  Layers,
  Users,
  FileEdit,
  Bot,
  Database,
  LogOut,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'leads' | 'content' | 'assistant' | 'sql'>('gallery');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check auth state on mount
  useEffect(() => {
    if (!isOpen) return;

    if (!isSupabaseConfigured || !supabase) {
      // In unconfigured / preview mode, allow developer preview
      setAuthLoading(false);
      setIsAuthenticated(true);
      return;
    }

    async function checkUser() {
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          setUserEmail(user.email || null);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setIsAuthenticated(true);
      addToast('Entered Developer Console in offline preview mode.', 'info');
      return;
    }

    setLoginSubmitting(true);
    setLoginError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      if (data.user) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email || null);
        addToast(`Authenticated as ${data.user.email}`, 'success');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    addToast('Signed out of Developer Console.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-brand-navy/85 backdrop-blur-md">
      <motion.div
        className="relative w-full max-w-6xl h-[92vh] flex flex-col bg-[#0F0F23] text-brand-white rounded-2xl shadow-2xl border border-brand-purple/30 overflow-hidden"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Header Bar */}
        <div className="bg-[#15152F] px-4 sm:px-6 py-3.5 border-b border-brand-purple/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-white px-2.5 py-1 rounded-md">
              <img
                src="/logo-wordmark.png"
                alt="Yacht Properties"
                className="h-5 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-brand-white">
                  Developer Operations Console
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-purple text-brand-gold border border-brand-gold/30">
                  Restricted
                </span>
              </div>
              <span className="text-[11px] text-brand-white/50">
                {isSupabaseConfigured
                  ? 'Connected to Supabase Project'
                  : 'Local Demo Environment (Supabase credentials pending)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && userEmail && (
              <span className="text-xs text-brand-gold font-mono hidden sm:inline">
                {userEmail}
              </span>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-brand-white/70 hover:text-brand-white hover:bg-brand-white/10 transition-colors cursor-pointer"
              aria-label="Close Developer Console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {authLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xs text-brand-gold animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Verifying authorization...</span>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* Login Dialog */
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-[#0F0F23] to-[#0A0A17]">
            <div className="w-full max-w-md bg-[#161633] p-8 rounded-2xl border border-brand-purple/30 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-brand-purple/20 text-brand-gold border border-brand-gold/30 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-white">
                  Developer Authentication
                </h3>
                <p className="text-xs text-brand-white/60 leading-relaxed">
                  Enter your administrative credentials to manage project photography, incoming enquiries, live site content, and AI knowledge.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-brand-scarlet/20 border border-brand-scarlet/40 text-brand-scarlet text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-white/70 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="developer@yachtmaripane.co.za"
                    className="w-full bg-[#0E0E20] border border-brand-purple/30 rounded-lg px-3 py-2 text-xs text-brand-white focus:border-brand-gold outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-white/70 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0E0E20] border border-brand-purple/30 rounded-lg px-3 py-2 text-xs text-brand-white focus:border-brand-gold outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-brand-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loginSubmitting ? 'Authenticating...' : 'Sign In to Console'}
                </button>
              </form>

              <div className="pt-2 border-t border-brand-purple/20 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(true);
                    addToast('Entered developer console preview mode.', 'info');
                  }}
                  className="text-xs text-brand-gold/80 hover:text-brand-gold underline transition-colors cursor-pointer"
                >
                  Bypass with Developer Demo Mode &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Authenticated Console */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-[#13132B] border-b md:border-b-0 md:border-r border-brand-purple/20 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-brand-purple text-brand-white shadow-xs'
                    : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
                }`}
              >
                <Layers className="w-4 h-4 text-brand-gold" />
                <span>Gallery Manager</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-brand-purple text-brand-white shadow-xs'
                    : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-brand-gold" />
                <span>Enquiry Leads</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-brand-purple text-brand-white shadow-xs'
                    : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
                }`}
              >
                <FileEdit className="w-4 h-4 text-brand-gold" />
                <span>Site Content</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap cursor-pointer ${
                  activeTab === 'assistant'
                    ? 'bg-brand-purple text-brand-white shadow-xs'
                    : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
                }`}
              >
                <Bot className="w-4 h-4 text-brand-gold" />
                <span>AI Assistant Config</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sql')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap cursor-pointer ${
                  activeTab === 'sql'
                    ? 'bg-brand-purple text-brand-white shadow-xs'
                    : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
                }`}
              >
                <Database className="w-4 h-4 text-brand-gold" />
                <span>Database & SQL</span>
              </button>
            </div>

            {/* Main Panel */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {activeTab === 'gallery' && <GalleryManagerTab onNotify={addToast} />}
              {activeTab === 'leads' && <LeadsTab onNotify={addToast} />}
              {activeTab === 'content' && <ContentTab onNotify={addToast} />}
              {activeTab === 'assistant' && <AssistantTab onNotify={addToast} />}
              {activeTab === 'sql' && <SqlSetupTab onNotify={addToast} />}
            </div>
          </div>
        )}

        {/* Floating Toasts */}
        <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 pointer-events-auto border ${
                  toast.type === 'success'
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
                    : toast.type === 'error'
                    ? 'bg-rose-950 text-rose-200 border-rose-500/40'
                    : 'bg-[#1C1C3D] text-brand-white border-brand-purple/40'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-brand-gold" />}
                <span>{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
