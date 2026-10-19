# YACHT PROPERTIES WEBSITE + AI AGENT - SOURCE OF TRUTH
Updated: 2026-10-19 | Author: Claude Forge Jnr | Status: LIVE, PARTIAL

## 1. What this is
Client site for Yacht Properties (Pty) Ltd (owner Sam, South Africa), built by CoreIQ Create as a live demo of CoreIQ's AI capability.
- Repo: github.com/maat-swarm/Yacht-website- (PUBLIC - never commit secrets)
- Live: https://yacht-website-six.vercel.app (Vercel, auto-deploys from main)
- Local: ~/yacht (Termux). Stack: React + Vite + TypeScript + Tailwind, Express (server.ts, dev only), Vercel serverless functions (api/).
- Build: npm run build. Lint (tsc) fails on Termux ARM64 (non-fatal platform issue) - skip it locally.
- .npmrc sets legacy-peer-deps=true (needed: Vite 8 vs esbuild peer conflict on Vercel).

## 2. Two assistants - KEEP SEPARATE
### 2a. Yacht Concierge (visitors, public)
- UI: floating "Ask AI Agent" launcher + chat panel (src/components/AIAgentChat.tsx, FloatingAgentLauncher.tsx), bottom-left.
- API: POST /api/chat -> api/chat.ts (Groq llama-3.3-70b-versatile, system prompt copied from server.ts YACHT_SYSTEM_PROMPT).
- Also in panel: triage/intake modal (/api/agent/triage, /api/agent/estimate) and prospect finder (/api/prospects). The PA tab was removed from this panel.
### 2b. Sam's PA (private)
- UI: CoreIQ logo button, bottom-RIGHT, above scroll-up (src/components/PaPortal.tsx). Tap -> PIN -> full-screen chat. Opens with "Hi Sam... want a brief on the research I've done?"
- API: POST /api/pa/chat (rewrite in vercel.json) -> api/pa-chat.ts. PIN checked server-side against env PA_PIN. Knowledge base is embedded in api/pa-chat.ts (mirror of pa/sam.md).
- Flow: Groq answers; when Sam says yes/brief/tender/research/leads, Perplexity (sonar) is called first and its answer + citations are fed to Groq.
- Business only. Must not hold personal data about Sam. Never exposed in the visitor chat.

## 3. Environment variables (Vercel -> Settings -> Environment Variables)
GROQ_API_KEY, PERPLEXITY_API_KEY, PA_PIN. Redeploy after any change. Values live ONLY in Vercel. api/pa-chat.ts still contains a fallback PIN default - remove it.

## 4. Verified working (2026-10-19)
- Site live, builds clean on Vercel.
- PA logo -> PIN prompt -> PA window opens (verified on device).
- Standalone functions deploy (api/pa-chat.ts, api/track.ts, api/chat.ts).

## 5. Known broken / unverified
- FIXED IN CODE, UNVERIFIED LIVE: api/pa-chat.ts after standalone move (previous server.ts-based function returned FUNCTION_INVOCATION_FAILED). Test: PA -> "Yes".
- UNVERIFIED: api/chat.ts (visitor chat). Test: site chat -> "Hi".
- BROKEN ON VERCEL: /api/agent/triage, /api/agent/estimate, /api/prospects, /api/research, /api/pa-auth exist only in server.ts, which crashes as a serverless function. Each needs its own api/*.ts file (copy the pattern from api/chat.ts), or the triage modal and prospect finder will error live.
- api/track.ts is a stub: website visit stats are NOT counted. PA cannot report visits/leads yet.
- Express server.ts still exports app and skips listen on Vercel; it is only used locally (npm run dev).

## 6. TO DO (priority order)
1. Verify PA chat and visitor chat live; fix from the on-screen error text (PaPortal shows real HTTP errors).
2. Port remaining routes to standalone functions: triage, estimate, prospects, research.
3. Real stats for the PA: create a Supabase project (free), table visits/chats/leads; api/track.ts and api/chat.ts write to it; api/pa-chat.ts reads counts for the brief. Do NOT fake numbers.
4. Lead capture: triage modal and quote requests must store to Supabase and notify Sam (email/WhatsApp). Do not claim "Sam will be in touch" until storage is real.
5. VISUAL UPGRADE (assigned to another node, e.g. Google AI Studio): PaPortal.tsx is functional but ugly - redesign as a polished chat-app interface (header, bubbles, typing indicator, tender cards with source links, brief card, mobile-first). Keep the PIN flow and /api/pa/chat contract unchanged. Also polish the CoreIQ logo launcher and overall site visuals.
6. Remove PIN/passphrase fallbacks from code; rotate Groq/Perplexity keys that were pasted in chat.
7. Proactive PA: on unlock, auto-run tender scan and show cards (currently only runs when Sam replies yes).
8. Scheduled daily brief (Vercel cron) delivering to Sam.
9. Real project photography / showcase content once supplied by Sam. No invented projects, clients or testimonials.

## 7. Rules
- AI only: both assistants are LLM-driven (Groq, Perplexity). No scripted chatbots.
- Facts only from the knowledge base. Never invent prices, tenders, names or stats.
- Secrets never in the repo (it is public). Server-side env vars only.
- Visitor chat must never open the PA. PA is PIN-gated and separate.
- The Concierge discloses "powered by CoreIQ Create" naturally when asked about the AI.

## 8. Company facts (public, already on the site)
Yacht Properties (Pty) Ltd, est. 2019, reg 2019/463037/07, Falcon Haven, Terenure, 1619 (Kempton Park). Phone 063 759 0216, sam@yachtmaripane.co.za. CIDB 10316208 Grade 1 GB, NHBRC 4000003602, PPRA 20237146431, Santam insured. Purpose: stewardship for God's provision to the people less blessed than me. Slogan: We Are You. Ten services: property investment, commercial and retail, residential and student housing, construction and general building, industrial and mixed-use, rental and leasing, property and facilities management, project management, tendering and contracting, partnerships and SMME participation.

## 9. Windows/Termux working rules
- Patch files with Python str.replace, never sed on multiline.
- Git push uses remote URL with PAT (maat-swarm account owns the repo).
- Build must pass before every commit.
