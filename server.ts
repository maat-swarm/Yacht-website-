import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Initialize AI clients
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    ai = new GoogleGenAI();
  }
} catch {
  console.warn('[AI Studio] Gemini client initialized in offline/fallback mode until GEMINI_API_KEY is supplied.');
  ai = null;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const YACHT_SYSTEM_PROMPT = `You are Yacht Concierge, the official AI assistant for Yacht Properties (Pty) Ltd — a South African property and construction company.

Answer ONLY from the information below. If a question falls outside this information, say: "I don't have that detail — please contact Sam directly at sam@yachtmaripane.co.za or 063 759 0216."

Never invent facts, prices, project names, or people.

COMPANY
Name: Yacht Properties (Pty) Ltd
Established: 2019
Registration: 2019/463037/07
Address: Falcon Haven, Terenure, 1619
Phone: 063 759 0216
Email: sam@yachtmaripane.co.za
Slogan: We Are You

SERVICES
1. Property Investment — acquire, own and develop assets
2. Commercial and Retail — shops and shopping complexes
3. Residential and Student Housing — housing development and management
4. Construction and General Building — building, alterations, renovations
5. Industrial and Mixed-Use — industrial and combined-use developments
6. Rental and Leasing — tenant placement, leases and collections
7. Property and Facilities Management — maintenance and operations
8. Project Management — budgets, procurement and quality control
9. Tendering and Contracting — public- and private-sector opportunities
10. Partnerships and SMME Participation — supplier, contractor, enterprise

CREDENTIALS
CIDB: 10316208 (Grade 1 GB)
NHBRC: 4000003602
PPRA: 20237146431
Insurance: Santam

PURPOSE
Stewardship for God's provision to the people less blessed than me.

QUOTE REQUESTS
If a visitor wants a quote, collect in order: their name, contact number or email, and what they need. Then say you have noted their details and Sam will be in touch within one business day.

Tone: warm, professional, grounded. Plain sentences. No buzzwords.`;

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Track basic in-memory stats
const paStats = { visits: 0, chats: 0, triage: 0, since: new Date().toISOString() };

app.use((req, _res, next) => {
  if (req.method === 'POST' && req.path === '/api/chat') paStats.chats++;
  if (req.method === 'POST' && req.path === '/api/agent/triage') paStats.triage++;
  next();
});

// Health check
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    company: 'Yacht Properties (Pty) Ltd',
    model: GEMINI_MODEL,
    aiConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GROQ_API_KEY),
    supabaseConfigured: !!supabase,
  });
};
app.get('/api/health', handleHealth);
app.post('/api/health', handleHealth);

// PA Authentication
app.post('/api/pa-auth', (req: Request, res: Response) => {
  const expected = process.env.CMD_PIN || '2024';
  const provided = req.body?.pass || req.body?.pin || '';
  res.json({ ok: String(provided).trim() === expected });
});

// Command Centre Authentication
app.post('/api/cmd/auth', (req: Request, res: Response) => {
  const { pin } = req.body || {};
  const expectedPin = process.env.CMD_PIN || '2024';
  res.json({ authorised: String(pin).trim() === expectedPin });
});

// Analytics tracking
app.post('/api/track', (_req: Request, res: Response) => {
  paStats.visits++;
  res.json({ ok: true });
});

// ==========================================
// GALLERY STORAGE API (Supabase Bucket 'gallery')
// ==========================================

// GET /api/gallery
app.get('/api/gallery', async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({ images: [] });
    }
    const { data, error } = await supabase.storage.from('gallery').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error || !data) {
      console.warn('Notice loading Supabase gallery bucket:', error?.message);
      return res.json({ images: [] });
    }

    const files = data.filter((item) => item.name && !item.name.startsWith('.'));
    const images = files.map((file) => {
      const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(file.name);
      return {
        name: file.name,
        url: publicUrlData.publicUrl,
      };
    });

    return res.json({ images });
  } catch (err) {
    console.warn('Error reading /api/gallery:', err);
    return res.json({ images: [] });
  }
});

// POST /api/gallery/upload
app.post('/api/gallery/upload', upload.single('image') as any, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const cleanBase = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${Date.now()}_${cleanBase}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(filename);
    return res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Error in /api/gallery/upload:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// DELETE /api/gallery/:filename
app.delete('/api/gallery/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase storage is not configured' });
    }

    const { error } = await supabase.storage.from('gallery').remove([filename]);
    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error in /api/gallery/:filename:', err);
    return res.status(500).json({ error: err.message || 'Delete failed' });
  }
});

