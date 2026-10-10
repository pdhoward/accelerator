/**
 * Technology trust bar. Rendered as typographic wordmarks (no logo SVGs
 * bundled yet — see design.md §9) so nothing here misrepresents a mark we
 * don't have licensed artwork for. Swap in real SVGs when available.
 */
export type Partner = {
  name: string;
  href: string;
};

export const technologyPartners: Partner[] = [
  { name: "GitHub", href: "https://github.com" },
  { name: "Next.js", href: "https://nextjs.org" },
  { name: "Vercel", href: "https://vercel.com" },
  { name: "Stripe", href: "https://stripe.com" },
  { name: "Supabase", href: "https://supabase.com" },
  { name: "TypeScript", href: "https://www.typescriptlang.org" },
  { name: "PostgreSQL", href: "https://www.postgresql.org" },
];

/**
 * Partner Program for agencies and system integrators (decided 2026-10-10).
 * Partners work on our hosted platform, are the point of contact for their
 * clients, and deploy a crew branded to their firm. Not launched yet: the
 * page labels all of this "coming soon".
 */
export type PartnerTier = "Silver" | "Gold" | "Platinum";

export const partnerTiers: PartnerTier[] = ["Silver", "Gold", "Platinum"];

export type TierRow = { label: string } & Record<PartnerTier, string>;

export const partnerTierRows: TierRow[] = [
  {
    label: "Best for",
    Silver: "Agencies adding AI-run maintenance to their offer",
    Gold: "Agencies running a book of client sites",
    Platinum: "System integrators delivering at scale",
  },
  {
    label: "Your role",
    Silver: "You own the client relationship; our operators run the crew behind you",
    Gold: "You board and operate your clients' sites yourselves",
    Platinum: "You board, operate and design crews for your clients",
  },
  {
    label: "Point of contact",
    Silver: "You, for every client you bring",
    Gold: "You, for every client",
    Platinum: "You, for every client, with your own escalation path",
  },
  {
    label: "Crew branding",
    Silver: "Your firm named on the client's crew",
    Gold: "A crew branded to your firm: your name on the crew and client screens",
    Platinum: "Fully white-labelled: your name, colors and domain",
  },
  {
    label: "Partner skills",
    Silver: "—",
    Gold: "Your firm's know-how as private skills, applied across your clients",
    Platinum: "Partner skills plus the Crew Lab, to build and tune specialists",
  },
  {
    label: "Economics",
    Silver: "Revenue share on the clients you bring",
    Gold: "Wholesale pricing on Boarding and Crew plans; you set your price",
    Platinum: "Volume wholesale pricing and custom terms",
  },
  {
    label: "Certification",
    Silver: "Partner orientation",
    Gold: "Certified Boarding and operator training",
    Platinum: "Gold certification plus Crew Lab training",
  },
  {
    label: "Support",
    Silver: "Standard",
    Gold: "Priority",
    Platinum: "A dedicated partner manager",
  },
];

export type PartnerPillar = { title: string; body: string };

export const partnerPillars: PartnerPillar[] = [
  {
    title: "Your clients, your relationship",
    body: "You stay the point of contact. Your clients bring requests to you, and your team steers the crew and handles their approvals with them.",
  },
  {
    title: "A crew branded to your firm",
    body: "Every client site gets its own crew of specialist agents, carrying your firm's name, so the work is visibly yours.",
  },
  {
    title: "Your know-how, compounding",
    body: "Turn your standards and playbooks into partner skills: private to your firm and applied to every site you run. Your expertise becomes an asset that grows.",
  },
  {
    title: "Nothing to install",
    body: "Everything runs on our hosted, secured platform. Client credentials stay in the Toolbelt's vault, never with agents, and every client is isolated from every other.",
  },
];

/** The scripted Partner Playground: an idea, not built yet. */
export const playgroundSteps = [
  "Board a sample site and watch the Boarding crew survey it",
  "Meet the site's crew, branded with your firm's name",
  "Play the business expert: ask for a change and approve the design",
  "Watch the crew build, test and prove it, then try the preview",
  "Go live, undo, and browse the site's Library",
];
