export const config = { maxDuration: 60 };
const KB = `Yacht Properties (Pty) Ltd. Owner: Sam. Email sam@yachtmaripane.co.za. Phone 063 759 0216.
Address: Falcon Haven, Terenure, 1619 (Kempton Park, Gauteng). Est. 2019. Reg 2019/463037/07.
Credentials: CIDB 10316208 Grade 1 GB; NHBRC 4000003602; PPRA 20237146431; insured via Santam.
Purpose: Stewardship for God's provision to the people less blessed than me. Slogan: We Are You.
Services: property investment; commercial and retail; residential and student housing; construction and general building; industrial and mixed-use; rental and leasing; property and facilities management; project management; tendering and contracting; partnerships and SMME participation.
Vision: diversified property and construction business, sustainable income, long-term asset value, enterprise development, future REIT growth.
Priorities: 40% target project margin; recurring rental income; rural and township development; SMME and subcontractor development.`;
export default async function handler(req: any, res: any) {
  try {
    const { pin, messages } = req.body || {};
    if ((pin || '') !== (process.env.PA_PIN || '4821')) return res.status(401).json({ error: 'bad pin' });
    const msgs = Array.isArray(messages) ? messages.slice(-12) : [];
    if (!msgs.length) return res.status(200).json({ ok: true });
    const gkey = process.env.GROQ_API_KEY;
    if (!gkey) return res.status(503).json({ error: 'GROQ_API_KEY not set' });
    const last = String(msgs[msgs.length - 1].content || '');
    let research = '';
    if (/\b(yes|yep|yeah|sure|brief|tender|research|lead|prospect|go ahead)\b/i.test(last) && process.env.PERPLEXITY_API_KEY) {
      const q = last.length > 25 ? last : 'South Africa construction and property tenders open this week';
      const pr = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.PERPLEXITY_API_KEY },
        body: JSON.stringify({ model: 'sonar', messages: [
          { role: 'system', content: 'Business intelligence researcher for a South African Grade 1 GB construction and property company. Factual, concise, cite sources, include closing dates and links.' },
          { role: 'user', content: q }] })
      });
      const pj: any = await pr.json();
      research = (pj.choices?.[0]?.message?.content || '') + '\nSOURCES: ' + (pj.citations || []).join(' | ');
    }
    const system = 'You are the private business PA for Sam, owner of Yacht Properties. Business only. Use ONLY the knowledge and research below. Never invent facts, numbers, tenders or names. Live website stats are not available in this deployment yet: say so if asked. When giving a brief: tenders with closing dates and links, then one suggested next action. Be concise and plain.\n\nKNOWLEDGE:\n' + KB + '\n\nRESEARCH:\n' + (research || 'none fetched this turn');
    const gr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + gkey },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.3, messages: [{ role: 'system', content: system }, ...msgs] })
    });
    const gj: any = await gr.json();
    if (!gr.ok) return res.status(gr.status).json({ error: gj });
    return res.status(200).json({ reply: gj.choices?.[0]?.message?.content || '' });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
