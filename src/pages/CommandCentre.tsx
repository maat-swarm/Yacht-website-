import React, { useState, useEffect, useRef } from 'react';
import { Camera, Trash2, RefreshCw, Lock, ExternalLink, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { AIAgentChat } from '../components/AIAgentChat';

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

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tenders State
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [tendersLoading, setTendersLoading] = useState<boolean>(false);

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
  // FETCH DATA BASED ON ACTIVE TAB
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
    if (!window.confirm('Delete this photo?')) return;

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

  useEffect(() => {
    if (!isAuthorized) return;
    if (activeTab === 'leads') loadLeads();
    if (activeTab === 'gallery') loadGallery();
    if (activeTab === 'tenders') loadTenders();
    if (activeTab === 'site') loadSiteConfig();
  }, [isAuthorized, activeTab]);

  // ==========================================
  // PASSWORD LOCK SCREEN
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-4 relative select-none">
        <div className="max-w-md w-full bg-brand-navy border border-brand-purple/40 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          {/* Top subtle highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />

          {/* Logo */}
          <div className="bg-brand-white px-5 py-3 rounded-xl inline-block shadow-md mb-6">
            <img src="/logo-wordmark.png" alt="Yacht Properties Logo" className="h-9 object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-brand-white tracking-tight mb-1">
            Command Centre
          </h1>
          <p className="text-sm text-brand-white/50 mb-8">
            Authorised access only
          </p>

          {/* Password Form */}
          <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Enter password"
              className="bg-brand-navy border border-brand-gold/40 text-brand-white rounded-xl px-4 py-3 text-center w-64 outline-none focus:border-brand-gold transition-colors"
              autoFocus
              autoComplete="current-password"
            />

            {passwordError && (
              <p className="text-brand-scarlet text-sm font-medium mt-2 animate-fade-in">
                Incorrect password
              </p>
            )}

            <button
              type="submit"
              className="bg-brand-scarlet text-brand-white px-8 py-3 rounded-xl font-semibold mt-3 cursor-pointer hover:bg-brand-scarlet/90 transition-colors"
            >
              Submit
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-brand-purple/20 w-full text-center">
            <a
              href="/"
              className="text-xs text-brand-white/40 hover:text-brand-gold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Site
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED COMMAND CENTRE DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-brand-navy text-brand-white flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-purple/20 bg-brand-navy/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="bg-brand-white px-3 py-1.5 rounded-lg inline-block shadow-sm">
              <img src="/logo-wordmark.png" alt="Yacht Properties" className="h-6 object-contain" />
            </a>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-purple/30 px-2.5 py-0.5 rounded border border-brand-gold/30">
                Command Centre
              </span>
              <span className="text-xs text-brand-white/40">Executive Suite</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-brand-white/60 hover:text-brand-gold border border-brand-purple/30 hover:border-brand-gold/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <button
              onClick={handleLock}
              className="text-xs text-brand-white/70 hover:text-brand-white bg-brand-purple/30 hover:bg-brand-purple/50 border border-brand-gold/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Lock and clear session"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* 5-Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-brand-purple/20">
          {(
            [
              { id: 'concierge', label: 'CONCIERGE' },
              { id: 'leads', label: 'LEADS' },
              { id: 'gallery', label: 'GALLERY' },
              { id: 'tenders', label: 'TENDERS' },
              { id: 'site', label: 'SITE' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-6 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-brand-gold border-brand-gold bg-brand-white/5'
                    : 'text-brand-white/40 hover:text-brand-white/70 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: CONCIERGE */}
        {activeTab === 'concierge' && (
          <div className="w-full h-full min-h-[640px]">
            <AIAgentChat
              isOpen={true}
              onClose={() => {}}
              defaultTab="pa"
              paUnlocked={true}
              fullWidth={true}
            />
          </div>
        )}

        {/* TAB 2: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-brand-purple/20">
              <h2 className="text-lg font-bold text-brand-white">Inbound Client Enquiries</h2>
              <button
                onClick={loadLeads}
                className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Leads</span>
              </button>
            </div>

            {leads.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-brand-navy border border-brand-purple/20">
                <p className="text-sm text-brand-white/40">
                  No enquiries yet. Leads from the contact form appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead) => {
                  const statusKey = lead.status?.toLowerCase() || 'new';
                  const badgeStyle =
                    statusKey === 'actioned'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : statusKey === 'reviewed'
                      ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                      : 'bg-brand-scarlet/20 text-brand-scarlet border border-brand-scarlet/30';

                  const badgeLabel =
                    statusKey === 'actioned' ? 'Actioned' : statusKey === 'reviewed' ? 'Reviewed' : 'New';

                  const formattedDate = lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '';

                  return (
                    <div
                      key={lead.id}
                      className="bg-brand-navy border border-brand-purple/20 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:border-brand-purple/40 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-brand-white leading-tight">
                            {lead.name || 'Anonymous Client'}
                          </h3>
                          <button
                            onClick={() => cycleLeadStatus(lead)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${badgeStyle}`}
                            title="Click to cycle status"
                          >
                            {badgeLabel}
                          </button>
                        </div>
                        <p className="text-xs text-brand-white/60">{lead.contact || 'No contact provided'}</p>
                        <span className="inline-block bg-brand-purple/20 text-brand-purple text-[10px] px-2 py-0.5 rounded font-semibold border border-brand-purple/30">
                          {lead.service || 'General Enquiry'}
                        </span>
                        <p className="text-xs text-brand-white/50 leading-relaxed">
                          {lead.message
                            ? lead.message.length > 80
                              ? lead.message.slice(0, 80) + '…'
                              : lead.message
                            : 'No message content.'}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-brand-purple/15 flex items-center justify-between text-[10px] text-brand-white/30">
                        <span>{formattedDate}</span>
                        <span className="italic">Tap badge to advance</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-brand-gold/40 rounded-2xl p-8 sm:p-12 text-center bg-brand-navy hover:bg-brand-white/5 transition-colors cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Camera className="w-10 h-10 text-brand-gold/50 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-brand-gold text-sm font-semibold">
                  <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                  <span>Uploading…</span>
                </div>
              ) : (
                <p className="text-sm text-brand-white/50 font-medium">
                  Tap to upload a photo
                </p>
              )}
            </div>

            {/* Public Gallery Photo Grid with Delete Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-white uppercase tracking-wider">
                  Live Public Folio ({galleryImages.length})
                </h3>
                <button
                  onClick={loadGallery}
                  className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${galleryLoading ? 'animate-spin' : ''}`} />
                  <span>Reload Photos</span>
                </button>
              </div>

              {galleryImages.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-brand-navy border border-brand-purple/20">
                  <p className="text-xs text-brand-white/40">No photos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-full h-[200px] rounded-xl overflow-hidden border border-brand-gold/20 relative group bg-brand-navy shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Delete Button (Bottom-Right, hover revealed) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(img.name);
                        }}
                        className="absolute bottom-2 right-2 bg-brand-scarlet/80 hover:bg-brand-scarlet text-brand-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TENDERS */}
        {activeTab === 'tenders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-brand-purple/20">
              <div>
                <h2 className="text-lg font-bold text-brand-white">
                  CIDB Grade 1 GB Tender Intelligence
                </h2>
                <p className="text-xs text-brand-white/50">
                  Government & institutional contracting opportunities matched for Yacht Properties
                </p>
              </div>
              <button
                onClick={() => loadTenders(true)}
                className="text-xs text-brand-gold hover:text-brand-gold/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/30 hover:bg-brand-gold/10 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${tendersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Tenders</span>
              </button>
            </div>

            {tendersLoading ? (
              <div className="p-16 text-center rounded-2xl bg-brand-navy border border-brand-purple/20 space-y-3">
                <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-brand-white/60 font-medium">Scanning tender landscape…</p>
              </div>
            ) : tenders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-brand-navy border border-brand-purple/20">
                <p className="text-xs text-brand-white/40">No tender signals available right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenders.map((tender, idx) => {
                  const closingDateMs = new Date(tender.closingDate).getTime();
                  const isUrgent = closingDateMs - Date.now() <= 14 * 24 * 60 * 60 * 1000;
                  const dateClass = isUrgent ? 'text-brand-scarlet font-semibold' : 'text-green-400 font-semibold';

                  return (
                    <div
                      key={idx}
                      className="bg-brand-navy border border-brand-purple/20 rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-sm hover:border-brand-purple/40 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold text-brand-white leading-tight">
                            {tender.title}
                          </h3>
                          <span className="bg-brand-purple/20 text-brand-purple text-[10px] px-2 py-0.5 rounded shrink-0 font-semibold border border-brand-purple/30">
                            {tender.category || 'GB'}
                          </span>
                        </div>
                        <p className="text-xs text-brand-gold font-medium">{tender.authority}</p>
                        <p className="font-mono text-brand-white/40 text-[10px]">
                          Ref: {tender.refNumber}
                        </p>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-brand-white/70">Value: {tender.value}</span>
                          <span className={`text-xs ${dateClass}`}>Closes: {tender.closingDate}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-purple/15 flex justify-end">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            tender.refNumber + ' ' + tender.authority + ' tender South Africa'
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-gold/80 px-3 py-1.5 border border-brand-gold/40 hover:bg-brand-gold/10 rounded-lg transition-colors"
                        >
                          <span>Find Tender</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 text-center">
              <p className="text-brand-white/30 text-[10px]">
                Verify all tenders on etenders.gov.za and cidb.org.za before submission.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: SITE */}
        {activeTab === 'site' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="pb-3 border-b border-brand-purple/20">
              <h2 className="text-lg font-bold text-brand-white">Live Site Content Controls</h2>
              <p className="text-xs text-brand-white/50">
                Direct updates reflected across all official website headers, banners, and contacts.
              </p>
            </div>

            {/* Field 1: Phone */}
            <div className="bg-brand-navy border border-brand-purple/20 rounded-xl p-5 space-y-3">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Contact Phone
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold"
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
                    'Save'
                  )}
                </button>
              </div>
            </div>

            {/* Field 2: Email */}
            <div className="bg-brand-navy border border-brand-purple/20 rounded-xl p-5 space-y-3">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Contact Email
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold"
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
                    'Save'
                  )}
                </button>
              </div>
            </div>

            {/* Field 3: Tagline */}
            <div className="bg-brand-navy border border-brand-purple/20 rounded-xl p-5 space-y-3">
              <label className="block text-brand-white/60 text-xs uppercase tracking-wider font-semibold">
                Hero Tagline
              </label>
              <div className="space-y-3">
                <textarea
                  value={tagline}
                  rows={3}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-brand-white/5 border border-brand-purple/30 rounded-lg px-3 py-2 text-sm text-brand-white focus:outline-none focus:border-brand-gold resize-none"
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
                      'Save'
                    )}
                  </button>
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
