import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

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

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => reject(new Error('AI generation timeout')), timeoutMs);
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  });
  return Promise.race([promise, timeoutPromise]);
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Health check
  app.post('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'online',
      company: 'Yacht Properties (Pty) Ltd',
      model: MODEL,
      groqConfigured: !!process.env.GROQ_API_KEY,
    });
  });

  // Visitor chat
  app.post('/api/research', async (req, res) => {
  try {
    const { query, focus } = req.body || {};
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key || key.startsWith('paste_')) return res.status(503).json({ error: 'PERPLEXITY_API_KEY not set' });
    const scope = focus === 'tenders'
      ? ' Focus on South African construction and property tenders (etenders.gov.za, CIDB, provincial portals). For each: title, issuer, closing date, link.'
      : focus === 'leads'
      ? ' Focus on South African property and construction prospects. For each: name, type, why they fit, public contact page.'
      : ' Focus on South African construction and property market news relevant to a Grade 1 GB contractor.';
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: 'sonar', messages: [
        { role: 'system', content: 'You are a business intelligence researcher for Yacht Properties, South Africa. Be factual, concise, and cite sources.' },
        { role: 'user', content: (query || 'South Africa construction property tenders this week') + scope }
      ] })
    });
    const j: any = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: j });
    res.json({ answer: j.choices?.[0]?.message?.content || '', citations: j.citations || [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const history = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const completion = await withTimeout(
        groq.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: YACHT_SYSTEM_PROMPT + (context ? `\n\nActive context: ${JSON.stringify(context)}` : ''),
            },
            ...history,
          ],
          temperature: 0.5,
          max_tokens: 512,
        }),
        10000
      );

      const reply = completion.choices[0]?.message?.content || 'Thank you for reaching out to Yacht Properties. How may I assist you?';
      return res.json({ reply, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      return res.status(200).json({
        reply: 'Welcome to Yacht Properties (Pty) Ltd. We specialise in property investment, construction, and facilities management across South Africa. Please submit your enquiry through the form or call us directly at 063 759 0216.',
        fallback: true,
      });
    }
  });

  // Project triage
  app.post('/api/agent/triage', async (req: Request, res: Response) => {
    try {
      const { fullName, contact, service, message } = req.body;

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

      const completion = await withTimeout(
        groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: 'You are a professional South African quantity surveyor and project director. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
        10000
      );

      let triageData = null;
      try {
        const rawText = completion.choices[0]?.message?.content || '{}';
        triageData = JSON.parse(rawText);
      } catch (parseError) {
        console.warn('Failed to parse triage JSON:', parseError);
        triageData = null;
      }

      if (!triageData?.projectTier) {
        triageData = {
          projectTier: 'Tier 2: Commercial/Medium',
          estimatedDurationWeeks: 16,
          statutoryRequirements: {
            cidbRequired: true,
            cidbClass: '4GB / 3CE General Building',
            nhbrcRequired: (req.body.service || '').includes('Residential'),
            ppaRequired: (req.body.service || '').includes('Real Estate'),
            municipalApproval: 'Local authority building plan approval required prior to site establishment',
          },
          milestones: [
            { phase: 'Site Scoping & BOQ', duration: 'Weeks 1-2', description: 'Site inspection and preliminary bill of quantities.' },
            { phase: 'Regulatory & Approvals', duration: 'Weeks 3-4', description: 'Statutory filings and safety officer appointment.' },
            { phase: 'Execution & Groundworks', duration: 'Weeks 5-12', description: 'Structural works with quality stage sign-offs.' },
            { phase: 'Snagging & Handover', duration: 'Weeks 13-16', description: 'Occupancy certificate and formal handover.' },
          ],
          riskRating: 'Medium',
          triageSummary: `Project staged for ${req.body.service || 'Construction'} under direct oversight of Falcon Haven executive desk.`,
          priority: 'High',
          dispatchedTo: 'Sam Maripane (Executive Desk)',
        };
      }

      return res.json({ success: true, triageData, submittedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error in /api/agent/triage:', err);
      return res.status(200).json({
        success: true,
        triageData: {
          projectTier: 'Tier 2: Commercial/Medium',
          estimatedDurationWeeks: 16,
          statutoryRequirements: { cidbRequired: true, cidbClass: '4GB / 3CE General Building', nhbrcRequired: false, ppaRequired: false, municipalApproval: 'Local authority building plan approval required prior to site establishment' },
          milestones: [
            { phase: 'Site Scoping & BOQ', duration: 'Weeks 1-2', description: 'Site inspection and preliminary bill of quantities.' },
            { phase: 'Regulatory & Approvals', duration: 'Weeks 3-4', description: 'Statutory filings and safety officer appointment.' },
            { phase: 'Execution & Groundworks', duration: 'Weeks 5-12', description: 'Structural works with quality stage sign-offs.' },
            { phase: 'Snagging & Handover', duration: 'Weeks 13-16', description: 'Occupancy certificate and formal handover.' },
          ],
          riskRating: 'Medium',
          triageSummary: `Project staged for ${req.body.service || 'Construction'} under direct oversight of Falcon Haven executive desk.`,
          priority: 'High',
          dispatchedTo: 'Sam Maripane (Executive Desk)',
        },
        submittedAt: new Date().toISOString(),
      });
    }
  });

  // Estimate engine
  app.post('/api/agent/estimate', async (req: Request, res: Response) => {
    try {
      const { serviceType, areaSqm, projectScope } = req.body;

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

      const completion = await withTimeout(
        groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: 'You are a professional South African quantity surveyor and project director. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
          response_format: { type: 'json_object' },
        }),
        10000
      );

      let estimate = null;
      try {
        const rawText = completion.choices[0]?.message?.content || '{}';
        estimate = JSON.parse(rawText);
      } catch (parseError) {
        estimate = null;
      }

      if (!estimate?.estimatedWeeks) {
        estimate = {
          estimatedWeeks: 14,
          keyTrades: ['Earthworks & Foundation Civils', 'Structural Masonry & Wet Works', 'Roofing & Waterproofing', 'MEP & Finishes'],
          statutoryGates: ['NHBRC Enrollment', 'CIDB Compliance', 'OHS Safety File Sign-off'],
          preliminaryNotes: 'Indicative milestone estimates based on Gauteng SANS 10400 standards. Formal inspection required.',
        };
      }

      return res.json({ success: true, estimate });
    } catch (err: any) {
      console.error('Error in /api/agent/estimate:', err);
      return res.json({
        success: true,
        estimate: {
          estimatedWeeks: 12,
          keyTrades: ['Earthworks & Civils', 'Structural Masonry', 'Wet Works', 'Electrical & Plumbing Compliance'],
          statutoryGates: ['NHBRC Enrollment', 'CIDB Compliance', 'OHS Safety File Sign-off'],
          preliminaryNotes: 'Estimates are indicative pending formal site inspection by Yacht Properties principals.',
        },
      });
    }
  });

  // Sam's prospect finder — PA tool
  app.post('/api/prospects', async (req: Request, res: Response) => {
    try {
      const { target } = req.body;
      if (!target || typeof target !== 'string') {
        return res.status(400).json({ error: 'Target description is required' });
      }

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

      const completion = await withTimeout(
        groq.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: 'You are a South African business development expert. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
        15000
      );

      let result = null;
      try {
        const rawText = completion.choices[0]?.message?.content || '{}';
        result = JSON.parse(rawText);
      } catch (parseError) {
        result = null;
      }

      if (!result?.prospects) {
        return res.status(200).json({
          success: false,
          message: 'Could not generate prospects. Please try a more specific target description.',
        });
      }

      return res.json({ success: true, prospects: result.prospects, generatedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error in /api/prospects:', err);
      return res.status(500).json({ error: 'Prospect finder temporarily unavailable.' });
    }
  });

  // Vite dev server mounting
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

startServer();