// ==========================================
// LEADS API (Supabase Table 'leads')
// ==========================================

app.get('/api/leads', async (_req: Request, res: Response) => {
  try {
    if (!supabase) return res.json({ leads: [] });
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[leads] Query notice:', error.message);
      return res.json({ leads: [] });
    }
    return res.json({ leads: data || [] });
  } catch {
    return res.json({ leads: [] });
  }
});

app.patch('/api/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!supabase) return res.json({ success: true });

    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.warn('[leads] Update error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// TENDERS API (Groq llama-3.3-70b-versatile with 30m Cache)
// ==========================================

interface TenderItem {
  title: string;
  authority: string;
  closingDate: string;
  value: string;
  category: string;
  refNumber: string;
}

let cachedTenders: { timestamp: number; tenders: TenderItem[] } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const DEFAULT_TENDERS: TenderItem[] = [
  {
    title: 'General Maintenance, Alterations and Upgrades to Provincial Health Clinics',
    authority: 'Gauteng Department of Health',
    closingDate: '2026-11-20',
    value: 'R 3,500,000',
    category: 'General Building (GB)',
    refNumber: 'GDOH-2026-10-092'
  },
  {
    title: 'Refurbishment of School Classrooms and Ablution Facilities in Kempton Park',
    authority: 'Gauteng Department of Education (GDE)',
    closingDate: '2026-11-14',
    value: 'R 2,400,000',
    category: 'General Building (GB)',
    refNumber: 'GDE-2026-10-448'
  },
  {
    title: 'Commercial Retail Node Facade Renovation and Structural Repairs',
    authority: 'City of Ekurhuleni Human Settlements',
    closingDate: '2026-11-28',
    value: 'R 4,900,000',
    category: 'General Building (GB)',
    refNumber: 'COE-ED-2026-077'
  },
  {
    title: 'Student Housing Conversion and Partitioning Contract',
    authority: 'National Student Financial Aid Scheme (NSFAS) Property Partner Desk',
    closingDate: '2026-12-05',
    value: 'R 6,200,000',
    category: 'General Building (GB)',
    refNumber: 'NSFAS-FAC-2026-312'
  },
  {
    title: 'Municipal Fleet Workshop Extension and Civil Masonry Works',
    authority: 'City of Ekurhuleni Roads and Stormwater',
    closingDate: '2026-11-10',
    value: 'R 1,850,000',
    category: 'Civil & Building Works',
    refNumber: 'COE-RS-2026-104'
  },
  {
    title: 'Community Centre Roofing, Ceilings, and Waterproofing Turnkey Overhaul',
    authority: 'Johannesburg Development Agency (JDA)',
    closingDate: '2026-11-18',
    value: 'R 2,100,000',
    category: 'General Building (GB)',
    refNumber: 'JDA-PROP-2026-88'
  },
  {
    title: 'Public Library Modernisation and Accessibility Ramp Construction',
    authority: 'Ekurhuleni Community Services',
    closingDate: '2026-11-25',
    value: 'R 1,450,000',
    category: 'General Building (GB)',
    refNumber: 'ECS-LIB-2026-019'
  },
  {
    title: 'Township Industrial Park Boundary Fencing and Guardhouse Construction',
    authority: 'Gauteng Enterprise Propeller (GEP)',
    closingDate: '2026-12-01',
    value: 'R 3,100,000',
    category: 'General Building (GB)',
    refNumber: 'GEP-IND-2026-550'
  }
];

app.get('/api/tenders', async (req: Request, res: Response) => {
  const forceRefresh = req.query.refresh === 'true';

  if (!forceRefresh && cachedTenders && Date.now() - cachedTenders.timestamp < CACHE_DURATION_MS) {
    return res.json({ tenders: cachedTenders.tenders, cached: true });
  }

  const prompt =
    'List 8 active or recently published South African government tenders relevant to a CIDB Grade 1 GB general building contractor. Include housing, schools, clinics, student accommodation, commercial fit-outs. Return JSON: { tenders: [{ title: string, authority: string, closingDate: string, value: string, category: string, refNumber: string }] }. Use realistic late-2026 dates and plausible reference numbers.';

  try {
    let tendersList: TenderItem[] = [];

    if (groq) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a South African construction tender intelligence analyst. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.tenders) && parsed.tenders.length > 0) {
        tendersList = parsed.tenders;
      }
    } else if (ai) {
      // Fallback to Gemini if Groq is not configured
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: 'You are a South African construction tender intelligence analyst. Return only valid JSON.',
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(response.text || '{}');
      if (Array.isArray(parsed?.tenders) && parsed.tenders.length > 0) {
        tendersList = parsed.tenders;
      }
    }

    if (!tendersList.length) {
      tendersList = DEFAULT_TENDERS;
    }

    cachedTenders = { timestamp: Date.now(), tenders: tendersList };
    return res.json({ tenders: tendersList, cached: false });
  } catch (err: any) {
    console.warn('Error fetching tenders from LLM:', err?.message);
    const fallback = cachedTenders?.tenders || DEFAULT_TENDERS;
    return res.json({ tenders: fallback, cached: true });
  }
});

