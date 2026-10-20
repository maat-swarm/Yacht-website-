# YACHT PROPERTIES (PTY) LTD — MASTER SOURCE OF TRUTH
**Document Version:** 2.0.0  
**Updated:** 2026-10-20  
**Classification:** Official Architectural & Operational Specification  
**Status:** PRODUCTION / VERIFIED FULL-STACK APPLICATION

---

## 1. Executive Summary & Corporate Identity

**Yacht Properties (Pty) Ltd** is a premier South African property development, construction, and facilities stewardship enterprise established in 2019. The company operates across Gauteng and the broader South African commercial, residential, and institutional property landscape.

### 1.1 Core Company Genesis & Details
- **Legal Entity Name:** Yacht Properties (Pty) Ltd
- **Registration Number:** 2019/463037/07
- **Year Established:** 2019
- **Managing Director / Principal:** Sam Maripane
- **Headquarters Address:** Falcon Haven, Terenure, Kempton Park, Gauteng, 1619, South Africa
- **Official Telephone:** 063 759 0216 (+27 63 759 0216)
- **Official Email:** sam@yachtmaripane.co.za
- **Corporate Slogan:** *"We are You"*
- **Core Mission & Spiritual Purpose:**  
  > *"Stewardship for God's provision to the people less blessed than me."*  
  Yacht Properties views property development, general contracting, and facilities management not merely as commercial transactions, but as a solemn trust committed to human dignity, disciplined workmanship, and lasting community value.

---

## 2. Statutory Accreditations, Compliance & Regulatory Filings

Yacht Properties maintains verified statutory certifications across South African building, housing, and estate regulatory frameworks:

| Statutory Body | Registration / Reference | Description & Legal Capacity |
| :--- | :--- | :--- |
| **CIDB** (Construction Industry Development Board) | **CRS: 10316208 (Grade 1 GB)** | Certified for General Building works, public infrastructure tenders, provincial maintenance contracts, and commercial alterations. Certificate on file (`/public/certificates/cidb-certificate.pdf`). |
| **NHBRC** (National Home Builders Registration Council) | **Registration: 4000003602** | Enforces structural warranty protection, home builder enrollment, and SANS 10400 building standards for residential developments. Certificate on file (`/public/certificates/nhbrc-certificate.pdf`). |
| **PPRA** (Property Practitioners Regulatory Authority) | **Registration: 20237146431** | Compliant estate agency and property practitioner regulatory oversight governing trust accounts, leases, sales, and ethical mandates. Certificate on file (`/public/certificates/ppra-certificate.pdf`). |
| **Contractor Insurance** | **Santam** | Commercial general liability, contractor works, and all-risk insurance backing site operations. |

---

## 3. Technology Architecture & Runtime Stack

The application is engineered as a high-performance full-stack web application combining a modern React 19 frontend with an Express backend, integrated via Vite middlewares for seamless local development and production container deployment:

### 3.1 Stack Breakdown
- **Runtime Environment:** Node.js 22 (LTS) on Linux x64
- **Web Application Framework:** React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`)
- **Language:** TypeScript 5.7+ (`typescript: ^7.0.2`), strict mode enabled
- **Build & Dev Tool:** Vite 8 (`vite: ^8.3.0`, `@vitejs/plugin-react: ^6.1.1`)
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite: ^4.3.3`, `tailwindcss: ^4.3.3`)
- **Animation & Motion:** Motion v12 (`motion: ^12.23.24`, importing from `motion/react`)
- **Iconography:** Lucide React (`lucide-react: ^0.546.0`)
- **Backend Server:** Express 4 (`express: ^4.21.2`), mounted in `server.ts` with Vite middlewares
- **Execution Port:** Standardized port `3000` (binding to `0.0.0.0:3000`)
- **Server Runner:** `tsx` (`tsx: ^4.21.0`) in development (`npm run dev`), Node.js in production (`npm start`)

