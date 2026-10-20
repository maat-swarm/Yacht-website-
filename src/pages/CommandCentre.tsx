import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Trash2,
  RefreshCw,
  Lock,
  ExternalLink,
  Check,
  AlertCircle,
  ArrowLeft,
  Bot,
  Users,
  FileText,
  Settings,
  Phone,
  Mail,
  Sparkles,
  Compass,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Building2,
  Clock,
  Layers,
  Send,
} from 'lucide-react';
import { AIAgentChat } from '../components/AIAgentChat';
import { LivingBackground } from '../components/LivingBackground';
import { GoldRule } from '../components/GoldRule';

interface LeadItem {
  id: string;
  name: string;
  contact: string;
  service: string;
  message: string;
  created_at: string;
  status: 'new' | 'reviewed' | 'actioned' | string;
}

interface TenderItem {
  title: string;
  authority: string;
  closingDate: string;
  value: string;
  category: string;
  refNumber: string;
}

interface GalleryImage {
  name: string;
  url: string;
}

export const CommandCentre: React.FC = () => {
  // Authentication State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'concierge' | 'leads' | 'gallery' | 'tenders' | 'site'>('concierge');

  // Leads State
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'actioned'>('all');

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tenders State
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [tendersLoading, setTendersLoading] = useState<boolean>(false);
  const [tenderCategoryFilter, setTenderCategoryFilter] = useState<string>('all');

  // Site Config State
  const [phone, setPhone] = useState<string>('063 759 0216');
  const [email, setEmail] = useState<string>('sam@yachtmaripane.co.za');
  const [tagline, setTagline] = useState<string>('We Are You — Property investment, construction, and facilities stewardship across South Africa.');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Check existing session authorization on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('yacht_cmd');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ok && parsed.exp && parsed.exp > Date.now()) {
          setIsAuthorized(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === 'Yacht2024') {
      sessionStorage.setItem(
        'yacht_cmd',
        JSON.stringify({ ok: true, exp: Date.now() + 28800000 })
      );
      setIsAuthorized(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('yacht_cmd');
    window.location.reload();
  };

  // ==========================================
  // FETCH DATA
  // ==========================================

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data?.leads) ? data.leads : []);
      }
    } catch (err) {
      console.warn('Error loading leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const cycleLeadStatus = async (lead: LeadItem) => {
    const nextStatus =
      lead.status.toLowerCase() === 'new'
        ? 'reviewed'
        : lead.status.toLowerCase() === 'reviewed'
        ? 'actioned'
        : 'new';

    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: nextStatus } : l))
    );

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        setLeads(previousLeads);
      }
    } catch {
      setLeads(previousLeads);
    }
  };

  const loadGallery = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(Array.isArray(data?.images) ? data.images : []);
      }
    } catch (err) {
      console.warn('Error loading gallery:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.success) {
        await loadGallery();
      } else {
        alert(data?.error || 'Failed to upload photo');
      }
    } catch (err: any) {
      alert(err?.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (filename: string) => {
    if (!window.confirm(`Delete "${filename}" from project folio?`)) return;

    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        setGalleryImages((prev) => prev.filter((img) => img.name !== filename));
      } else {
        alert(data?.error || 'Failed to delete photo');
      }
    } catch (err: any) {
      alert(err?.message || 'Delete error');
    }
  };

  const loadTenders = async (refresh = false) => {
    setTendersLoading(true);
    try {
      const res = await fetch(`/api/tenders${refresh ? '?refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setTenders(Array.isArray(data?.tenders) ? data.tenders : []);
      }
    } catch (err) {
      console.warn('Error loading tenders:', err);
    } finally {
      setTendersLoading(false);
    }
  };

  const loadSiteConfig = async () => {
    try {
      const [pRes, eRes, tRes] = await Promise.all([
        fetch('/api/content?key=phone'),
        fetch('/api/content?key=email'),
        fetch('/api/content?key=tagline'),
      ]);
      const [pData, eData, tData] = await Promise.all([pRes.json(), eRes.json(), tRes.json()]);
      if (pData?.value) setPhone(pData.value);
      if (eData?.value) setEmail(eData.value);
      if (tData?.value) setTagline(tData.value);
    } catch (err) {
      console.warn('Error loading site config:', err);
    }
  };

  const saveSiteConfig = async (key: 'phone' | 'email' | 'tagline', value: string) => {
    setSavingField(key);
    try {
      const res = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSavedField(key);
        setTimeout(() => setSavedField(null), 2500);
      }
    } catch (err) {
      console.error('Error saving site config:', err);
    } finally {
      setSavingField(null);
    }
  };

  // Load active tab data on demand
  useEffect(() => {
    if (!isAuthorized) return;
    loadLeads();
    loadGallery();
    loadTenders();
    loadSiteConfig();
  }, [isAuthorized]);

  // Lead filtering logic
  const filteredLeads = leads.filter((lead) => {
    const statusMatch =
      leadStatusFilter === 'all' ||
      lead.status?.toLowerCase() === leadStatusFilter;
    const query = leadSearchQuery.toLowerCase();
    const searchMatch =
      !query ||
      lead.name?.toLowerCase().includes(query) ||
      lead.contact?.toLowerCase().includes(query) ||
      lead.service?.toLowerCase().includes(query) ||
      lead.message?.toLowerCase().includes(query);
    return statusMatch && searchMatch;
  });

  // Tender filtering logic
  const filteredTenders = tenders.filter((t) => {
    if (tenderCategoryFilter === 'all') return true;
    return (t.category || '').toLowerCase().includes(tenderCategoryFilter.toLowerCase());
  });

  // Calculate high-level stats
  const newLeadsCount = leads.filter((l) => (l.status || 'new').toLowerCase() === 'new').length;
  const urgentTendersCount = tenders.filter((t) => {
    const diff = new Date(t.closingDate).getTime() - Date.now();
    return diff > 0 && diff <= 14 * 24 * 60 * 60 * 1000;
  }).length;

  // ==========================================
  // PASSWORD LOCK SCREEN (EXECUTIVE EMBLEM)
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Living atmospheric background with floating gold dust particles */}
        <LivingBackground />

        {/* Central Luxury Auth Dossier */}
        <div className="max-w-md w-full bg-brand-navy/95 backdrop-blur-xl border border-brand-gold/30 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl relative z-10 overflow-hidden">
          {/* Top Gold Gradient Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />

          {/* Halo-glow Hero Emblem */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-white p-2.5 shadow-lg border border-brand-gold/40 flex items-center justify-center hero-halo-glow mx-auto">
              <img
                src="/logo-emblem.png"
                alt="Yacht Properties Crest"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          {/* Wordmark */}
          <img
            src="/logo-wordmark.png"
            alt="Yacht Properties"
            className="h-7 w-auto object-contain mx-auto mb-2"
          />

          <span className="font-serif italic text-brand-gold text-sm tracking-wide mb-1">
            &ldquo;We are You&rdquo;
          </span>

          <div className="w-32 mx-auto my-2">
            <GoldRule withCenterAccent />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl font-bold text-brand-white tracking-tight mb-1">
            Executive Command Centre
          </h1>
          <p className="text-xs text-brand-white/60 mb-6">
            Falcon Haven Executive Desk · Authorised Access Only
          </p>

          {/* Compliance Tagline */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-brand-gold/90 bg-brand-purple/20 px-3 py-1 rounded-full border border-brand-gold/25 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>CIDB 10316208 (Grade 1 GB) · NHBRC · PPRA</span>
          </div>

          {/* Password Form with Required Specific Styling */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Enter password"
              className="bg-brand-navy border border-brand-gold/40 text-brand-white rounded-xl px-4 py-3 text-center w-64 outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-all placeholder:text-brand-white/30 text-sm font-medium"
              autoFocus
              autoComplete="current-password"
            />

            {passwordError && (
              <p className="text-brand-scarlet text-sm font-medium mt-2 animate-fade-in flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Incorrect password
              </p>
            )}

            <button
              type="submit"
              className="bg-brand-scarlet text-brand-white px-8 py-3 rounded-xl font-semibold mt-3 cursor-pointer hover:bg-brand-scarlet/90 transition-all shadow-md active:scale-95"
            >
              Submit
            </button>
          </form>

          {/* Return link */}
          <div className="mt-8 pt-6 border-t border-brand-purple/20 w-full text-center">
            <a
              href="/"
              className="text-xs text-brand-white/50 hover:text-brand-gold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Site
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED EXECUTIVE COMMAND CENTRE SUITE
  // ==========================================
  return (
    <div className="min-h-screen bg-brand-navy text-brand-white flex flex-col relative select-none">
      {/* Living background */}
      <LivingBackground />

      {/* Top Corporate Strip (mirrors public site) */}
      <div className="bg-brand-navy border-b border-brand-gold/20 text-brand-white text-xs py-1.5 px-4 hidden sm:block relative z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wider uppercase text-[10px]">
          <span className="text-brand-gold font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-brand-gold" />
            <span>Executive Operations Desk · Falcon Haven, Terenure</span>
          </span>
          <div className="flex items-center gap-5 text-brand-white/70">
            <span>Direct: 063 759 0216</span>
            <span className="text-brand-gold/40">|</span>
            <span>sam@yachtmaripane.co.za</span>
            <span className="text-brand-gold/40">|</span>
            <span className="text-brand-gold">We are You</span>
          </div>
        </div>
      </div>

      {/* Main Command Header */}
      <header className="border-b border-brand-purple/20 bg-brand-navy/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="bg-brand-white px-3 py-1.5 rounded-lg inline-block shadow-sm border border-brand-gold/30 hover:border-brand-gold transition-colors"
              title="Return to Public Website"
            >
              <img
                src="/logo-wordmark.png"
                alt="Yacht Properties"
                className="h-6 w-auto object-contain"
              />
            </a>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-brand-white">
                  Executive Suite
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-purple/30 px-2 py-0.5 rounded border border-brand-gold/30">
                  Director's Desk
                </span>
              </div>
              <span className="text-[11px] text-brand-white/50">
                Sam Maripane · CIDB 10316208 (Grade 1 GB)
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-brand-white/70 hover:text-brand-gold border border-brand-purple/30 hover:border-brand-gold/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Site</span>
            </a>
            <button
              onClick={handleLock}
              className="text-xs text-brand-white/80 hover:text-brand-white bg-brand-purple/30 hover:bg-brand-purple/50 border border-brand-gold/30 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Lock session"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* 5-Tab Bar with Gold Accents */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-brand-purple/20">
          {(
            [
              { id: 'concierge', label: 'CONCIERGE & PA', icon: Bot },
              { id: 'leads', label: `LEADS (${leads.length})`, icon: Users },
              { id: 'gallery', label: `FOLIO (${galleryImages.length})`, icon: Camera },
              { id: 'tenders', label: `TENDERS (${tenders.length})`, icon: FileText },
              { id: 'site', label: 'SITE CONTROLS', icon: Settings },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-5 text-[11px] font-semibold tracking-wider whitespace-nowrap transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'text-brand-gold border-brand-gold bg-brand-white/5 font-bold shadow-xs'
                    : 'text-brand-white/50 hover:text-brand-white/80 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-gold' : 'text-brand-white/40'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rotate-45 bg-brand-gold inline-block ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Command Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Executive KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1 */}
          <div className="bg-brand-navy/90 border border-brand-gold/20 rounded-xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-brand-white/60 text-xs mb-1">
              <span>Inbound Briefs</span>
              <Users className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="text-2xl font-serif font-bold text-brand-white tabular-nums">
              {leads.length}
            </div>
            <div className="text-[10px] text-brand-gold mt-1 flex items-center gap-1">
              <span>{newLeadsCount} awaiting review</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-brand-navy/90 border border-brand-gold/20 rounded-xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-brand-white/60 text-xs mb-1">
              <span>Tender Radar</span>
              <Building2 className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="text-2xl font-serif font-bold text-brand-white tabular-nums">
              {tenders.length}
            </div>
            <div className="text-[10px] text-brand-scarlet mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              <span>{urgentTendersCount} closing within 14 days</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-brand-navy/90 border border-brand-gold/20 rounded-xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-brand-white/60 text-xs mb-1">
              <span>Public Folio</span>
              <Camera className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="text-2xl font-serif font-bold text-brand-white tabular-nums">
              {galleryImages.length}
            </div>
            <div className="text-[10px] text-brand-white/50 mt-1">
              Live photographs on public site
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-brand-navy/90 border border-brand-gold/20 rounded-xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between text-brand-white/60 text-xs mb-1">
              <span>Compliance Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-brand-gold mt-1">
              CIDB Grade 1 GB
            </div>
            <div className="text-[10px] text-brand-white/50 mt-1">
              NHBRC & PPRA Verified
            </div>
          </div>
        </div>

        {/* ==========================================
            TAB 1: CONCIERGE & PA INTELLIGENCE
            ========================================== */}
        {activeTab === 'concierge' && (
          <div className="space-y-4">
            <div className="bg-brand-navy/80 border border-brand-gold/20 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-purple/20">
                <div>
                  <h2 className="font-serif text-xl font-bold text-brand-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-brand-gold" />
                    <span>Yacht Concierge & Executive PA Terminal</span>
                  </h2>
                  <p className="text-xs text-brand-white/60 mt-0.5">
                    Private conversational AI grounding on Yacht Properties credentials, live visits, and South African market intelligence.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-gold border border-brand-gold/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Gemini 2.5 & Sonar Grounded</span>
                  </span>
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="w-full mt-4 min-h-[580px] bg-brand-navy border border-brand-purple/30 rounded-xl overflow-hidden shadow-inner">
                <AIAgentChat
                  isOpen={true}
                  onClose={() => {}}
                  defaultTab="pa"
                  paUnlocked={true}
                  fullWidth={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: INBOUND CLIENT LEADS
            ========================================== */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Header with Search and Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-purple/20">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-gold" />
                  <span>Inbound Client Enquiries & Project Dossiers</span>
                </h2>
                <p className="text-xs text-brand-white/60">
                  Prospective briefs submitted via the public website quote & triage intake form.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadLeads}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/30 hover:bg-brand-gold/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-brand-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={leadSearchQuery}
                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                  placeholder="Search by client name, service, or message contents..."
                  className="w-full bg-brand-white/5 border border-brand-purple/30 rounded-xl pl-10 pr-4 py-2 text-xs text-brand-white focus:outline-none focus:border-brand-gold placeholder:text-brand-white/30"
                />
              </div>

              {/* Status Segmented Control */}
              <div className="flex items-center gap-1 bg-brand-white/5 p-1 rounded-xl border border-brand-purple/30">
                {(['all', 'new', 'reviewed', 'actioned'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      leadStatusFilter === st
                        ? 'bg-brand-purple text-brand-gold shadow-xs'
                        : 'text-brand-white/50 hover:text-brand-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Card Grid */}
            {filteredLeads.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-brand-navy border border-brand-purple/20 backdrop-blur-md">
                <Users className="w-10 h-10 text-brand-gold/40 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-brand-white mb-1">
                  No enquiries matching criteria
                </h3>
                <p className="text-xs text-brand-white/50 max-w-md mx-auto">
                  Client submissions from the website contact and project triage form will be registered here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => {
                  const statusKey = lead.status?.toLowerCase() || 'new';
                  const badgeStyle =
                    statusKey === 'actioned'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : statusKey === 'reviewed'
                      ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40'
                      : 'bg-brand-scarlet/20 text-brand-scarlet border border-brand-scarlet/40';

                  const badgeLabel =
                    statusKey === 'actioned' ? 'Actioned' : statusKey === 'reviewed' ? 'Reviewed' : 'New Brief';

                  const formattedDate = lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent';

                  const initials = (lead.name || 'Anonymous')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={lead.id}
                      className="bg-brand-navy/90 border border-brand-purple/25 hover:border-brand-gold/40 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all backdrop-blur-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-purple/40 border border-brand-gold/40 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-serif text-base font-bold text-brand-white leading-tight">
                                {lead.name || 'Anonymous Client'}
                              </h3>
                              <span className="text-[11px] text-brand-gold/80 block mt-0.5">
                                {lead.service || 'General Building'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => cycleLeadStatus(lead)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition-colors shrink-0 ${badgeStyle}`}
                            title="Click to cycle status: New -> Reviewed -> Actioned"
                          >
                            {badgeLabel}
                          </button>
                        </div>

                        {/* Contact Shortcuts */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-brand-white/70">
                          {lead.contact && (
                            <span className="bg-brand-white/5 px-2.5 py-1 rounded-md border border-brand-purple/20 flex items-center gap-1.5 font-mono text-[11px]">
                              {lead.contact.includes('@') ? (
                                <Mail className="w-3 h-3 text-brand-gold" />
                              ) : (
                                <Phone className="w-3 h-3 text-brand-gold" />
                              )}
                              <span>{lead.contact}</span>
                            </span>
                          )}
                        </div>

                        {/* Brief Text */}
                        <div className="bg-brand-navy/80 p-3 rounded-lg border border-brand-purple/20 text-xs text-brand-white/70 leading-relaxed font-sans italic">
                          &ldquo;{lead.message || 'No project description provided.'}&rdquo;
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-brand-purple/15 flex items-center justify-between text-[11px] text-brand-white/40">
                        <span className="tabular-nums font-mono">{formattedDate}</span>
                        <div className="flex items-center gap-3">
                          {lead.contact && lead.contact.includes('@') && (
                            <a
                              href={`mailto:${lead.contact}?subject=Yacht Properties: Project Enquiry Follow-up`}
                              className="text-brand-gold hover:text-brand-gold/80 font-medium"
                            >
                              Email Client
                            </a>
                          )}
                          {lead.contact && !lead.contact.includes('@') && (
                            <a
                              href={`tel:${lead.contact}`}
                              className="text-brand-gold hover:text-brand-gold/80 font-medium"
                            >
                              Call Client
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: PROJECT FOLIO & GALLERY
            ========================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-purple/20">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-gold" />
                  <span>Public Portfolio & Construction Folio</span>
                </h2>
                <p className="text-xs text-brand-white/60">
                  Manage certified site photography displayed publicly in the Featured Works folio.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/#gallery"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-white/60 hover:text-brand-gold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Public Gallery</span>
                </a>
                <button
                  onClick={loadGallery}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/30 hover:bg-brand-gold/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${galleryLoading ? 'animate-spin' : ''}`} />
                  <span>Reload Photos</span>
                </button>
              </div>
            </div>

            {/* Architectural Blueprint Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-brand-gold/40 rounded-2xl p-8 sm:p-12 text-center bg-brand-navy/80 hover:bg-brand-white/5 transition-all cursor-pointer group backdrop-blur-md relative overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-brand-purple/30 border border-brand-gold/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8 text-brand-gold" />
              </div>
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-brand-gold text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                  <span>Uploading project photography to Supabase bucket...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-brand-white font-medium">
                    Click or tap to upload project photography
                  </p>
                  <p className="text-xs text-brand-white/40">
                    Supports high-resolution JPG, PNG or WEBP (up to 15MB)
                  </p>
                </div>
              )}
            </div>

            {/* Photo Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                  Live Public Photos ({galleryImages.length})
                </h3>
              </div>

              {galleryImages.length === 0 ? (
                <div className="p-12 text-center rounded-xl bg-brand-navy border border-brand-purple/20">
                  <p className="text-xs text-brand-white/40">
                    No project photography currently uploaded. Public site displays architectural placeholders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-full h-56 rounded-xl overflow-hidden border border-brand-gold/25 relative group bg-brand-navy shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-brand-gold bg-brand-navy/80 px-2 py-0.5 rounded-sm self-start">
                          Live Folio
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-brand-white truncate max-w-[160px]">
                            {img.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(img.name);
                            }}
                            className="bg-brand-scarlet text-brand-white p-2 rounded-lg hover:bg-brand-scarlet/90 transition-colors shadow-md cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: CIDB GRADE 1 GB TENDER RADAR
            ========================================== */}
        {activeTab === 'tenders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-purple/20">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-gold" />
                  <span>CIDB Grade 1 GB Tender Intelligence Radar</span>
                </h2>
                <p className="text-xs text-brand-white/60">
                  Government & institutional opportunities tailored for Yacht Properties in Gauteng.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadTenders(true)}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/30 hover:bg-brand-gold/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tendersLoading ? 'animate-spin' : ''}`} />
                  <span>Rescan Tenders</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'all', label: 'All Opportunities' },
                { id: 'General Building', label: 'General Building (GB)' },
                { id: 'Civil', label: 'Civil & Building Works' },
                { id: 'Housing', label: 'Student & Social Housing' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTenderCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    tenderCategoryFilter === c.id
                      ? 'bg-brand-purple text-brand-gold border border-brand-gold/40 shadow-xs'
                      : 'bg-brand-white/5 text-brand-white/60 hover:text-brand-white border border-brand-purple/20'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Tender Card Grid */}
            {tendersLoading ? (
              <div className="p-16 text-center rounded-2xl bg-brand-navy border border-brand-purple/20 space-y-3">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-brand-white/60 font-medium">
                  Scanning eTenders portal and CIDB opportunities…
                </p>
              </div>
            ) : filteredTenders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-brand-navy border border-brand-purple/20">
                <p className="text-xs text-brand-white/40">
                  No active notices matching this category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTenders.map((tender, idx) => {
                  const closingDateMs = new Date(tender.closingDate).getTime();
                  const isUrgent = closingDateMs - Date.now() <= 14 * 24 * 60 * 60 * 1000;
                  const dateClass = isUrgent
                    ? 'text-brand-scarlet font-semibold bg-brand-scarlet/15 px-2 py-0.5 rounded'
                    : 'text-emerald-400 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded';

                  return (
                    <div
                      key={idx}
                      className="bg-brand-navy/90 border border-brand-purple/25 hover:border-brand-gold/40 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all backdrop-blur-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-base font-bold text-brand-white leading-snug">
                            {tender.title}
                          </h3>
                          <span className="bg-brand-purple/20 text-brand-gold text-[10px] px-2.5 py-0.5 rounded-full shrink-0 font-semibold border border-brand-gold/30">
                            {tender.category || 'GB'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-brand-gold font-medium">
                            {tender.authority}
                          </p>
                          <p className="font-mono text-brand-white/40 text-[10px] tabular-nums">
                            Ref: {tender.refNumber}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-brand-purple/15">
                          <div className="text-brand-white/80">
                            <span className="text-[10px] text-brand-white/40 block">ESTIMATED VALUE</span>
                            <span className="font-serif font-bold text-brand-gold tabular-nums text-sm">
                              {tender.value}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-brand-white/40 block mb-0.5">CLOSING DATE</span>
                            <span className={`text-[11px] tabular-nums ${dateClass}`}>
                              {tender.closingDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-purple/15 flex items-center justify-between">
                        <span className="text-[10px] text-brand-white/40 italic">
                          CIDB Grade 1 GB Target
                        </span>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            tender.refNumber + ' ' + tender.authority + ' tender South Africa'
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-gold/80 px-3 py-1.5 border border-brand-gold/40 hover:bg-brand-gold/10 rounded-lg transition-colors font-medium"
                        >
                          <span>Find Tender Docs</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 5: LIVE SITE CONTENT CONTROLS
            ========================================== */}
        {activeTab === 'site' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="pb-3 border-b border-brand-purple/20">
              <h2 className="font-serif text-xl font-bold text-brand-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-gold" />
                <span>Live Site Content & Branding Controls</span>
              </h2>
              <p className="text-xs text-brand-white/60">
                Directly configure official public contact information and hero summary text across the website.
              </p>
            </div>

            {/* Field 1: Phone */}
            <div className="bg-brand-navy/90 border border-brand-purple/25 rounded-xl p-5 space-y-3 backdrop-blur-md">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Official Contact Phone Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="063 759 0216"
                />
                <button
                  onClick={() => saveSiteConfig('phone', phone)}
                  disabled={savingField === 'phone'}
                  className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/30 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savedField === 'phone' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved
                    </>
                  ) : savingField === 'phone' ? (
                    'Saving…'
                  ) : (
                    'Update Phone'
                  )}
                </button>
              </div>
            </div>

            {/* Field 2: Email */}
            <div className="bg-brand-navy/90 border border-brand-purple/25 rounded-xl p-5 space-y-3 backdrop-blur-md">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Official Executive Email Address
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="sam@yachtmaripane.co.za"
                />
                <button
                  onClick={() => saveSiteConfig('email', email)}
                  disabled={savingField === 'email'}
                  className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/30 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savedField === 'email' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved
                    </>
                  ) : savingField === 'email' ? (
                    'Saving…'
                  ) : (
                    'Update Email'
                  )}
                </button>
              </div>
            </div>

            {/* Field 3: Tagline */}
            <div className="bg-brand-navy/90 border border-brand-purple/25 rounded-xl p-5 space-y-3 backdrop-blur-md">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Hero Tagline & Corporate Mission Statement
              </label>
              <div className="space-y-3">
                <textarea
                  value={tagline}
                  rows={3}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold resize-none leading-relaxed font-sans"
                  placeholder="Enter corporate tagline..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => saveSiteConfig('tagline', tagline)}
                    disabled={savingField === 'tagline'}
                    className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/30 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savedField === 'tagline' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved
                      </>
                    ) : savingField === 'tagline' ? (
                      'Saving…'
                    ) : (
                      'Update Tagline'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-Time Live Preview Box */}
            <div className="bg-brand-offwhite text-brand-text rounded-xl p-5 border border-brand-gold/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-brand-purple/10">
                <span className="text-[11px] uppercase tracking-wider font-bold text-brand-purple flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Public Website Live Preview</span>
                </span>
                <span className="text-[10px] text-brand-text/50">Simulated rendering</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-brand-text/70">
                  <span className="font-semibold text-brand-navy">Header Strip:</span> South African Property & Construction | {phone} | sam@yachtmaripane.co.za
                </p>
                <div className="p-3 bg-brand-white rounded-lg border border-brand-purple/10">
                  <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block mb-1">
                    Hero Summary Box
                  </span>
                  <p className="font-serif text-sm text-brand-purple font-medium italic">
                    &ldquo;{tagline}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommandCentre;
