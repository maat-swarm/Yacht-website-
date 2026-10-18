import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const YACHT_PROPERTIES_SYSTEM_INSTRUCTION = `
You are the official AI Technical Agent & Operations Officer for "Yacht Properties (Pty) Ltd", a distinguished South African property development and construction company.
Company Details:
- Legal Name: Yacht Properties (Pty) Ltd
- Head Office: Falcon Haven, Terenure, 1619 (Kempton Park, Gauteng, South Africa)
- Executive Desk: Sam Maripane (Phone: 063 759 0216, Email: sam@yachtmaripane.co.za)
- Company Slogan: "We are You"
- Stewardship Mandate: "Stewardship for God's provision to the people less blessed than me."
- Core Disciplines:
  1. Construction: Turnkey civil works, structural building, commercial fit-outs, residential housing, general contracting.
  2. Property Management: Facilities maintenance, lease administration, rent collections, asset preservation.
  3. Real Estate Services: Acquisitions, sales advisory, commercial & residential leasing, portfolio placements.
  4. Extended Capabilities: Property Investment, Commercial & Retail, Student Housing, Industrial & Mixed-Use, Project Management, Tendering & Public Sector Contracting, SMME Partnerships.
- Statutory Registrations:
  - CIDB (Construction Industry Development Board): General Building (GB), Civil Engineering (CE).
  - NHBRC (National Home Builders Registration Council): Structural home warranties & technical standards.
  - PPRA (Property Practitioners Regulatory Authority): Real estate & property management compliance.

Tone & Persona:
- Trustworthy, dignified, rooted, respectful, and authoritative yet warm.
- Plain words, clear sentences. No marketing buzzwords like "seamless", "robust", "leverage", "delve".
- Always grounded in South African property regulations, SANS building standards, and local context.
- When answering project questions, provide practical timelines, regulatory steps (CIDB, NHBRC, municipal submissions), and encourage formal enquiry submission or calling Sam at 063 759 0216.
- If the user asks for an estimate or compliance check, offer clear, structured information.
`;