### 3.2 Data Layer & Persistence
- **Client & Backend SDK:** `@supabase/supabase-js: ^2.118.0`
- **Database Schema:** PostgreSQL via Supabase
  - Table `leads`: Inbound enquiries from the public contact/quote form
  - Table `site_config`: Key-value storage for live website text (`phone`, `email`, `tagline`)
  - Storage Bucket `gallery`: Public photographic bucket for completed projects and construction folios
- **Resilience Policy:** Graceful offline stubs. If Supabase credentials are not configured or the remote service is unreachable, the server returns rich, pre-configured fallbacks so no client screen ever breaks or white-screens.

### 3.3 Artificial Intelligence & Intelligence Engine
- **Server-Side Gemini SDK:** `@google/genai: ^2.4.0` using model `gemini-2.5-flash`
- **Secondary LLM Provider:** `groq-sdk: ^1.6.0` using model `llama-3.3-70b-versatile`
- **Live Market Research:** Perplexity API (`sonar` model) for querying real-time South African government tenders (`etenders.gov.za`, `cidb.org.za`) and commercial property prospects
- **Safety Policy:** All AI calls are server-side only. If API keys are missing or offline, default quantitative quantity surveyor roadmaps and tender listings are returned immediately.

---

## 4. Visual Design Language, Tokens & Brand Assets

The Yacht Properties visual identity is designed with bespoke South African dignity, avoiding generic template trends in favor of refined architectural gravitas:

### 4.1 Color System (`src/index.css`)
- **Regal Navy (`--color-brand-navy` / `#1B2A6B`):** Dominant grounding structural canvas; evokes deep oceanic authority, executive trust, and institutional longevity.
- **Imperial Purple (`--color-brand-purple` / `#4B1D7A`):** Ceremonial and intellectual accent; symbolizes high stewardship, royal dignity, and visionary leadership.
- **Deep Scarlet (`--color-brand-scarlet` / `#A51C30`):** Authoritative high-intent action color; reserved strictly for primary buttons, urgent milestones, and critical submit actions.
- **Brushed Gold (`--color-brand-gold` / `#C9A24A`):** Precious metal accent; denotes God's provision, premium South African mineral heritage, fine hairline dividers, and ambient halos.
- **Off-White Canvas (`--color-brand-offwhite` / `#F7F6FA`):** Soft, non-glare editorial background.
- **Pure White (`--color-brand-white` / `#FFFFFF`):** High-clarity foreground card surfaces.
- **Primary Text (`--color-brand-text` / `#1A1A2E`):** High-contrast deep slate text meeting WCAG AA accessibility standards.

### 4.2 Typography System
- **Display & Headings:** `Playfair Display` (Serif, weights 500, 600, 700, 800) with tight tracking and balanced measure. Used for hero statements, chapter numbers, and section titles.
- **Body & UI Elements:** `Inter` (Sans, weights 300, 400, 500, 600, 700) with 1.5–1.7 line height for crisp readability at 14px–16px.
- **Telemetry & Financials:** Monospace tabular numerals (`font-mono tabular-nums`) for currency (ZAR `R`), dates, and tender reference codes.

### 4.3 Signature Visual Motifs
- **Living Atmospheric Background (`LivingBackground.tsx`):** Fixed background with tone-shifting opacity, drifting purple/navy gradient orbs, and an animated HTML5 canvas generating fine floating gold dust particles.
- **Gold Rule with Center Diamond (`GoldRule.tsx`):** Hairline separator with an animated center $45^\circ$ rotated square diamond accent.
- **Three-Tier Animated Wave Divider (`AnimatedWaveDivider.tsx`):** Drifting SVG wave vectors in navy, purple, and gold dividing page sections.
- **Hero Emblem Halo Glow (`.hero-halo-glow`):** Soft radial drop-shadow framing the Yacht Properties gold lion & anchor crest.
- **Opening Ceremonial Sequence (`OpeningSequence.tsx`):** Ambient opening screen introducing the brand crest and slogan before fading into the main experience (session-cached and skippable).
- **Desktop Magnetic Cursor (`CustomCursor.tsx`):** Fluid cursor follower with magnetic attraction to interactive buttons and links.

