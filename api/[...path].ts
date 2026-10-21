// Vercel catch-all router for the Command Centre API.
type VercelRequest = any;
type VercelResponse = any;
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export const config = { maxDuration: 60 };

// TEMPORARY: CMD_OPEN=1 in Vercel env accepts any PIN while debugging. Remove afterwards.
const isOpen = () => process.env.CMD_OPEN === '1';
const cmdPin = () => String(process.env.CMD_PIN || '2024').trim();
const secret = () => process.env.CMD_SESSION_SECRET || `${cmdPin()}|${process.env.SUPABASE_SERVICE_ROLE_KEY || 'yacht'}`;
const digest = (s: string) => createHash('sha256').update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));
const mac = (exp: string) => createHmac('sha256', secret()).update(exp).digest('hex');
const issueToken = () => {
  const exp = String(Date.now() + 8 * 3600 * 1000);
  return `${exp}.${mac(exp)}`;
};
const isAuthed = (req: VercelRequest) => {
  if (isOpen()) return true;
  const m = /(?:^|;\s*)yacht_cmd=([0-9a-f.]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEq(sig, mac(exp));
};

const fails = new Map<string, { n: number; until: number }>();
const ip = (req: VercelRequest) => String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();

const sb = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return url && key ? createClient(url, key) : null;
};
const deny = (res: VercelResponse) => res.status(401).json({ error: 'Not authorised' });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
const runUpload = (req: any, res: any) =>
  new Promise<void>((resolve, reject) => upload.single('image')(req, res, (e: any) => (e ? reject(e) : resolve())));

const defaults: Record<string, string> = {
  phone: '063 759 0216',
  email: 'sam@yachtmaripane.co.za',
  tagline: 'We Are You — Property investment, construction, and facilities stewardship across South Africa.',
};

let tenderCache: { t: number; tenders: any[] } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const raw = req.query.path;
    const parts = (Array.isArray(raw) ? raw : String(raw || '').split('/')).filter(Boolean);
    const route = parts.join('/');
    const method = req.method || 'GET';
    const body: any = req.body || {};

    if (route === 'cmd/auth' && method === 'POST') {
      const k = ip(req);
      const f = fails.get(k);
      if (f && f.until > Date.now()) return res.status(429).json({ authorised: false, error: 'Too many attempts' });
      if (isOpen() || safeEq(String(body.pin ?? '').trim(), cmdPin())) {
        fails.delete(k);
        res.setHeader('Set-Cookie', `yacht_cmd=${issueToken()}; Path=/api; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`);
        return res.json({ authorised: true });
      }
      const n = (f?.n || 0) + 1;
      fails.set(k, { n, until: n >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
      await new Promise((r) => setTimeout(r, 400));
      return res.json({ authorised: false });
    }

    if (route === 'pa-auth' && method === 'POST') {
      return res.json({ ok: isOpen() || safeEq(String(body.pass ?? body.pin ?? '').trim(), cmdPin()) });
    }

    if (route === 'gallery' && method === 'GET') {
      const s = sb();
      if (!s) return res.json({ images: [] });
      const { data, error } = await s.storage.from('gallery').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (error || !data) return res.json({ images: [] });
      const images = data
        .filter((f) => f.name && !f.name.startsWith('.'))
        .map((f) => ({ name: f.name, url: s.storage.from('gallery').getPublicUrl(f.name).data.publicUrl }));
      return res.json({ images });
    }

    if (route === 'gallery/upload' && method === 'POST') {
      if (!isAuthed(req)) return deny(res);
      await runUpload(req, res);
      const file = (req as any).file;
      if (!file) return res.status(400).json({ error: 'No image file uploaded' });
      const s = sb();
      if (!s) return res.status(503).json({ error: 'Storage not configured' });
      const ext = (/\.[a-zA-Z0-9]+$/.exec(file.originalname) || ['.jpg'])[0];
      const base = file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const name = `${Date.now()}_${base}${ext}`;
      const { error } = await s.storage.from('gallery').upload(name, file.buffer, { contentType: file.mimetype, upsert: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, url: s.storage.from('gallery').getPublicUrl(name).data.publicUrl });
    }

    if (parts[0] === 'gallery' && parts.length === 2 && method === 'DELETE') {
      if (!isAuthed(req)) return deny(res);
      const s = sb();
      if (!s) return res.status(503).json({ error: 'Storage not configured' });
      const { error } = await s.storage.from('gallery').remove([decodeURIComponent(parts[1])]);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }

    if (route === 'leads' && method === 'GET') {
      if (!isAuthed(req)) return deny(res);
      const s = sb();
      if (!s) return res.status(503).json({ error: 'Database not configured', leads: [] });
      const { data, error } = await s.from('leads').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message, leads: [] });
      return res.json({ leads: data || [] });
    }

    if (parts[0] === 'leads' && parts.length === 2 && method === 'PATCH') {
      if (!isAuthed(req)) return deny(res);
      const status = body.status;
      if (!['new', 'reviewed', 'actioned'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const s = sb();
      if (!s) return res.status(503).json({ error: 'Database not configured' });
      const { error } = await s.from('leads').update({ status }).eq('id', parts[1]);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }

    if (route === 'tenders' && method === 'GET') {
      if (!isAuthed(req)) return deny(res);
      const refresh = req.query.refresh === 'true';
      if (!refresh && tenderCache && Date.now() - tenderCache.t < 30 * 60 * 1000) return res.json({ tenders: tenderCache.tenders, cached: true });
      const key = process.env.GROQ_API_KEY;
      if (!key) return res.json({ tenders: tenderCache?.tenders || [], cached: true, notice: 'AI not configured' });
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'llama3-groq-70b-8192-tool-use-preview',
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a South African construction tender intelligence analyst. Return only valid JSON.' },
              { role: 'user', content: 'List 8 active or recently published South African government tenders relevant to a CIDB Grade 1 GB general building contractor. Include housing, schools, clinics, student accommodation, commercial fit-outs. Return JSON: { tenders: [{ title: string, authority: string, closingDate: string, value: string, category: string, refNumber: string }] }. Use realistic late-2026 dates and plausible reference numbers.' },
            ],
          }),
        });
        const j: any = await r.json();
        const parsed = JSON.parse(j?.choices?.[0]?.message?.content || '{}');
        const tenders = Array.isArray(parsed?.tenders) ? parsed.tenders : [];
        if (tenders.length) tenderCache = { t: Date.now(), tenders };
        return res.json({ tenders, cached: false, illustrative: true });
      } catch (e: any) {
        return res.json({ tenders: tenderCache?.tenders || [], cached: true, notice: 'Tender lookup failed' });
      }
    }

    if (route === 'content' && method === 'GET') {
      const key = String(req.query.key || '');
      if (!key) return res.json(defaults);
      const s = sb();
      if (!s) return res.json({ key, value: defaults[key] || '' });
      const { data, error } = await s.from('site_config').select('value').eq('key', key).maybeSingle();
      return res.json({ key, value: error ? defaults[key] || '' : data?.value ?? (defaults[key] || '') });
    }

    if (route === 'content' && method === 'PATCH') {
      if (!isAuthed(req)) return deny(res);
      const { key, value } = body;
      if (!['phone', 'email', 'tagline'].includes(key)) return res.status(400).json({ error: 'Invalid key' });
      const s = sb();
      if (!s) return res.status(503).json({ error: 'Database not configured' });
      const { error } = await s.from('site_config').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true, key, value });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