// Helper: Guarantee snappy response times with 6s timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'online',
      company: 'Yacht Properties (Pty) Ltd',
      model: 'gemini-3.8-flash',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Main AI Agent Chat endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Build conversation history for Gemini
      const conversationHistory = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Call Gemini 3.8 Flash with 8s safety timeout
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: conversationHistory,
          config: {
            systemInstruction:
              YACHT_PROPERTIES_SYSTEM_INSTRUCTION +
              (context ? `\nActive Context: ${JSON.stringify(context)}` : ''),
            temperature: 0.7,
          },
        }),
        8000
      );

      const reply = response.text || 'Thank you for reaching Yacht Properties. How may our operations desk assist your property or construction brief today?';

      return res.json({
        reply,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      // Return structured fallback if API error occurs
      return res.status(200).json({
        reply:
          'Welcome to Yacht Properties (Pty) Ltd. Our operational desk specializes in civil construction, property management, and statutory compliance (CIDB, NHBRC, PPRA). Please submit your project brief through the enquiry form or call our direct line at 063 759 0216.',
        fallback: true,
      });
    }
  });

  // Automated Project Triage & Dispatch Engine
  app.post('/api/agent/triage', async (req: Request, res: Response) => {
    try {
      const { fullName, contact, service, message } = req.body;

      const prompt = `
Analyze the following construction / property project brief submitted to Yacht Properties (Pty) Ltd:
Client Name: ${fullName}
Contact: ${contact}
Requested Service: ${service}
Project Description: ${message}

Output a strictly valid JSON response with the following schema:
{
  "projectTier": "Tier 1: Minor Works" | "Tier 2: Commercial/Medium" | "Tier 3: Major Infrastructure",
  "estimatedDurationWeeks": number (e.g. 12),
  "statutoryRequirements": {
    "cidbRequired": boolean,
    "cidbClass": string (e.g. "3GB to 5GB" or "Not required"),
    "nhbrcRequired": boolean,
    "ppraRequired": boolean,
    "municipalApproval": string (e.g. "City of Ekurhuleni / Local Council submission required")
  },
  "milestones": [
    { "phase": string, "duration": string, "description": string }
  ],
  "riskRating": "Low" | "Medium" | "Elevated",
  "triageSummary": string (1-2 sentences plain language summary),
  "priority": "Standard" | "High" | "Immediate Review",
  "dispatchedTo": "Sam Maripane (Executive Desk)"
}
`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an expert construction estimator and statutory compliance auditor for South Africa. Return only valid JSON.',
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        6000
      );

      let triageData;
      try {
        const rawText = response.text || '{}';
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        triageData = JSON.parse(cleaned);
      } catch (parseError) {
        console.warn('Failed to parse Gemini triage JSON, using structured fallback:', parseError);
        triageData = null;
      }

      if (!triageData || !triageData.projectTier) {
        triageData = {
          projectTier: 'Tier 2: Commercial/Medium',
          estimatedDurationWeeks: 16,
          statutoryRequirements: {
            cidbRequired: true,
            cidbClass: '4GB / 3CE General Building',
            nhbrcRequired: (req.body.service || '').includes('Residential'),
            ppraRequired: (req.body.service || '').includes('Real Estate'),
            municipalApproval: 'Local authority building plan approval required prior to site establishment',
          },
          milestones: [
            { phase: 'Site Scoping & BOQ', duration: 'Weeks 1-2', description: 'Site inspection and preliminary bill of quantities.' },
            { phase: 'Regulatory & Approvals', duration: 'Weeks 3-4', description: 'Statutory filings and safety officer appointment.' },
            { phase: 'Execution & Groundworks', duration: 'Weeks 5-12', description: 'Structural works with quality stage sign-offs.' },
            { phase: 'Snagging & Handover', duration: 'Weeks 13-16', description: 'Occupancy certificate and formal handover.' },
          ],
          riskRating: 'Medium',
          triageSummary: `Project intake completed for ${req.body.service || 'Construction'}. Scope staged for Falcon Haven executive desk review.`,
          priority: 'High',
          dispatchedTo: 'Sam Maripane (Executive Desk)',
        };
      }

      return res.json({
        success: true,
        triageData,
        submittedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error in /api/agent/triage:', err);
      // Fallback rule-based triage
      return res.json({
        success: true,
        triageData: {
          projectTier: 'Tier 2: Commercial/Medium',
          estimatedDurationWeeks: 16,
          statutoryRequirements: {
            cidbRequired: true,
            cidbClass: '4GB / 3CE General Building',
            nhbrcRequired: req.body.service?.includes('Residential') ?? false,
            ppraRequired: req.body.service?.includes('Real Estate') ?? false,
            municipalApproval: 'Local authority building plan approval required prior to site establishment',
          },
          milestones: [
            { phase: 'Site Scoping & BOQ', duration: 'Weeks 1-2', description: 'Site inspection and preliminary bill of quantities.' },
            { phase: 'Regulatory & Approvals', duration: 'Weeks 3-4', description: 'Statutory filings and safety officer appointment.' },
            { phase: 'Execution & Groundworks', duration: 'Weeks 5-12', description: 'Structural works with quality stage sign-offs.' },
            { phase: 'Snagging & Handover', duration: 'Weeks 13-16', description: 'Occupancy certificate and formal handover.' },
          ],
          riskRating: 'Medium',
          triageSummary: `Project staged for ${req.body.service} under direct oversight of Falcon Haven executive desk.`,
          priority: 'High',
          dispatchedTo: 'Sam Maripane (Executive Desk)',
        },
        submittedAt: new Date().toISOString(),
      });
    }
  });

  // Automated Quick Estimator Engine
  app.post('/api/agent/estimate', async (req: Request, res: Response) => {
    try {
      const { serviceType, areaSqm, projectScope } = req.body;

      const prompt = `
Generate a high-level construction / property management project estimate roadmap in South Africa:
Service Type: ${serviceType}
Approximate Area (Sqm): ${areaSqm || 'Standard node'}
Scope Details: ${projectScope || 'Turnkey specification'}

Return strictly JSON:
{
  "estimatedWeeks": number,
  "keyTrades": string[],
  "statutoryGates": string[],
  "preliminaryNotes": string
}
`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are a professional South African quantity surveyor and project director. Return only valid JSON.',
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        6000
      );

      let estimate;
      try {
        const rawText = response.text || '{}';
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        estimate = JSON.parse(cleaned);
      } catch (parseError) {
        console.warn('Failed to parse Gemini estimate JSON, using structured fallback:', parseError);
        estimate = null;
      }

      if (!estimate || !estimate.estimatedWeeks) {
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

  // Vite dev server mounting in dev or static serving in production
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
    console.log(`[Yacht Properties Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