### 4.4 Official Brand Assets (`public/` and `src/assets/`)
- `/public/logo-hero.png` — High-resolution composite crest and typography for hero display
- `/public/logo-wordmark.png` — Horizontal wordmark used across navigation bars
- `/public/logo-emblem.png` — Compact standalone lion & anchor crest used on bottom bars and icons
- `/public/favicon.png` — 32x32 browser favicon
- `/public/certificates/*.pdf` — Downloadable CIDB, NHBRC, and PPRA regulatory certificates

---

## 5. Public Website Structure (`/`)

The public interface is structured as a single-page luxury portfolio with smooth scrolling navigation:

```
[Top Contact Strip]
  └─ Phone: 063 759 0216 | Slogan: We are You | South African Property & Construction
[Header Navigation]
  ├─ Wordmark Logo (sticky shrink transition)
  ├─ Navigation Links: Home · Services · Gallery · Credentials · Contact
  ├─ CTA Button: "Make an Enquiry" (Scarlet)
  └─ Gold Scroll Progress Line (scaleX synced to scrollYProgress)
[Main Content Viewport]
  ├─ 1. Hero Section (#home)
  │     ├─ Floating Hero Logo Card with breathing gold glow and 8s shine sweep
  │     ├─ Staggered Headline Reveal: "We" "are" "You"
  │     ├─ Corporate Summary Paragraph
  │     ├─ Primary Action Buttons: "Make an Enquiry" & "Our Services"
  │     └─ Animated Wave Divider
  ├─ 2. Services Section (#services)
  │     ├─ 3 Primary Pillars: Construction · Property Management · Real Estate Services
  │     ├─ 8 Secondary Offerings: Property Investment, Commercial/Retail, Housing, Industrial,
  │     │  Rental/Leasing, Project Management, Tendering, SMME Participation
  │     └─ Service Scope Checklists with bespoke card hover elevations
  ├─ 3. Project Gallery Section (#gallery)
  │     ├─ Live Folio synced from Supabase Storage `gallery` bucket
  │     ├─ Mobile: Smooth horizontal snap scroll
  │     ├─ Desktop: 3-column architectural grid with hover scale
  │     └─ Fullscreen Lightbox Overlay with keyboard escape and close controls
  ├─ 4. Corporate Purpose Section
  │     ├─ Scripture & Stewardship Foundation: "Stewardship for God's provision..."
  │     └─ Ethical narrative detailing dignity, honest service, and community upliftment
  ├─ 5. Credentials & Regulatory Compliance (#credentials)
  │     ├─ 3 Compliance Shields: CIDB (Grade 1 GB), NHBRC, and PPRA
  │     └─ One-click View/Download triggers for official PDF certificates
  ├─ 6. Project Enquiry & Intelligent Intake (#enquiry)
  │     ├─ Client details input: Full Name, Contact Number/Email, Required Service, Brief
  │     └─ Automated Triage AI modal integration (/api/agent/triage)
  ├─ 7. Contact Section (#contact)
  │     ├─ Falcon Haven physical address, operational hours, direct phone, and email
  │     └─ Interactive Google Maps route trigger
[Footer]
  ├─ Brand emblem, statutory registration recap (2019/463037/07)
  └─ CoreIQ Create attribution and copyright note
[Persistent Interface Elements]
  ├─ BottomBar.tsx: Fixed mobile/desktop launcher for Command Centre (/command)
  ├─ AIAgentChat.tsx: Public "Yacht Concierge" visitor assistant launcher (bottom-left)
  └─ PaPortal.tsx: Private Sam PA executive desk launcher (bottom-right)
```

---

## 6. Executive Command Centre (`/command`)