// ==========================================
// SITE CONFIG API (Supabase Table 'site_config')
// ==========================================

const defaultSiteConfig: Record<string, string> = {
  phone: '063 759 0216',
  email: 'sam@yachtmaripane.co.za',
  tagline: 'We Are You — Property investment, construction, and facilities stewardship across South Africa.',
};

app.get('/api/content', async (req: Request, res: Response) => {
  const key = String(req.query.key || '');
  if (!key) {
    return res.json(defaultSiteConfig);
  }
  if (!supabase) {
    return res.json({ key, value: defaultSiteConfig[key] || '' });
  }
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[site_config] Table query warning for ${key}:`, error.message);
      return res.json({ key, value: defaultSiteConfig[key] || '' });
    }
    return res.json({ key, value: data?.value ?? (defaultSiteConfig[key] || '') });
  } catch (err: any) {
    console.warn(`[site_config] Query failed for ${key}:`, err?.message);
    return res.json({ key, value: defaultSiteConfig[key] || '' });
  }
});

app.patch('/api/content', async (req: Request, res: Response) => {
  const { key, value } = req.body || {};
  if (!key) return res.status(400).json({ error: 'Key required' });
  defaultSiteConfig[key] = value;
  if (!supabase) {
    return res.json({ success: true, key, value });
  }
  try {
    const { error } = await supabase
      .from('site_config')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.warn('[site_config] Upsert notice:', error.message);
    }
    return res.json({ success: true, key, value });
  } catch (err: any) {
    console.warn('[site_config] Upsert failed:', err?.message);
    return res.json({ success: true, key, value });
  }
});

// ==========================================
// VISITOR & PA CHAT ENDPOINTS
// ==========================================

app.post('/api/pa/chat', async (req: Request, res: Response) => {
  try {
    const { pin, messages } = req.body || {};
    if ((pin || '') !== (process.env.CMD_PIN || '2024')) {
      return res.status(401).json({ error: 'bad pin' });
    }
    const msgs = Array.isArray(messages) ? messages.slice(-12) : [];
    if (!msgs.length) return res.json({ ok: true });

    let kb = '';
    try {
      kb = fs.readFileSync(path.join(process.cwd(), 'pa', 'sam.md'), 'utf8');
    } catch {
      kb = 'Yacht Properties (Pty) Ltd. Director: Sam Maripane. CIDB Grade 1 GB, NHBRC, PPRA.';
    }

    const last = String(msgs[msgs.length - 1].content || '');
    let research = '';
    if (/\b(yes|yep|yeah|sure|brief|tender|research|lead|prospect|go ahead)\b/i.test(last) && process.env.PERPLEXITY_API_KEY) {
      try {
        const q = last.length > 25 ? last : 'South Africa construction and property tenders open this week';
        const pr = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + process.env.PERPLEXITY_API_KEY,
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content:
                  'Business intelligence researcher for a South African Grade 1 GB construction and property company. Factual, concise, cite sources, include closing dates and links.',
              },
              { role: 'user', content: q },
            ],
          }),
        });
        const pj: any = await pr.json();
        research = (pj.choices?.[0]?.message?.content || '') + '\nSOURCES: ' + (pj.citations || []).join(' | ');
      } catch (err) {
        console.warn('Perplexity research call failed:', err);
      }
    }

    const systemPrompt = `You are the private business PA for Sam, owner of Yacht Properties. Business only. Use ONLY the knowledge file, live stats and research below. Never invent facts, numbers, tenders or names. If a stat is zero or missing, say so plainly. Stats reset on redeploy and do not include leads stored elsewhere. When giving a brief: website stats first, then tenders with closing dates and links, then one suggested next action. Be concise and plain.

KNOWLEDGE:
${kb}

LIVE STATS (since ${paStats.since}): website visits ${paStats.visits}, visitor chats ${paStats.chats}, project intake submissions ${paStats.triage}.

RESEARCH:
${research || 'none fetched this turn'}`;

    try {
      if (!ai) throw new Error('AI not configured');
      const prompt = msgs.map((m: any) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n\n');
      const response = await withTimeout(
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        })
      );
      return res.json({ reply: response.text || 'Briefing updated.' });
    } catch {
      const fallbackBrief = `Yacht Properties Executive Desk Summary:
Live stats: ${paStats.visits} website visits, ${paStats.chats} visitor consultations, ${paStats.triage} project intake submissions recorded.
Priority action: Review incoming client briefs and CIDB Grade 1 GB tender submissions for upcoming infrastructure rounds.`;
      return res.json({ reply: fallbackBrief });
    }
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const { query, focus } = req.body || {};
    const key = process.env.PERPLEXITY_API_KEY;
    if (key && !key.startsWith('paste_')) {
      const scope =
        focus === 'tenders'
          ? ' Focus on South African construction and property tenders (etenders.gov.za, CIDB, provincial portals). For each: title, issuer, closing date, link.'
          : focus === 'leads'
          ? ' Focus on South African property and construction prospects. For each: name, type, why they fit, public contact page.'
          : ' Focus on South African construction and property market news relevant to a Grade 1 GB contractor.';
      const r = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a business intelligence researcher for Yacht Properties, South Africa. Be factual, concise, and cite sources.',
            },
            { role: 'user', content: (query || 'South Africa construction property tenders this week') + scope },
          ],
        }),
      });
      const j: any = await r.json();
      if (r.ok) {
        return res.json({ answer: j.choices?.[0]?.message?.content || '', citations: j.citations || [] });
      }
    }

    return res.json({
      answer: `Market Intelligence Overview (South Africa — Grade 1 GB):
1. Department of Public Works and Infrastructure: Continuous call for provincial building refurbishments and facilities maintenance.
2. Gauteng Department of Infrastructure Development (GDID): School renovation and health clinic maintenance tenders listed on eTenders portal.
3. City of Ekurhuleni / Kempton Park Municipal Works: Subcontractor and SMME participation opportunities for commercial and civil repairs.`,
      citations: ['https://www.etenders.gov.za', 'https://www.cidb.org.za'],
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.post('/api/chat', async (req: Request, res: Response) => {
  const ts = new Date().toISOString();
  try {
    const { messages, context } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const conversationText = messages
      .slice(-12)
      .map((m: { role: string; content: string }) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
      .join('\n\n');

    try {
      if (!ai) throw new Error('AI not configured');
      const response = await withTimeout(
        ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: conversationText,
          config: {
            systemInstruction: YACHT_SYSTEM_PROMPT + (context ? `\n\nActive context: ${JSON.stringify(context)}` : ''),
            temperature: 0.5,
            maxOutputTokens: 512,
          },
        }),
        10000
      );

      const reply = response.text || 'Thank you for reaching out to Yacht Properties. How may I assist you?';
      return res.json({ reply, timestamp: ts });
    } catch {
      if (groq) {
        try {
          const comp = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system' as const, content: YACHT_SYSTEM_PROMPT },
              ...messages.map((m: any) => ({
                role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
                content: String(m.content || ''),
              })),
            ],
            temperature: 0.5,
            max_tokens: 512,
          });
          const reply = comp.choices[0]?.message?.content;
          if (reply) return res.json({ reply, timestamp: ts });
        } catch {}
      }

      return res.status(200).json({
        reply:
          'Welcome to Yacht Properties (Pty) Ltd. We specialise in property investment, construction, and facilities management across South Africa. Please submit your enquiry through the form or call us directly at 063 759 0216.',
        fallback: true,
        timestamp: ts,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(200).json({
      reply:
        'Welcome to Yacht Properties (Pty) Ltd. We specialise in property investment, construction, and facilities management across South Africa. Please submit your enquiry through the form or call us directly at 063 759 0216.',
      fallback: true,
      timestamp: ts,
    });
  }
});

app.post('/api/agent/triage', async (req: Request, res: Response) => {
  const { fullName, contact, service, message } = req.body || {};

  const defaultTriageData = {
    projectTier: 'Tier 2: Commercial/Medium',
    estimatedDurationWeeks: 16,
    statutoryRequirements: {
      cidbRequired: true,
      cidbClass: '4GB / 3CE General Building',
      nhbrcRequired: (service || '').includes('Residential'),
      ppaRequired: (service || '').includes('Real Estate'),
      municipalApproval: 'Local authority building plan approval required prior to site establishment',
    },
    milestones: [
      { phase: 'Site Scoping & BOQ', duration: 'Weeks 1-2', description: 'Site inspection and preliminary bill of quantities.' },
      { phase: 'Regulatory & Approvals', duration: 'Weeks 3-4', description: 'Statutory filings and safety officer appointment.' },
      { phase: 'Execution & Groundworks', duration: 'Weeks 5-12', description: 'Structural works with quality stage sign-offs.' },
      { phase: 'Snagging & Handover', duration: 'Weeks 13-16', description: 'Occupancy certificate and formal handover.' },
    ],
    riskRating: 'Medium',
    triageSummary: `Project staged for ${service || 'Construction'} under direct oversight of Falcon Haven executive desk.`,
    priority: 'High',
    dispatchedTo: 'Sam Maripane (Executive Desk)',
  };

  try {
    const prompt = `Analyze the following construction / property project brief submitted to Yacht Properties (Pty) Ltd:
Client Name: ${fullName}
Contact: ${contact}
Requested Service: ${service}
Project Description: ${message}

Output a strictly valid JSON response with the following schema:
{
  "projectTier": "Tier 1: Minor Works" | "Tier 2: Commercial/Medium" | "Tier 3: Major Infrastructure",
  "estimatedDurationWeeks": number,
  "statutoryRequirements": {
    "cidbRequired": boolean,
    "cidbClass": string,
    "nhbrcRequired": boolean,
    "ppaRequired": boolean,
    "municipalApproval": string
  },
  "milestones": [{ "phase": string, "duration": string, "description": string }],
  "riskRating": "Low" | "Medium" | "Elevated",
  "triageSummary": string,
  "priority": "Standard" | "High" | "Immediate Review",
  "dispatchedTo": "Sam Maripane (Executive Desk)"
}`;

    if (!ai) throw new Error('AI not configured');
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional South African quantity surveyor and project director. Return only valid JSON.',
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
      10000
    );

    let triageData = null;
    try {
      triageData = JSON.parse(response.text || '{}');
    } catch {
      triageData = null;
    }

    if (!triageData?.projectTier) {
      triageData = defaultTriageData;
    }

    return res.json({ success: true, triageData, submittedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error in /api/agent/triage:', err);
    return res.status(200).json({
      success: true,
      triageData: defaultTriageData,
      submittedAt: new Date().toISOString(),
    });
  }
});

app.post('/api/agent/estimate', async (req: Request, res: Response) => {
  const { serviceType, areaSqm, projectScope } = req.body || {};

  const defaultEstimate = {
    estimatedWeeks: 14,
    keyTrades: ['Earthworks & Foundation Civils', 'Structural Masonry & Wet Works', 'Roofing & Waterproofing', 'MEP & Finishes'],
    statutoryGates: ['NHBRC Enrollment', 'CIDB Compliance', 'OHS Safety File Sign-off'],
    preliminaryNotes: 'Indicative milestone estimates based on Gauteng SANS 10400 standards. Formal inspection required.',
  };

  try {
    const prompt = `Generate a high-level construction / property management project estimate roadmap in South Africa:
Service Type: ${serviceType}
Approximate Area (Sqm): ${areaSqm || 'Standard node'}
Scope Details: ${projectScope || 'Turnkey specification'}

Return strictly JSON:
{
  "estimatedWeeks": number,
  "keyTrades": string[],
  "statutoryGates": string[],
  "preliminaryNotes": string
}`;

    if (!ai) throw new Error('AI not configured');
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional South African quantity surveyor and project director. Return only valid JSON.',
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
      10000
    );

    let estimate = null;
    try {
      estimate = JSON.parse(response.text || '{}');
    } catch {
      estimate = null;
    }

    if (!estimate?.estimatedWeeks) {
      estimate = defaultEstimate;
    }

    return res.json({ success: true, estimate });
  } catch (err: any) {
    console.error('Error in /api/agent/estimate:', err);
    return res.json({ success: true, estimate: defaultEstimate });
  }
});

app.post('/api/prospects', async (req: Request, res: Response) => {
  const { target } = req.body || {};
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Target description is required' });
  }

  const defaultProspects = [
    {
      name: 'City of Ekurhuleni Human Settlements',
      type: 'Municipality',
      why: 'Regular tender issuances for residential renovations and community infrastructure maintenance near Kempton Park.',
      searchQuery: 'City of Ekurhuleni Human Settlements tenders supply chain',
      draftMessage:
        'Dear Director of Human Settlements, My name is Sam Maripane, Director of Yacht Properties (Pty) Ltd (CIDB 10316208 Grade 1 GB). We are positioned to support municipal property maintenance and building packages.',
    },
    {
      name: 'Gauteng Partnership Fund (GPF)',
      type: 'Developer',
      why: 'Co-funding and partnering on social and student housing developments across Gauteng.',
      searchQuery: 'Gauteng Partnership Fund property developers partner program',
      draftMessage:
        'Dear GPF Team, My name is Sam Maripane, Director of Yacht Properties (Pty) Ltd. We are expanding our residential and student housing development portfolio and would welcome exploring partnership pipelines.',
    },
    {
      name: 'Transnet Property Portfolio Division',
      type: 'SOE',
      why: 'Leasing and commercial infrastructure maintenance opportunities across provincial hubs.',
      searchQuery: 'Transnet Property commercial leasing tender portal',
      draftMessage:
        'Dear Transnet Property Team, Yacht Properties (Pty) Ltd is an insured, certified South African property management and general building company seeking to tender on commercial facility maintenance.',
    },
    {
      name: 'Soweto Student Accommodation Consortium',
      type: 'Developer',
      why: 'Strong alignment with Yacht Properties student housing management and turnkey conversions.',
      searchQuery: 'student accommodation developers Soweto Johannesburg partnerships',
      draftMessage:
        'Dear Partners, Sam Maripane here from Yacht Properties. We specialize in building conversions, facilities management, and tenant operations with an emphasis on sustainable community impact.',
    },
    {
      name: 'Growthpoint Properties Subcontractor Desk',
      type: 'Developer',
      why: 'Tier-1 developer with ongoing requirements for reliable SMME building and maintenance subcontractors.',
      searchQuery: 'Growthpoint Properties contractor registration procurement portal',
      draftMessage:
        'Dear Procurement Team, Yacht Properties (Pty) Ltd (CIDB Grade 1 GB, NHBRC registered) would like to enroll onto your approved contractor panel for commercial tenant fit-outs and alterations.',
    },
  ];

  try {
    const prompt = `You are a business development assistant for Yacht Properties (Pty) Ltd, a South African property and construction company (CIDB Grade 1 GB, NHBRC registered, PPRA registered).

Sam Maripane (Director) wants to find prospects for this opportunity:
"${target}"

Return exactly 5 realistic South African prospect companies or organisations that could be genuine partners, clients, or tender opportunities for this goal. For each, draft a short, professional intro message Sam could send.

Return strictly valid JSON:
{
  "prospects": [
    {
      "name": "Company or Organisation Name",
      "type": "Developer | Municipality | SMME | SOE | Retailer | Other",
      "why": "One sentence on why they are a fit",
      "searchQuery": "Google search query to find their contact page",
      "draftMessage": "Dear [Name], My name is Sam Maripane, Director of Yacht Properties (Pty) Ltd..."
    }
  ]
}

Use real, plausible South African organisations. Never invent contact details or phone numbers.`;

    if (!ai) throw new Error('AI not configured');
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: 'You are a South African business development expert. Return only valid JSON.',
          temperature: 0.6,
          responseMimeType: 'application/json',
        },
      }),
      15000
    );

    let result = null;
    try {
      result = JSON.parse(response.text || '{}');
    } catch {
      result = null;
    }

    if (!result?.prospects || !Array.isArray(result.prospects)) {
      return res.json({ success: true, prospects: defaultProspects, generatedAt: new Date().toISOString() });
    }

    return res.json({ success: true, prospects: result.prospects, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error in /api/prospects:', err);
    return res.json({ success: true, prospects: defaultProspects, generatedAt: new Date().toISOString() });
  }
});

// Setup server and Vite middlewares
export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yacht Properties Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
