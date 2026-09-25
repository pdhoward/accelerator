import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms for using the Strategic Machines site and waitlist.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" />
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <div className="rounded-xl border border-dashed border-obsidian-border bg-obsidian-2/40 p-6 text-sm text-fog">
          <p>
            Placeholder — this page needs real legal review before launch. Pricing shown
            elsewhere on this site is a pre-GA proposal, not a binding offer, until
            confirmed.
          </p>
        </div>
      </section>
    </>
  );
}