The **Command Centre** serves as the private operational dashboard for Director Sam Maripane to oversee enquiries, tender intelligence, project photography, and live website settings.

### 6.1 Authentication System
- **Route:** Accessed via direct path `/command` or the bottom bar emblem.
- **Client-Side Gate:** Protected by single password text input verified client-side.
- **Authorized Key:** `Yacht2024`
- **Session Management:** Stores authenticated state in `sessionStorage` under key `yacht_cmd` with an 8-hour expiry timestamp (`Date.now() + 28800000`).
- **Lock Control:** Dedicated `Lock` action immediately destroys session storage and returns to the secured entry gate.

### 6.2 Executive Dashboard Structure (5 Modules)
1. **Module 1 — Concierge & Executive PA:**
   - Full-width interface to interact with Yacht Concierge and private PA intelligence.
   - Live counters displaying site visits, visitor chats, and project triage submissions.
   - Quick-trigger market research queries grounded in South African CIDB contracting.
2. **Module 2 — Inbound Client Leads:**
   - Real-time client enquiry pipeline synced from Supabase table `leads`.
   - Displays client name, contact details, requested service category, and project notes.
   - Instant 1-click status cycling: `New` (Scarlet) $\rightarrow$ `Reviewed` (Gold) $\rightarrow$ `Actioned` (Green).
   - Direct `tel:` and `mailto:` action shortcuts.
3. **Module 3 — Project Gallery Manager:**
   - Visual media manager interfacing with Supabase storage bucket `gallery`.
   - Drag-and-drop or file selector photo uploader with in-memory validation.
   - Live photo thumbnail grid with direct deletion confirmation.
   - Live updates immediately reflected in public `#gallery` section.
4. **Module 4 — CIDB Grade 1 GB Tender Intelligence:**
   - Curated tender radar scanning South African government notices (Health clinics, GDE schools, Ekurhuleni municipal works, NSFAS student housing).
   - 30-minute memory cache preventing unnecessary LLM inference.
   - Direct external search links to find and download tender documents on eTenders portal.
   - Urgency visual flags for tenders closing within 14 calendar days.
5. **Module 5 — Live Site Content Controls:**
   - Direct real-time text modifiers for:
     - `phone`: Primary company contact number
     - `email`: Official executive email
     - `tagline`: Public hero summary text
   - Synced via Supabase table `site_config` with animated save confirmations.

---

## 7. AI Assistants & Autonomous Agent Workflows

Two strictly partitioned AI agents operate within the codebase to prevent data contamination:

### 7.1 Yacht Concierge (Public Visitor Assistant)
- **Component:** `src/components/AIAgentChat.tsx`
- **Backend Route:** `POST /api/chat`
- **Persona & Guardrails:** Professional, warm, grounded. Answers strictly from official Yacht Properties factual parameters (Falcon Haven address, 2019 founding, CIDB/NHBRC/PPRA credentials, 10 primary services).
- **Strict Anti-Hallucination Policy:** If asked for unlisted pricing, staff names, or speculative projects, it directs visitors directly to Sam (063 759 0216 / sam@yachtmaripane.co.za).

### 7.2 Sam's Executive PA (Private Desk Intelligence)
- **Component:** `src/components/PaPortal.tsx` and Command Centre Tab 1
- **Backend Route:** `POST /api/pa/chat`
- **Knowledge Base:** Sourced from `/pa/sam.md`
- **Workflow:** When prompted for tenders, leads, or briefings, queries Perplexity API (`sonar`) for live South African construction notices, combines citations with in-memory live website stats, and generates a structured executive briefing.

