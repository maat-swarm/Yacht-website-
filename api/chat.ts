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

export const config = { maxDuration: 30 };

export default async function handler(req: any, res: any) {
  const ts = new Date().toISOString();
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'Messages array is required' });
    const key = process.env.GROQ_API_KEY;
    if (!key) return res.status(503).json({ error: 'GROQ_API_KEY not set' });
    const history = messages.slice(-12).map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') }));
    const gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.5,
        max_tokens: 512,
        messages: [{ role: 'system', content: YACHT_SYSTEM_PROMPT + (context ? '\n\nActive context: ' + JSON.stringify(context) : '') }, ...history]
      })
    });
    const gj: any = await gr.json();
    const reply = gj.choices?.[0]?.message?.content || 'Thank you for reaching out to Yacht Properties. How may I assist you?';
    return res.status(200).json({ reply, timestamp: ts });
  } catch (e) {
    return res.status(200).json({ reply: "I'm having trouble connecting. Please call Sam directly on 063 759 0216.", timestamp: ts });
  }
}
