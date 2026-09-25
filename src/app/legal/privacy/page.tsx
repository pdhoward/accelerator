import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Strategic Machines handles your data.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <div className="rounded-xl border border-dashed border-obsidian-border bg-obsidian-2/40 p-6 text-sm text-fog">
          <p>
            Placeholder — this page needs real legal review before launch. At minimum it
            should cover: what data the waitlist form collects (email, optional role and
            company or app URL), how it&apos;s stored (Supabase), and that it&apos;s never sold
            to third parties.
          </p>
        </div>
      </section>
    </>
  );
}
