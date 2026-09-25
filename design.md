# Strategic Machines — Marketing Site Design

**Working title:** strategicmachines.ai (placeholder domain)
**Product being sold:** subscriptions to the Cypress Resort Guest Experience Platform — booking, payments, AI concierge, and operations, in one system.
**Status:** DESIGN — not yet built. This doc is the spec to approve before any code lands in `src/`.
**Stack confirmed against current scaffold:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · pnpm. Nothing else is installed yet — shadcn/ui, a motion library, and Supabase all need to be added.

---

## 0. Positioning, in one paragraph

Strategic Machines builds the operating system for boutique and luxury hospitality — the same engine now running Cypress Resort in production. This site sells the platform as a **subscription product**, not a portfolio piece: one company, one flagship customer proving it works, a clear feature story, and a waiting list ahead of general availability. The tone is closer to Linear, Stripe, or Vercel's own marketing than a typical hospitality vendor site — precise, dark, confident, technical — with just enough resort warmth (light sections, a gold accent) to remind the visitor what the software actually runs: real guests, real rooms, real money.

---

## 1. Brand pillars → design decisions

| Pillar | What it means here | How the design expresses it |
|---|---|---|
| **Innovation** | AI concierge, real-time experience matching, a modern rebuilt platform (Gen-2) | Dark canvas, animated gradient mesh, live interactive concierge demo, monospace "systems" labels, motion-on-scroll throughout |
| **Trust** | Handles guest payments and PII; a real resort depends on it today | Visible partner/infra logos (Stripe, Supabase, Vercel), a named production customer with concrete numbers, security/compliance messaging, restrained motion (nothing gimmicky near pricing/payment copy) |
| **Commitment** | Not a demo — a live, operated platform with a real roadmap and release date | Countdown to GA, "Live in production at Cypress Resort" badge, changelog/roadmap teaser, waitlist with confirmed email flow |
| **Ability** | Deep engineering: ledger-accurate finance, tax engine, cancellation policy engine, rate engine | A "How it works" architecture section that names the engines (in plain-English, marketing-safe form), a stats bar with real, defensible numbers, code-flavored visual details (mono type, terminal-style snippets) |

---

## 1b. Competitive grounding — Innspire, and where we deliberately diverge

Innspire (innspire.com) is the closest real competitor and a genuinely strong site — it's the working reference for this design, not something to imitate line-for-line. Pulled directly from their site for grounding:

- **Their hero:** "Do what you do. Better." / "One AI layer across 100+ hotel systems, handling every operational task so your team is free to do what technology never will: genuine hospitality."
- **Their guest-journey pitch:** a live "Blossom" AI concierge demo, passport scan + face match + Apple Wallet key, framed as "The whole guest journey. Held together by one intelligence."
- **Their ops pitch:** "AI Hotel Operations... 100+ integrations... ~80% of guest requests resolved automatically," built around "more revenue, lower cost, less risk."
- **Their integrations page:** categorized tabs (PMS, POS, Door Locks & Digital Keys, Payments & Identity, Guest Room Management, Guest Service & Ticketing, TV & Entertainment, Chat, Audio, AI Voice) — a strong information-architecture pattern, reused in §5.5b with our own honestly-scoped content.
- **Their pricing:** an AI-agent-shaped ladder (Text Journey → AI Concierge → Guest Flows), each tier literally named after what the AI does, plus per-message metering on top of the plan fee and a one-time go-live fee.

**What we take, reshaped, not copied:** the agent-centered pricing ladder (§5.9), the categorized integrations-tabs pattern (§5.5b), and the "live, feel-it-yourself" concierge demo (§5.6 — we already had this planned before comparing sites, which is a good sign the instinct was right).

