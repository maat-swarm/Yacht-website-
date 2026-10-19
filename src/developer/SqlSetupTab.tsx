import React, { useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Database, Copy, Check, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Key } from 'lucide-react';

interface SqlSetupTabProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SQL_SCHEMA = `-- ==============================================================================
-- Yacht Properties (Pty) Ltd - Database & Storage Initialization
-- File: supabase/yacht_console.sql
-- ==============================================================================

-- 1. Create updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE 1: gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Project Showcase',
  caption TEXT,
  album TEXT NOT NULL DEFAULT 'General',
  image_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_published_sort 
  ON gallery_items (published, sort_order);

CREATE INDEX IF NOT EXISTS idx_gallery_items_album 
  ON gallery_items (album);

DROP TRIGGER IF EXISTS trg_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER trg_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TABLE 2: site_content
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 3: leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  need TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Public Website',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 4: assistant_config
CREATE TABLE IF NOT EXISTS assistant_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  system_prompt TEXT NOT NULL,
  fact_sheet TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS & Grants
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view published gallery items"
  ON gallery_items FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "Authenticated users have full access to gallery items"
  ON gallery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can manage site content"
  ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to leads"
  ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to assistant config"
  ON assistant_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON gallery_items TO anon;
GRANT ALL ON gallery_items TO authenticated;
GRANT SELECT ON site_content TO anon;
GRANT ALL ON site_content TO authenticated;
GRANT ALL ON leads TO authenticated;
GRANT ALL ON assistant_config TO authenticated;

-- Storage Bucket for Gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can view gallery images"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can update gallery images"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
`;

export const SqlSetupTab: React.FC<SqlSetupTabProps> = ({ onNotify }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify('Complete SQL setup script copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-purple/20">
        <div>
          <h3 className="font-serif text-lg font-bold text-brand-white flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-gold" />
            <span>Database Setup & Storage Script</span>
          </h3>
          <p className="text-xs text-brand-white/60">
            Self-contained schema defining tables, RLS policies, automated triggers, and the public storage bucket.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied SQL Script!' : 'Copy Entire SQL Script'}</span>
        </button>
      </div>

      {/* Setup Steps Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#15152F] border border-brand-purple/20 rounded-xl p-4 space-y-2">
          <div className="w-7 h-7 rounded-full bg-brand-purple/30 text-brand-gold flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="text-xs font-bold text-brand-white uppercase tracking-wider">
            Run SQL in Supabase
          </h4>
          <p className="text-[11px] text-brand-white/65 leading-relaxed">
            Open your project dashboard &rarr; <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>.
          </p>
        </div>

        <div className="bg-[#15152F] border border-brand-purple/20 rounded-xl p-4 space-y-2">
          <div className="w-7 h-7 rounded-full bg-brand-purple/30 text-brand-gold flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="text-xs font-bold text-brand-white uppercase tracking-wider">
            Lock Down Signups
          </h4>
          <p className="text-[11px] text-brand-white/65 leading-relaxed">
            In <strong>Authentication &rarr; Providers &rarr; Email</strong>, disable public signups. Invite your authorized team in <strong>Users</strong>.
          </p>
        </div>

        <div className="bg-[#15152F] border border-brand-purple/20 rounded-xl p-4 space-y-2">
          <div className="w-7 h-7 rounded-full bg-brand-purple/30 text-brand-gold flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="text-xs font-bold text-brand-white uppercase tracking-wider">
            Connect Environment
          </h4>
          <p className="text-[11px] text-brand-white/65 leading-relaxed">
            Provide <code className="text-brand-gold">VITE_SUPABASE_URL</code> and <code className="text-brand-gold">VITE_SUPABASE_ANON_KEY</code> in environment settings.
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
        isSupabaseConfigured
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {isSupabaseConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isSupabaseConfigured
                ? 'Supabase Connection Active'
                : 'Supabase Environment Keys Pending'}
            </span>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isSupabaseConfigured
                ? 'Your client has valid URL and Anon Key configuration.'
                : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment to enable remote persistence.'}
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded bg-brand-white/10 hover:bg-brand-white/20 text-brand-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Supabase Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Code Viewer */}
      <div className="bg-[#0B0B18] border border-brand-purple/30 rounded-xl overflow-hidden">
        <div className="bg-[#121226] px-4 py-2 border-b border-brand-purple/20 flex items-center justify-between">
          <span className="text-[11px] font-mono text-brand-gold">
            supabase/yacht_console.sql
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] text-brand-white/70 hover:text-brand-gold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
        </div>
        <pre className="p-4 text-[11px] font-mono text-brand-white/75 overflow-x-auto max-h-96 leading-relaxed">
          {SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