### 7.3 Automated Project Triage & Estimation Agents
- **`POST /api/agent/triage`:** Analyzes prospective client scopes and outputs structured JSON containing Project Tier (Tier 1 Minor to Tier 3 Major Infrastructure), statutory requirements (CIDB Grade 1 GB, NHBRC enrollment), 4-phase milestone timeline, risk rating, and priority dispatch.
- **`POST /api/agent/estimate`:** Calculates indicative project timeline in weeks, essential trade packages (Earthworks, Structural Masonry, Roofing, MEP), and statutory sign-off gates.
- **`POST /api/prospects`:** Business development prospecting agent generating 5 realistic South African target organisations (Ekurhuleni Human Settlements, GPF, Growthpoint, Transnet) with custom pitch messages.

---

## 8. Complete Backend API Route Reference (`server.ts`)

| HTTP Method & Path | Auth / Role | Description |
| :--- | :--- | :--- |
| `GET /api/health` | Public | System status, model identifier, and Supabase/AI readiness flags. |
| `POST /api/health` | Public | Dual health check endpoint for monitoring probes. |
| `POST /api/pa-auth` | Protected | Validates executive PIN for standalone PA Portal. |
| `POST /api/track` | Public | Increments in-memory site visit telemetry for PA briefings. |
| `GET /api/gallery` | Public | Returns array of images `{ name, url }` from Supabase storage bucket `gallery`. |
| `POST /api/gallery/upload` | Executive | In-memory Multer image upload (up to 15MB) storing to Supabase `gallery`. |
| `DELETE /api/gallery/:filename` | Executive | Deletes designated photo from Supabase `gallery` bucket. |
| `GET /api/leads` | Executive | Returns all captured project briefs ordered by `created_at DESC`. |
| `PATCH /api/leads/:id` | Executive | Updates enquiry status (`new`, `reviewed`, `actioned`). |
| `GET /api/tenders` | Executive | Fetches 8 active CIDB Grade 1 GB construction tenders with 30m cache. |
| `GET /api/content` | Public | Retrieves site config values (`phone`, `email`, `tagline`). |
| `PATCH /api/content` | Executive | Upserts site config key-value parameters. |
| `POST /api/chat` | Public | Yacht Concierge conversational stream using Gemini or Groq fallback. |
| `POST /api/pa/chat` | Executive | Private executive briefing combining live stats and Perplexity research. |
| `POST /api/research` | Executive | Perplexity Sonar research prober for South African tenders. |
| `POST /api/agent/triage` | Public | Quantitative project classification and regulatory milestone roadmap. |
| `POST /api/agent/estimate` | Public | Square meter to milestone duration estimation engine. |
| `POST /api/prospects` | Executive | Business development prospecting prober with drafted intro outreach. |

---

## 9. Environment Variables & Secret Management

All sensitive secrets live exclusively in server environment variables and are never committed to public version control:

```bash
# Server & Port
PORT=3000

# Executive Access PIN (PA Portal)
CMD_PIN=2024

# AI Model Inference (Server-Side Only)
GEMINI_API_KEY=               # Google Gemini API key
GROQ_API_KEY=                 # Optional secondary Groq LLM key
PERPLEXITY_API_KEY=           # Optional live tender research prober key

# Supabase Cloud Database & Storage
VITE_SUPABASE_URL=            # Public Supabase project URL
VITE_SUPABASE_ANON_KEY=       # Public Supabase anon client key
SUPABASE_SERVICE_ROLE_KEY=    # Private service role key for backend storage admin
```

---

## 10. Operational Guidelines & Developer Verification

1. **Local Build & Verification:**
   - Lint & Typecheck: `npm run lint` (`tsc --noEmit`) must report 0 errors.
   - Production Compilation: `npm run build` (`vite build`) must compile cleanly.
   - Full-stack Execution: `npm run dev` boots Express + Vite on `http://0.0.0.0:3000`.
2. **Design Integrity Rules:**
   - Never replace the custom company persona, registration details, or Falcon Haven address.
   - Maintain the Playfair Display serif + Inter sans typographic hierarchy.
   - Preserve zero-pill metadata discipline and high-contrast WCAG AA legibility.
   - Always ensure offline fallback safety so no service disruption can cause blank screens.