**Where we deliberately differ, and why it's the better story for us specifically:**
1. **We're the system of record, not a bolt-on layer.** Innspire's whole pitch is "don't replace, integrate" — because they aren't a PMS/booking/payments engine. We are. That's a stronger trust claim (one ledger, one price, everywhere — §4 of the platform's own engineering rules) and §5.5b says so plainly instead of borrowing their "untouched stack" framing.
2. **"Genuine hospitality" stays our phrase, reframed as engineering, not automation-first.** Innspire's copy centers *automation* ("AI agents handle the repetitive work") with hospitality as the leftover. Ours centers *hospitality* as the goal the engineering serves — same underlying truth, opposite emphasis, which is why the hero (§5.2) leads with "engineered," not "automated."
3. **No metered-messaging anxiety.** §5.9's "unlimited concierge conversations, no per-message bill" is a direct, respectful improvement on a real weak point in their pricing page — a luxury guest experience shouldn't come with a usage meter running underneath it.
4. **One named, real customer beats a logo wall.** Innspire leans on "the world's best hotels run on Innspire" plus aggregate stats. Pre-GA, we have exactly one production customer — so §5.8 leans into that as a strength ("Customer № 001," full case study) rather than trying to look bigger than we are.

---

## 1c. Competitive landscape — the boutique AI-concierge market

Pulled directly from each vendor's own site for grounding (one, ITZA, was unreachable at fetch time — included from the brief you supplied, unverified, and marked accordingly). Organized in the same three tiers you laid out, because that structure is the right one: it maps to three genuinely different buyer decisions, not one flat competitor list.

### Tier 1 — Closest specialists (bolt-on AI messaging/concierge layer)

All six require the property to already run a separate PMS, booking engine, and payment processor; the product is the conversational/messaging layer synced on top.

| Vendor | Their own pitch | Where they're strong | Where Strategic Machines wins |
|---|---|---|---|
| **Visito** | "Better customer conversations with AI" — WhatsApp/Instagram/web chat, live PMS rates, Stripe payment in-chat, 70–94% automation | Fast to deploy on top of an existing stack; strong LatAm/Europe WhatsApp-culture fit | No ledger of its own — price shown in chat and price charged by the PMS are two systems that can silently disagree. We own both. |
| **Asksuite** | "The all-in-one AI and communication platform" — 250–400+ booking-engine coverage, "#1 Hotel Chatbot" 7 years running, 23x ROI, 147M travelers served | Category leader by volume and reviews; broad booking-engine compatibility | Wins on *scale of adoption*, not depth of guest experience — no experience-discovery layer, no native folio/ledger. Boutique buyers who want one system, not a chatbot bolted onto their old one, don't fit its story. |
| **HiJiffy** | "One Platform for Every Guest Conversation" — 90% automation, human handoff with context, "Secure AI specialised in Hospitality," 2,600+ hotels | Strong anti-hallucination/guardrail messaging — a real trust angle worth studying | Same structural gap: a communications hub, not a booking/payments system of record. Their "secure AI" framing is worth matching in our own concierge copy. |
| **Myma.ai** | "One AI Platform to Power Every Guest Interaction" — unifies WhatsApp/SMS/OTA/email, integrates with Opera/Mews/Cloudbeds | Genuinely good omnichannel conversation quality; explicit boutique/resort positioning | Explicitly *integrates with* Mews/Cloudbeds rather than being one — confirms the whole tier's shared weakness. |
| **Guestivo** | "Guests don't call room service. Now they don't have to." — QR-first portal, AI menu import, no-app ordering, <80-room focus | Very fast, very cheap to deploy for a small independent; genuinely good at the narrow room-service/requests job | Narrow by design (ordering + requests) — no booking, no payments engine, no concierge conversation. Not a real platform competitor, more a feature we should make sure we cover natively (we do, via the catalog/order engine). |
| **HiLucy** | "Your guests text. Lucy handles the rest." — WhatsApp-first, location-aware QR routing, spans concierge/bookings/payments/comms | Zero-friction channel (WhatsApp guests already have); location-aware QR routing is a nice detail worth borrowing conceptually | Claims to span "bookings and payments" but sits on Cloudbeds-class stacks underneath — same fragmentation risk as the rest of this tier. |

### Tier 2 — Broader guest-experience platforms (win larger boutique/group deals)

| Vendor | Their own pitch | Where they're strong | Where Strategic Machines wins |
|---|---|---|---|
| **Canary Technologies** | "Built for Hospitality, Powered by AI" — mobile check-in, digital tipping, "4x upsell conversions," 20,000+ hotels incl. Marriott/Wyndham/IHG | Enterprise-grade trust (major chains), broad PMS/CRM/payment integration, strong ops-automation story | Built to serve chain-scale portfolios first; boutique/luxury nuance (calendar-rule-pinned cancellation policy, real-time local experience curation) isn't the focus. Gets "more dangerous as the property or group gets larger," per your own read — correct, and worth designing our messaging to *not* compete on that axis. |
| **Duve** | "Personalized hospitality, at scale." — pre-arrival check-in, personalized upsells, 150+ integrations, guest analytics | Strong branded in-stay app experience and ancillary-revenue focus — closest of the bunch to our "experience showcasing" pitch | Still an app/messaging layer over a separate PMS+payments stack (150+ *integrations*, not one owned ledger). Our experience-discovery story can out-execute theirs precisely because pricing/availability/booking are native, not synced. |
| **Innspire** | Covered in full in §1b | — | — |

### Tier 3 — All-in-one PMS + booking + payments + AI (own the stack, our real long-term rivals)

| Vendor | Their own pitch | Where they're strong | Where Strategic Machines wins |
|---|---|---|---|
| **Cloudbeds** | "Not your average PMS. The growth engine built for your ambition." — Signals AI (4B+ data points/hr, 95% forecast accuracy), 450+ integration marketplace, 25% more direct bookings | Real horizontal scale, genuinely strong revenue-management AI (forecasting/pricing), huge integration marketplace | Signals is a *forecasting/BI* AI, not a guest-facing concierge — built for any property type, budget to luxury, so boutique/luxury guest-experience depth (curated local experiences, white-glove policy handling) is not the product's center of gravity. |
| **Mews** | "The operating system for modern hotels" — 1,000+ app marketplace, open API, 45% direct-booking increase, 93% support-call reduction | Modern, well-loved by lifestyle/boutique properties already; genuinely open API architecture (closest to our own "open by design" story, §5.5b) | A general-purpose hotel OS with an app marketplace for AI, not an AI-native concierge experience out of the box — depth here is opportunity, not disqualifying. Realistically the incumbent whose *architecture philosophy* is most similar to ours. |
| **Hotelary.ai** | "The AI-native hotel operating system" — multi-agent reservations, WhatsApp-first, 17-second median reply, zero-downtime PMS migration | Structurally the closest thing to us in the entire list: AI-native, owns the stack, not a bolt-on. Early but architecturally the right threat to watch | Earlier-stage, WhatsApp-first (channel bias, as with Tier 1), no visible luxury/boutique experience-curation story yet, no named flagship customer at Cypress Resort's caliber. This is the one to watch closest as the market matures — not the one to spend hero-copy fighting today. |

### Also watching (early-stage / thin public information)

- **Worldie.ai** — tagline only ("AI Growth Infrastructure"); used by at least one Wyndham-affiliated resort per your brief. Too little public detail to position against yet.
- **ITZA** — site unreachable at fetch time; per your brief, explicitly marketed as AI concierge + upsells for boutique hotels. Worth a manual look before publishing any claim that references it directly.

### Strategic holes — where Strategic Machines should stake its claim

Six real, defensible wedges fall out of the pattern above, not just against Innspire:

1. **The fragmentation tax is universal in Tier 1, and it's the exact bug the platform itself was rebuilt to kill.** Every bolt-on concierge/messaging vendor (Visito, Asksuite, HiJiffy, Myma, HiLucy, Duve, Canary, Innspire, Guestivo) quotes a price or takes a request in *their* system while a *separate* PMS/booking engine holds the truth. That's the "tax calc implemented three ways, guest quoted one price, charged another" problem this platform's own engineering rules (`CLAUDE.md` §0) exist to prevent. No competitor above can claim "one ledger, one price, everywhere" without rebuilding their core — we already have. **This is the single sharpest, most ownable line in all of our messaging** and should appear near the top of `/platform`, not buried.
2. **Don't fight the volume-and-logos war — we'd lose it and it's not actually our pitch.** Asksuite (147M travelers, 2B+ messages), HiJiffy (2,600+ hotels), Canary (20,000+ hotels, Marriott/Wyndham/IHG) are all playing a "trust by scale" game pre-GA we cannot and should not try to match. §5.8's "Customer № 001" framing is correct — lean harder into it: precision and proof (a real, named, verifiable case study) beats an aggregate stat nobody can check.
3. **Channel bias is a real, unclaimed gap.** Visito, HiLucy, Myma, Asksuite, HiJiffy, and Hotelary.ai are built WhatsApp-first — a strong fit for LatAm/European/Asian guest bases, a weaker instinct for a US luxury-resort guest who expects the concierge to live *inside* the booking/stay experience (web, and eventually voice), not in a separate chat app. Worth a line in `/concierge`: the concierge is part of the platform's own surface, not a third-party messaging bridge.
4. **Nobody in Tier 1 or Tier 2 owns experience discovery as a merchandising layer.** Guestivo and Duve get closest (menu/upsell tooling), but "real-time local experiences and highlights, matched to the guest" (feature #4, §5.4) isn't anyone's headline claim. This is genuine whitespace — it should stay a primary feature pillar, not get folded into "upsells."
5. **Mews and Hotelary.ai are the real long-game threats, not Innspire.** Mews shares our "open, owns-the-stack" architecture philosophy; Hotelary.ai shares our "AI-native, not bolted-on" philosophy. Neither has our specific combination (owned ledger + native concierge + experience curation + a named luxury/boutique flagship). Track both, but don't spend homepage copy addressing either by name — they're not who a boutique buyer is comparing us to on the page, yet.
6. **Unmetered concierge pricing (§5.9) is a differentiator against the whole market, not just Innspire** — Tier 1's business model is largely volume/message/conversation-based (this is *how* they monetize the bolt-on layer), so "no per-message bill" reads as a genuine platform-level contrast, not a one-competitor jab.

---

## 2. Visual system

### 2.1 Color

Two registers: an **Obsidian** (dark, default) register for anything about the technology, and a **Daylight** (light) register used sparingly for resort/experience content — so switching registers itself signals "software" vs "guest experience" as you scroll.

```
--sm-obsidian:      #0A0A0C   /* primary background */
--sm-obsidian-2:    #121216   /* raised surface / card */
--sm-obsidian-3:    #1B1B21   /* border / hairline on dark */
--sm-ivory:         #F6F4EF   /* daylight background */
--sm-ivory-2:       #FFFFFF   /* daylight card */
--sm-ink:           #0E0E10   /* text on ivory */
--sm-fog:           #A9A9B2   /* secondary text on dark */
--sm-mist:          #6B6B76   /* secondary text on light */

--sm-aurora-violet: #7C5CFC   /* primary accent, gradient start */
--sm-aurora-cyan:   #22D3EE   /* primary accent, gradient end */
--sm-signal-green:  #34D399   /* success / "live" status dot */
--sm-gold:          #C9A227   /* luxury accent — used sparingly: CTAs, case study, pricing highlight */
```

- **Aurora gradient** (`violet → cyan`) is the single recurring "innovation" motif: hero glow, active nav underline, primary button, chart lines, the concierge demo's speaking indicator.
- **Gold** is reserved for exactly three things: the "Cypress Resort — Customer №1" badge, the highlighted pricing tier, and the waitlist CTA button. Overusing it dilutes the resort cue.
- Everything else is grayscale. No secondary "brand blue" — one gradient, disciplined.

### 2.2 Typography

- **Geist Sans** (Vercel's typeface, via `next/font/google` or the `geist` npm package) for all UI and headings — it's free, variable, and doubles as a subtle nod to the Vercel partnership.
- **Geist Mono** for eyebrows, labels, stats, nav item numbers, timestamps, the concierge demo transcript, and the countdown clock. This is the "engineering credibility" signal — small caps, wide letter-spacing, low opacity.
- Scale (Tailwind v4 theme tokens): `text-xs` (12) → `text-8xl` (96) with a fluid hero clamp: `clamp(2.75rem, 6vw, 6.5rem)` for the H1 only, so it scales smoothly instead of jumping at breakpoints.
- Headings: tight tracking (`-0.02em`), 600–700 weight. Body: 400 weight, 1.6 line-height, `--sm-fog` / `--sm-mist` for secondary copy — never pure gray-500 defaults.

### 2.3 Surface & depth

- Cards on dark = 1px hairline border (`--sm-obsidian-3`) + very subtle `backdrop-blur` + a barely-visible inner gradient (glass, not glassmorphism-heavy — restrained, à la Linear/Vercel, not frosted-2021).
- No drop shadows on dark sections (shadows read badly on near-black); use border + glow instead. Light sections use soft, large-radius shadows (`shadow-xl shadow-black/5`).
- Corner radius: `rounded-2xl` (16px) standard for cards, `rounded-full` for pills/badges/buttons — one consistent radius language, no mixing 4px and 24px.

### 2.4 Motion language

Motion is the primary "shockingly cool" lever, so it needs rules, not vibes:

| Pattern | Where | Behavior |
|---|---|---|
| **Fade-up reveal** | Every section on first scroll into view | `opacity 0→1`, `translateY 24px→0`, 500ms ease-out, staggered 60–80ms per child (headline → subhead → CTA → visual) |
| **Parallax drift** | Hero background mesh/orbs, section dividers | Background layer moves at 0.3–0.5× scroll speed vs. foreground content at 1×; implemented with `useScroll`/`useTransform`, not raw scroll listeners |
| **Aurora mesh** | Hero + footer CTA background | Slow-drifting animated gradient blobs (CSS `@property` + keyframes, or a lightweight canvas), looping ~20s, never distracting, pauses on `prefers-reduced-motion` |
| **Logo marquee** | Partners carousel, customer strip | Infinite horizontal scroll, pause-on-hover, duplicated track for seamless loop |
| **Magnetic CTA** | Primary buttons only | Button subtly follows cursor within a small radius on desktop pointer devices; no-op on touch |
| **Live counters** | Stats bar, case study numbers | Count up from 0 once in view, ~1.2s, ease-out |
| **Concierge typing** | AI demo | Token-by-token reveal to simulate a live model response |

Library choice: **Motion** (the `motion` package, formerly Framer Motion) — the standard for React/Next scroll-linked animation, tree-shakeable, works cleanly with the App Router and Server Components (client components only where animated). All motion respects `prefers-reduced-motion: reduce` (swap to instant fades, kill parallax/mesh drift).

### 2.5 Iconography & imagery

- Icons: `lucide-react` (shadcn's default) — consistent stroke weight, no icon-set mixing.
- No stock hotel photography on dark sections — it always looks cheap against near-black. Product surfaces (real or high-fidelity mocked screenshots of the booking flow, admin portal, concierge chat) carry the visual weight instead, framed in browser/device chrome.
- Photography (real resort imagery) is reserved for the **Experience Showcasing** and **Cypress Resort case study** sections, on Daylight (ivory) backgrounds, full-bleed, high quality only — this is where "luxury resort" needs to actually look luxurious.

---

## 3. Architecture & component strategy

### 3.1 Additions needed to the current scaffold

- `shadcn/ui` (init with the "new-york" style, Geist as base font, Tailwind v4 config) — provides Button, Card, Badge, Dialog, Tabs, Accordion, Input, Form, Sonner (toasts), Separator, Avatar, Carousel primitives. Every custom component is built **on top of** these, never duplicating what shadcn already gives us.
- `motion` (animation)
- `@supabase/supabase-js` + `@supabase/ssr` — for the waitlist write and (later) the "watch the concierge demo live" or admin preview, if any.
- `zod` + `react-hook-form` — waitlist form validation, paired with shadcn's `Form`.
- `resend` (or reuse the platform's existing mail provider pattern) — waitlist confirmation email, kept as a single provider seam exactly like `packages/communications` does in `ts-platform`, so the pattern is familiar if this ever needs to move server-side into the monorepo.

### 3.2 Component layering (mirrors the "thin client, one source of truth" discipline from `ts-platform`)

```
src/
  app/
    layout.tsx                 root shell: fonts, ThemeProvider, <Navbar/>, <Footer/>
    page.tsx                   Home — composes <section> components only, no logic
    platform/page.tsx          deep dive: booking, payments, admin portal
    concierge/page.tsx         AI concierge demo, full page
    pricing/page.tsx           subscription tiers
    customers/
      page.tsx                 customer index (future multi-logo page)
      cypress-resort/page.tsx  full case study
    company/page.tsx           about Strategic Machines
    waitlist/                  API route + confirmation page
    sitemap.ts / robots.ts     generated, App Router native
  components/
    ui/                        shadcn primitives (generated, don't hand-edit)
    marketing/                 composed, reusable marketing blocks (see §7)
    motion/                    small motion primitives: <FadeUp/>, <Parallax/>, <Marquee/>, <MagneticButton/>, <CountUp/>
  lib/
    supabase/                  one browser client, one server client — same "single client seam" rule as ts-platform's db()
    waitlist.ts                zod schema + submit fn
    seo.ts                     shared metadata builders, JSON-LD builders
  content/
    features.ts, stats.ts, partners.ts, faq.ts   — copy as typed data, not hardcoded JSX, so sections stay reusable across pages
```

**Rule carried over from the platform's own engineering discipline:** copy and structured data (features, stats, partner logos, pricing tiers, FAQ) live in typed content files under `content/`, and section components render that data. This keeps every section reusable (the same `<FeatureGrid features={...}/>` can render different feature sets on `/` and `/platform`) and keeps marketing edits out of component code.

---

## 4. Sitemap

| Route | Purpose |
|---|---|
| `/` | Full narrative — hero → trust bar → features → platform tour → AI concierge teaser → experience showcase → case study → pricing → waitlist CTA → FAQ |
| `/platform` | Deep technical/feature tour (booking, payments, admin, engines) for evaluators who scrolled past the summary |
| `/integrations` | Full integrations grid (§5.5b), "Live" vs "Roadmap" status, open API pitch |
| `/concierge` | Standalone, full AI concierge interactive demo |
| `/radio` | Radio Concierge AI — episode index, NotebookLM-generated audio cast (§5.6b) |
| `/pricing` | Subscription tiers, comparison table, FAQ |
| `/customers/cypress-resort` | Full case study page |
| `/company` | Strategic Machines story, mission, contact |
| `/waitlist` (route handler) | POST endpoint → Supabase insert + confirmation email |
| `/legal/privacy`, `/legal/terms` | Required for a payments-adjacent product collecting emails |

`/` carries 80% of conversion weight; the rest exist so paid/organic traffic has a landing target that matches intent (e.g., a "Stripe integration" search lands better on `/platform` than the homepage).

---

## 5. Homepage, section by section

### 5.1 Navbar (sticky, all pages)

- Left: Strategic Machines wordmark/logo (see §9 asset note).
- Center/left nav: `Platform` · `Integrations` · `Concierge AI` · `Pricing` · `Customers` · `Company`. (`Radio Concierge AI` is deliberately *not* in primary nav — it lives in the footer `Resources` column and inline after the concierge demo, so it reads as a bonus content asset, not a core product tab.)
- Right: `Sign in` (ghost, for future customer portal) + `Join Waitlist` (primary, gradient-bordered pill — the one recurring CTA, same label everywhere on the site).
- Transparent over hero, gains a blurred dark surface (`backdrop-blur-lg bg-obsidian/70`) + hairline bottom border after ~40px scroll.
- Mobile: sheet drawer (shadcn `Sheet`), same two CTAs pinned at the bottom.

### 5.2 Hero

- Eyebrow (mono, small caps, aurora dot): `● LIVE IN PRODUCTION AT CYPRESS RESORT`
- H1 (fluid clamp, two lines) — **primary pick:** **"Genuine hospitality, engineered."** — deliberately the inverse framing of the "automate everything" competitor pitch: the machine work disappears so the *human* work is what's left, which is the point, not a side effect. Alternates, same family, pick in review:
  - **"Let the system carry the checklist. Let your people carry the welcome."**
  - **"Every touchpoint, one intelligence. Every guest, still met by a person."**
- Subhead: one sentence — booking, payments, and an AI concierge, unified, built for boutique and luxury hospitality, so staff spend their time on the parts hospitality is actually for.
- Two CTAs: `Join the Waitlist` (gold, primary) · `Watch the Concierge Demo` (ghost, plays inline video or scrolls to §5.6).
- Background: Aurora mesh gradient, slow parallax drift, very dark, large soft blobs — no photography here.
- Below the fold-line: a floating, slightly rotated **product frame** (browser-chrome mockup of the booking flow or admin portal) with a subtle continuous parallax float (translateY driven by scroll, ±12px), establishing "this is real software" immediately.
- Release-date micro-strip directly under the hero: `General availability — Q1 2027` + a compact mono countdown (days:hours:min). Countdown value comes from a single constant in `content/` — no hardcoded date scattered in JSX.

### 5.3 Trust / partner bar

- Thin section directly under hero, ivory-on-dark contrast avoided — keep dark, low-key.
- Label (mono, muted): `BUILT ON THE INFRASTRUCTURE YOU ALREADY TRUST`
- Infinite marquee of monochrome (grayscale, brighten on hover) logos: **GitHub, Next.js, Vercel, Stripe, Supabase**, plus room for 2–3 more as partnerships grow (TypeScript, PostgreSQL as generic tech credibility marks — optional second row).
- This is a *technology* trust bar, distinct from the *customer* proof point in §5.7 — don't conflate "who we're built on" with "who runs us."

### 5.4 Feature pillars (the core sell)

Grid of 4 primary + supporting secondary features, each a `<FeatureCard>`: icon, title, one-sentence value prop, optional small inline visual (a mini chart, a UI fragment, a chat bubble).

**Primary four (from requirements):**
1. **Booking, Payments & Orders** — guests find, reserve, and pay for the full range of resort experiences in one flow; nothing is quoted one price and charged another.
2. **Admin Control Center** — a fully configurable back office: calendars, availability, amenities, pricing, and payment policy — no engineering ticket required to change a rate.
3. **AI Concierge** — a guest-facing assistant that knows the property, answers in real time, and can act (check availability, suggest an experience, start a booking).
4. **Experience Discovery** — real-time surfacing of on-property and local experiences and highlights, matched to the guest, to drive incremental spend beyond the room.

**Secondary (recommended additions — round out the "platform" story; confirm before build):**
5. **Real-Time Revenue & Ops Dashboard** — occupancy, revenue, and folio health at a glance for GMs and owners.
6. **Dynamic Rate & Availability Engine** — rate cards, length-of-stay discounts, and calendar-aware pricing that update automatically.
7. **Guest Messaging & Lifecycle Comms** — automated confirmations, pre-arrival, and post-stay messaging that feels personal, not templated.
8. **Flexible Cancellation & Refund Policies** — configurable, versioned policies per property, per experience — no two-system disagreement on what a guest is owed.
9. **Secure Payments & PCI-Aware Vaulting** — Stripe-backed, credit-first guest wallets, audited money movement.
10. **Multi-Property Ready** — architected from day one to run more than one resort on the same platform, with clean data isolation.
11. **Radio Concierge AI — the weekly audio briefing** *(new, from this round's discussion — not just a marketing asset, a real subscriber-facing feature)* — an auto-generated audio show, per property, answering "what's on this week": new experiences, availability highlights, seasonal notes — narrated, not just listed. Guests and staff can tune in instead of scrolling a page. See §5.6b for the full spec and the honest build-path caveat (today: a manual pilot; tomorrow: an automated per-property pipeline).

Layout: 2×2 large cards for the primary four (with a mini visual each), then a denser 3-wide row for the secondary six below a "…and everything else running a resort needs" divider — keeps the primary four as the headline story without hiding the platform's depth.

### 5.5 Platform tour (tabbed deep-dive)

- Shadcn `Tabs`, horizontal, mono labels: `BOOKING` · `PAYMENTS` · `ADMIN` · `INSIGHTS`.
- Each tab swaps a large product screenshot/mock (browser-chrome framed) + 3 short bullet proof points, with a crossfade + slight scale transition on tab change.
- This is the section that "shows, doesn't tell" — the feature grid above sold the idea, this proves the software exists and looks this good.

### 5.5b Integrations — "Open by design"

Closest competitor Innspire sells itself as a thin AI layer bolted onto 100+ *existing* hotel systems ("your stack, untouched — don't replace, integrate"). We're structurally different and the section needs to say so honestly rather than copy their shape: **we are the system of record** (booking, folio, payments, calendar) *and* we expose it as an open API, so a property can run the whole platform or plug individual engines into what they already have. Lead with that distinction, then show the categories — but only claim integrations that exist or are genuinely roadmapped; do not publish an Innspire-sized "100+" logo wall for partners we haven't built.

- Section frame: `Two ways to work with us` — **Run the platform** (booking, payments, admin, concierge, all native) vs. **Plug in the engines** (pricing/tax/availability/ledger via `packages/api-client`-style REST, for teams integrating piece by piece).
- Below that, a shadcn `Tabs` grid mirroring the category pattern that works well on Innspire's page, honestly populated:

| Category | Copy (ours, reshaped) | Status |
|---|---|---|
| **Payments & Identity** | "Card capture, vaulting, and refunds run on Stripe under the hood — PCI scope stays off your team." | **Live** |
| **Auth & Guest Identity** | "Staff and guest sign-in, session, and role access, backed by Supabase Auth." | **Live** |
| **Guest Messaging** | "Confirmation, receipt, and folio email today; SMS and pre-arrival/post-stay nudges are next." | **Live (email) / Roadmap (SMS)** |
| **Point of Sale & F&B** | "Post an on-site charge — spa, chef's table, grocery run — straight to the guest folio, no second system to reconcile." | **Live (native catalog + ledger)** |
| **Door Locks & Digital Keys** | "Mobile key in Apple Wallet or Google Wallet, issued at confirmation, revoked at checkout." | **Roadmap** |
| **Guest Room & IoT** | "Room scenes and controls surfaced on the guest's own device." | **Roadmap** |
| **AI Voice** | "The concierge answers the call, not just the chat — and hands off to staff the moment it should." | **Roadmap** |
| **Open API & Webhooks** | "Every price, quote, and booking event available to your own tools — the same API our own apps run on, not a stripped-down public copy." | **Live** |

- Visual treatment stays consistent with §5.5's tabbed tour (crossfade on tab change), but each card carries a small status pill (`Live` — signal-green dot; `Roadmap` — muted outline) so the page never overclaims. This restraint *is* the trust move — a resort evaluating both companies should be able to tell exactly what's real today.
- CTA under the grid: `View the full API reference →` (can point to a future `/developers` page — out of scope for launch, flagged here so IA has room for it later).

### 5.6 AI Concierge — interactive demo

The single most "shockingly cool" moment on the page — this is the section to invest the most design/engineering effort in.

- Two-column: left = short framing copy + 3 example prompts as clickable chips ("What's the best sunset spot tonight?", "Move my dinner reservation to 8pm", "Do you have a room with a soaking tub available Friday?"); right = a live chat UI (shadcn `Card` + custom message bubbles).
- Clicking a chip streams a **pre-scripted but token-animated** response (no live LLM call required for the marketing site — keep it deterministic, fast, and free to run at scale; a real backend hook can replace it post-launch if desired).
- Aurora-gradient "thinking" indicator (three pulsing dots or a shimmering line) before the response streams in, mono timestamp per message, a small "Powered by Strategic Machines Concierge" tag.
- CTA under the demo: `Try the full concierge → /concierge` for visitors who want to keep exploring.

### 5.6b Radio Concierge AI — the audio cast (marketing asset today, product feature tomorrow)

This turned out to have two distinct jobs, and the design should be honest about both rather than collapsing them into one section:

**Job 1 — a marketing-site show about the company.** A distinctive, low-lift content asset that reinforces "innovation" without needing a studio: feed the platform's own content (feature briefs, the Cypress Resort case study, release notes) into **NotebookLM**, and publish the generated discussion as an ongoing show, branded **Radio Concierge AI**. This is what ships first, on the marketing site, at `/radio`.

**Job 2 — a real, sellable platform feature.** Your instinct in this round is the more interesting one: the same idea, pointed at a single property instead of at the company, becomes a genuinely new guest/staff-facing capability — an auto-narrated "what's on this week" audio briefing per resort, sourced from the same experience-discovery data that already powers §5.7. This is listed as feature #11 in §5.4 and belongs on `/platform` and in the pricing story (§5.9), not just the marketing footer. **Important distinction to keep straight in the copy:** Job 1 is a *content asset about Strategic Machines*; Job 2 is a *thing a subscribing property gets*. The marketing site should demo Job 1 live and *describe* Job 2 as a roadmap capability — don't imply the weekly-property-briefing feature is built and shipping today unless it actually is.

**On-page treatment (Job 1, what actually ships in this build):**
- Placement: a compact card directly under the concierge demo (§5.6) — small waveform/equalizer glyph (animated, aurora gradient bars, `prefers-reduced-motion`-safe static fallback), episode title, running time, one-line description, and a `▶ Tune in` button that opens the latest episode.
- Full listing lives at **`/radio`** (added to sitemap, §4) — a simple episode index (shadcn `Card` list), each entry linking out to the NotebookLM-hosted share link (or an embedded `<audio>` player if we self-host the generated MP3 instead of deep-linking — decide at build time based on whether NotebookLM's share link is stable/embeddable or the file should be downloaded and re-hosted for reliability + our own analytics).
- Footer gets a small `Resources` entry: `🎙 Radio Concierge AI`.
- Framing copy ties it back to the concierge story rather than presenting it as a generic podcast: *"Every feature, every release, every guest-journey idea we ship — narrated. Radio Concierge AI turns the platform's own documentation into a conversation you can listen to between meetings."* A short second line teases Job 2 without overclaiming: *"The same idea, aimed at a single resort, is coming to the platform itself — see it on the roadmap."*
- **Content pipeline (process note, not a UI element):** source text = curated excerpts from `content/*.ts` (features, case study, release notes) → fed into a NotebookLM notebook → NotebookLM's Audio Overview generates the episode → the resulting share link (or exported audio file) gets added to a small `content/radio.ts` episode list (title, date, duration, link/audio src, one-line summary) — same "typed content, not hardcoded JSX" discipline as the rest of the site (§3.2). A ready-to-paste source brief for Episode 1 has been drafted at `content-radio-episode-01-source.md` in this project root — see the message accompanying this doc for how to use it.

**Build-path honesty for Job 2 (the per-property weekly briefing feature):** NotebookLM today is a manual, browser-based tool with no public production API for generating an Audio Overview on demand per request — so "every property automatically gets a fresh audio episode every week" is not something that can be wired up as a live backend call the way, say, `computeStayCost` is. Two real paths, worth deciding between before this goes on a roadmap page as a firm commitment:
  1. **Pilot manually, Cypress Resort only.** Someone curates the week's highlights and runs them through NotebookLM by hand, weekly — proves the guest-facing value before any engineering investment. Realistic for launch.
  2. **Build the automated version ourselves**, later, using a TTS/audio-generation model directly from `packages/domain`'s experience/availability data (bypassing NotebookLM's consumer product entirely) so it can run per-property, per-week, unattended. This is the real feature if it ships — flagged as a backlog item, not a v1 build task.

**Open item:** need the actual NotebookLM notebook/share link before Job 1 ships — flagged in §12 below. Until then, the section builds with a placeholder "Episode 1 — coming soon" card so the layout is real but nothing links out to a dead URL.

### 5.7 Experience showcasing

- Switches to **Daylight** register — the one clear "this sells a resort experience" beat on the page, full-bleed real imagery.
- Horizontal scroll-snap card rail (not a grid) of "experience" cards — sunset sail, chef's table, spa ritual, trail hike — each with image, title, one-line hook, and a small "live availability" badge to sell the *real-time* part of the pitch.
- Copy frame: "Guests don't just book a room. They discover a property." — ties directly to feature #4.

### 5.8 Customer spotlight — Cypress Resort, Customer №1

- Back to **Obsidian**, but warmed slightly by the gold accent — this section is the trust anchor of the whole page.
- Gold badge: `CUSTOMER № 001`
- Large Cypress Resort wordmark/logo + one real, high-quality property photo.
- Pull-quote block reserved for a real quote from Cypress Resort leadership once supplied — **do not fabricate an attributed quote**; ship this section with a clearly-labeled placeholder (`[Pull quote — to be supplied by Cypress Resort]`) until the user provides real copy.
- Stats row (mono, count-up on scroll) — use only numbers the user confirms are accurate/publishable; suggested slots: reservations processed, guest-facing uptime since Day Zero cutover, properties/units under management, average concierge response time. Ship with `—` placeholders rather than invented figures.
- CTA: `Read the full case study → /customers/cypress-resort`

### 5.9 Pricing / subscription tiers — built around the AI agent, not the room count

Innspire's pricing is clever in one specific way worth keeping: it's structured around *what the AI is doing for you* (Text Journey → AI Concierge → Guest Flows), not a flat per-room SaaS fee — so the price ladder tells the product story on its own. It's also got a real weakness worth improving on: per-message billing on top of a base fee is opaque, and a guest-facing surprise-fee mechanic sits oddly next to a "trust" pitch. Ours keeps the agent-centered ladder, drops the metered-messaging anxiety.

- Three-tier shadcn `Card` row, each tier named for **how much of the platform's intelligence is switched on**, not a generic size label:

| Tier | Positioning | What's included |
|---|---|---|
| **Foundation** | The system of record | Booking, payments, orders, admin portal, calendar/rate/tax/cancellation engines — the operational core, no AI concierge |
| **Concierge** *(gold-bordered, "Most Popular" / pre-GA: "Founding Rate")* | The core, plus the AI concierge, unmetered | Everything in Foundation **+ the AI Concierge, with guest conversations included in the price** — no per-message add-on, explicitly called out as a line-item contrast: `Unlimited concierge conversations. No per-message bill.` |
| **Estate** | Full guest journey, white-glove | Everything in Concierge **+ experience showcasing, digital-key roadmap access, multi-property support, priority support/SLA** — priced as "Talk to us" |

- Toggle: monthly / annual (annual shows a savings badge) — price is **per property**, not per room, to avoid inheriting Innspire's per-room-per-month framing entirely; simpler to quote, and matches how a boutique/luxury property actually budgets software (unlike a 300-room select-service box counting rooms).
- Each tier: price, one-line audience fit, feature checklist (shared `content/pricing.ts` data, reused between `/` and `/pricing`).
- A single differentiator strip runs under the three cards, mono label: `WHY "UNLIMITED CONCIERGE" MATTERS` — three short columns: *Predictable cost* (no message-metering surprises), *No throttled hospitality* (a slow month shouldn't mean a rationed concierge), *One price, one invoice* (folio-style billing simplicity, on-brand with the ledger discipline the platform itself is built on).
- Because the product isn't GA yet, primary CTA on every tier before launch is `Join the Waitlist` (or `Reserve Founding Rate` on Concierge), not `Buy Now` — pricing here is about setting expectation and capturing intent, not checkout.

### 5.10 Release CTA / Waitlist (the conversion section)

- Full-width, dark, aurora mesh background matching the hero — visually bookends the page.
- Large mono countdown to GA date (shared component with the hero's compact version).
- Headline: **"Be first when we open the doors."**
- Waitlist form: email (+ optional property name / role select: Owner, GM, Ops, Investor, Other) → shadcn `Form` + `Input` + `Select`, single primary submit button (gold, magnetic).
- On submit: optimistic success state (confetti-free, just a clean check + "You're on the list — #{{position}} in line" if you want a queue-position hook, otherwise a simple confirmation), toast via `Sonner`, row written to Supabase, confirmation email queued.
- Honeypot field + simple rate limiting (IP-based, via a lightweight edge check) to keep this spam-resistant without adding a CAPTCHA that hurts conversion.

### 5.11 FAQ

- Shadcn `Accordion`, single-open, mono question labels. Covers: What is Cypress Resort's relationship to Strategic Machines? When is GA? Does this replace our PMS? Is payment data PCI-compliant? Can we bring our own domain/branding? Multi-property support?

### 5.12 Footer

- Dark, dense, four columns: **Product** (Platform, Concierge, Pricing), **Company** (About, Customers, Contact), **Resources** (placeholder for future docs/blog), **Legal** (Privacy, Terms).
- Strategic Machines wordmark + one-line tagline + small partner-logo row repeated in mono/mini form.
- Bottom bar: `© {{year}} Strategic Machines. All rights reserved.` + social links (LinkedIn, GitHub, X) as icon-only.
- Small `Built for Cypress Resort` credit line — the inverse of §5.8's badge, reinforcing the brand relationship consistently.

---

## 6. Other pages (brief)

- **`/platform`** — same tabbed-tour pattern as §5.5 but exhaustive: every feature from §5.4 gets its own scroll section with a screenshot and 2–3 sentences. This is the "send to a technical evaluator" page.
- **`/concierge`** — the §5.6 demo, full-page, plus a written explanation of what it can/can't do today and what's roadmapped (SMS, proactive nudges) — sets honest expectations, reinforces **Trust**.
- **`/pricing`** — §5.9 tiers plus a full comparison table (shadcn `Table`) and the FAQ.
- **`/customers/cypress-resort`** — long-form case study: the problem (Gen-1 logic drift, disconnected booking/PMS), the rebuild, the outcome, real photography, the stats block from §5.8 in full detail, and (once supplied) a real testimonial.
- **`/company`** — founder/team story, mission statement, contact — humanizes "Strategic Machines" beyond the product.

---

## 7. Reusable component inventory

| Component | Built from | Used on |
|---|---|---|
| `<Navbar/>`, `<Footer/>` | shadcn `Sheet`, `Button` | every page |
| `<Hero/>` | custom + `<AuroraMesh/>` | `/` |
| `<AuroraMesh/>` | custom (CSS/canvas), motion-driven | hero, waitlist CTA, `/concierge` |
| `<Marquee logos={...}/>` | custom, CSS animation | trust bar, footer, `/company` |
| `<FeatureGrid features={...}/>` | shadcn `Card` | `/`, `/platform` |
| `<ProductTabs/>` | shadcn `Tabs` | `/`, `/platform` |
| `<ConciergeDemo/>` | shadcn `Card`, custom chat bubbles | `/`, `/concierge` |
| `<IntegrationsTabs categories={...}/>` | shadcn `Tabs`, status pill | `/`, `/integrations` |
| `<RadioConciergeCard/>`, `<RadioEpisodeList episodes={...}/>` | shadcn `Card`, custom waveform glyph | `/`, `/radio` |
| `<ExperienceRail experiences={...}/>` | custom scroll-snap | `/`, resort-facing pages |
| `<CustomerSpotlight/>` | custom + `<StatCounter/>` | `/`, `/customers/cypress-resort` |
| `<PricingTiers tiers={...}/>` | shadcn `Card`, `Tabs`/`Switch` | `/`, `/pricing` |
| `<WaitlistForm/>` | shadcn `Form`, `Input`, `Select`, `Sonner` | `/`, `/waitlist` |
| `<Countdown target={date}/>` | custom, mono numerals | hero, waitlist CTA |
| `<StatCounter value={n}/>` | custom, motion `useInView` | customer spotlight, platform tour |
| `<FAQAccordion items={...}/>` | shadcn `Accordion` | `/`, `/pricing` |
| `<FadeUp/>`, `<Parallax/>`, `<MagneticButton/>` | motion primitives | wrap almost everything above |

Every data-bearing component takes its content as typed props from `content/*.ts` — no section hardcodes copy, so the same building blocks recombine across `/`, `/platform`, `/pricing` without duplication (the same discipline the platform itself enforces with one engine, many surfaces).

---

## 8. Waitlist data model (Supabase)

Keep this in a dedicated, obviously-marketing-site schema/table — **not** anywhere near the `ts_` tables in the actual platform project. This is a separate Supabase project (or at minimum a separate, clearly-namespaced table) for the marketing site's own lead capture.

```sql
create table sm_waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  role         text,               -- 'owner' | 'gm' | 'ops' | 'investor' | 'other'
  property_name text,
  source       text,               -- utm/referrer, captured client-side
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);

-- RLS: insert-only from the anon key via the route handler, no client-side direct writes,
-- select restricted to a service role (for a future internal "waitlist count" admin view).
```

- The Next.js route handler (`app/waitlist/route.ts`) is the **only** writer — validates with `zod`, checks the honeypot, inserts, then queues a confirmation email. Mirrors the platform's own "one service-role seam" rule even though this is a much smaller system.
- `source` captures `utm_source`/`utm_campaign`/referrer at submit time — needed for GEO/SEO channel attribution once the site is live.

---

## 9. Logo & brand asset note

No Strategic Machines logo file exists in this repo or elsewhere on disk yet (checked `public/` and the parent `machine/` directory — only Next.js/Vercel/GitHub/Window placeholder SVGs from the scaffold are present). Before implementation, I need one of:

1. An existing logo file (SVG preferred) dropped into `public/brand/`, or
2. Direction to design a wordmark treatment (e.g., set "Strategic Machines" in Geist with a small aurora-gradient mark — a bracket, node graph, or angular "M" glyph) as a placeholder until a real mark is supplied.

Same question applies to a Cypress Resort logo for the trust/case-study sections — if one exists in the `cypress-resort-site` or `ts-platform` repos I can pull it in; otherwise a text wordmark placeholder is used.

---

## 10. SEO & GEO readiness

**Classic SEO (App Router native tooling):**
- `generateMetadata` per route — unique title/description, canonical URL, OG + Twitter card images (auto-generated via `next/og` `ImageResponse` per page for consistency, not hand-designed PNGs).
- `app/sitemap.ts` and `app/robots.ts` (native App Router generators) instead of static files.
- Semantic heading hierarchy enforced per section (one `h1` per page, `h2` per major section) — motion/animation never gates content behind JS-only rendering; all copy is server-rendered, animation is progressive enhancement on top.
- Core Web Vitals discipline: hero mesh/parallax must not block LCP — the H1 and primary CTA render immediately; the aurora background is a decorative layer that can paint a frame late without affecting LCP scoring. Product screenshots use `next/image` with explicit dimensions and priority only on the hero image.

**Structured data (JSON-LD):**
- `Organization` (Strategic Machines) sitewide.
- `SoftwareApplication` or `Product` schema on `/` and `/pricing` describing the platform and subscription offer.
- `FAQPage` schema on the FAQ section.
- `Article`/`Review`-adjacent schema is deliberately **not** used for the case study unless Cypress Resort supplies a genuine, attributable review — fabricated review markup is a real search-spam risk and against Google's guidelines.

**GEO (generative-engine / AI-answer-engine readiness)** — increasingly as important as classic SEO for a B2B software sell:
- An `llms.txt` at the site root summarizing what Strategic Machines is, what the product does, who the customer is, and linking to the key pages in plain language — the emerging convention for helping LLM-based crawlers/answer engines summarize a site accurately.
- Content written so each section stands alone as an extractable, quotable answer (clear claims, no marketing copy that only makes sense in visual context) — this is *why* the feature and pricing content lives in structured `content/*.ts` data rather than free-form prose; it can be reused to generate a clean plain-text/markdown summary for `llms.txt` and for `SoftwareApplication` JSON-LD without drifting from what's on-page.
- Factual, non-superlative claims wherever numbers are used (§5.8) — AI answer engines and their fact-checking layers penalize unverifiable superlatives ("the world's #1...") much harder than they penalize a modest, specific, sourced claim.

---

## 11. Accessibility

- All motion respects `prefers-reduced-motion`.
- Color contrast checked against both registers — aurora gradient text never used for body copy, only large display type or on-brand accents with sufficient size to stay legible.
- Countdown, stat counters, and marquee all have a static, screen-reader-friendly text equivalent (`aria-live="off"` on the animated number, a visually-hidden final value).
- Full keyboard navigation through nav, tabs, accordion, and the waitlist form; concierge demo chips are real buttons, not click-only divs.

---

## 12. Open questions before build starts

1. **Logo/brand assets** — see §9. Placeholder wordmark okay to start, or wait for real files?
2. **Release/GA date** — what date goes in the countdown? (Placeholder "Q1 2027" used above.)
3. **Real numbers for the Cypress Resort stat block** (§5.8) — what's publishable today?
4. **Pricing** — are the three tiers (Boutique / Signature / Estate) and their price points real, or should launch copy stay "Contact us" only until pricing is finalized?
5. **Supabase project** — new dedicated project for the marketing site, or a namespaced table inside an existing non-production project?
6. **Domain** — confirm the production domain for canonical URLs / OG metadata / `llms.txt`.
7. **NotebookLM link** — I can't create or authenticate a NotebookLM notebook myself in this session (it's a Google product requiring your own account login, no public API — the same category of limitation as the Gmail/Calendar/Drive connectors this session can't touch). What I *did* do: wrote a ready-to-paste source brief at `content-radio-episode-01-source.md` in the project root — drop its contents into a new NotebookLM notebook, generate an Audio Overview, and send me back the resulting share link (or download the MP3) and I'll wire it into `content/radio.ts`. Also confirm: deep-link to NotebookLM's share URL, or download + self-host the generated audio (better reliability + our own play analytics, more setup)?
8. **Integrations honesty check** (§5.5b) — confirm the Live/Roadmap split is accurate before publish: Stripe and Supabase Auth are safe to list as Live; email is Live; SMS, digital keys, IoT, and AI voice should stay Roadmap unless something's further along than this doc assumes.
9. **Pricing numbers** (§5.9, reworked) — the Foundation / Concierge / Estate structure and the "unlimited concierge conversations" claim are proposals; need real price points and confirmation that unmetered concierge usage is actually the pricing model you want to commit to (it's a strong claim vs. Innspire — worth being sure margins support it before it's on the page).

---

**Next step once this is approved:** scaffold `shadcn/ui` + `motion` + Supabase client, build the `content/` data layer, then implement section-by-section starting with Navbar → Hero → Trust Bar, so there's a reviewable slice early rather than the whole page landing at once.
