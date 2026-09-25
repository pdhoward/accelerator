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
