import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DOCS = [
  { key: 'cidb', label: 'CIDB Certificate' },
  { key: 'nhbrc', label: 'NHBRC Certificate' },
  { key: 'ppra', label: 'PPRA Certificate' },
];

export const DocumentsTab: React.FC<{ onNotify: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ onNotify }) => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('documents').select('key,file_url');
    const m: Record<string, string> = {};
    (data || []).forEach((r: any) => { if (r.file_url) m[r.key] = r.file_url; });
    setUrls(m);
  };
  useEffect(() => { load(); }, []);

  const upload = async (key: string, file: File | undefined) => {
    if (!supabase || !file) return;
    if (file.type !== 'application/pdf') { onNotify('PDF files only.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { onNotify('File too large (max 10MB).', 'error'); return; }
    setBusy(key);
    try {
      const path = key + '-' + Date.now() + '.pdf';
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('documents').getPublicUrl(path);
      const { error: dbErr } = await supabase.from('documents').upsert({ key, file_url: pub.publicUrl, updated_at: new Date().toISOString() });
      if (dbErr) throw dbErr;
      onNotify('Uploaded.', 'success');
      await load();
    } catch (e: any) {
      onNotify('Upload failed: ' + (e?.message || 'unknown'), 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="font-serif text-xl text-brand-white">Certificate PDFs</h2>
      {DOCS.map((d) => (
        <div key={d.key} className="rounded-xl border border-brand-purple/30 bg-brand-white/5 p-4">
          <div className="text-sm font-semibold text-brand-white">{d.label}</div>
          <div className="text-xs text-brand-white/60 mb-3 break-all">{urls[d.key] ? 'Uploaded' : 'Using placeholder file'}</div>
          <label className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-purple px-4 text-xs font-semibold text-brand-white cursor-pointer">
            {busy === d.key ? 'Uploading...' : 'Choose PDF'}
            <input type="file" accept="application/pdf" className="hidden" disabled={busy !== null} onChange={(e) => upload(d.key, e.target.files?.[0])} />
          </label>
          {urls[d.key] && <a href={urls[d.key]} target="_blank" rel="noreferrer" className="ml-4 text-xs text-brand-gold underline">View</a>}
        </div>
      ))}
    </div>
  );
};
