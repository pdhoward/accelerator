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
        <div className="space-y-6 text-sm leading-relaxed text-fog">
          <p>Last updated October 14, 2026. This notice describes data collected by the Strategic Machines marketing website.</p>
          <div><h2 className="text-lg font-semibold text-white">Page visits</h2><p className="mt-2">We record first-party browser page views in Supabase to understand which pages attract interest and where visitors arrive from. Records include the page path, time, referrer hostname, a browser-tab session identifier, landing-page indicator and an approximate traffic-source category. We omit query strings, referrer paths, raw IPs and raw browser identifiers from these records. No analytics cookies or cross-site identifiers are used. The tracker respects Do Not Track and Global Privacy Control; privacy tools and failed requests can prevent collection. These counts do not identify individual people or measure search rankings.</p></div>
          <div><h2 className="text-lg font-semibold text-white">Starting-point reviews</h2><p className="mt-2">When you request a review, we fetch the public website and may use Google PageSpeed and an AI analyst to assess public technical signals. The analyst receives public scan evidence and page text. Do not submit private pages, credentials or customer data.</p><p className="mt-2">When assessment history is available, we store the website address without its query string or fragment, hostname, review time, completion or failure, cache usage, fit score and verdict in Supabase. Separate abuse-prevention records contain a salted hash of the request IP, hostname, time and analyst-budget reservation. These scan records are separate from the page-view records described above and are not a verified count of individual people.</p></div>
          <div><h2 className="text-lg font-semibold text-white">Your perspective</h2><p className="mt-2">Draft comments remain in your browser until you submit Save my perspective. Submission stores your business goal, protected rule and change frequency with the assessment in Supabase. We use this information to understand interest and follow up if you separately provide contact details. Comments are not sent to the scan analyst or automatically linked to an email. If saving fails, the page says so; you can keep a downloaded draft.</p></div>
          <div><h2 className="text-lg font-semibold text-white">Walkthrough requests</h2><p className="mt-2">The request form collects your email and optional role and company or website. These are stored separately in Supabase and used to respond to your request. Requesting a walkthrough does not automatically share the downloaded assessment file.</p></div>
          <div><h2 className="text-lg font-semibold text-white">Access and requests</h2><p className="mt-2">Assessment history and submitted comments are not publicly readable through the website. Authorized Strategic Machines administrators can review them in Supabase. We use hosting, database and inference providers to operate these features. For questions, corrections or deletion requests, contact <a className="text-aurora-cyan underline" href="mailto:hello@strategicmachines.ai">hello@strategicmachines.ai</a> and identify the website and approximate review time.</p></div>
        </div>
      </section>
    </>
  );
}
