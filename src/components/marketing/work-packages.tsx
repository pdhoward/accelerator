import { askLevels, packageParts } from "@/content/work-packages";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

/** Defined work packages: one path for every change, every artifact kept, and you asked only where it matters. */
export function WorkPackages() {
  return (
    <section id="work-packages" className="relative scroll-mt-20 border-y border-obsidian-border bg-obsidian-2/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <FadeUpItem>
            <SectionEyebrow className="mx-auto justify-center">Defined work packages</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Every change arrives as one complete package.
            </h2>
          </FadeUpItem>
          <FadeUpItem>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-fog">
              No loose ends and no &ldquo;who changed this?&rdquo;. Every improvement follows the same path, and everything
              it produces stays together: your request, the design you approved, the plan, the tests that proved it, your
              decisions and the release. Your site&apos;s history becomes an asset you own, not knowledge locked in
              someone&apos;s head.
            </p>
          </FadeUpItem>
        </FadeUp>

        <FadeUp className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {packageParts.map((part, i) => (
            <FadeUpItem key={part.name} className="relative flex flex-col gap-2 rounded-2xl border border-obsidian-border bg-obsidian-2 p-4">
              <span className="font-mono text-[11px] tracking-widest text-aurora-cyan">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-semibold text-white">{part.name}</span>
              <span className="text-sm leading-relaxed text-fog">{part.detail}</span>
            </FadeUpItem>
          ))}
        </FadeUp>

        <FadeUp className="mt-16">
          <FadeUpItem className="mx-auto mb-6 max-w-2xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-white">You&apos;re asked only where it matters.</h3>
            <p className="mt-2 text-fog">
              The crew rates every request by what&apos;s at stake. The more that&apos;s at stake, the more often it
              stops for you.
            </p>
          </FadeUpItem>
          <div className="grid gap-4 md:grid-cols-3">
            {askLevels.map((l, i) => (
              <FadeUpItem key={l.level} className="flex flex-col gap-3 rounded-2xl border border-obsidian-border bg-obsidian-2 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden>
                    {[0, 1, 2].map((n) => (
                      <span key={n} className={n <= i ? "h-1.5 w-5 rounded-full bg-aurora-gradient" : "h-1.5 w-5 rounded-full bg-obsidian-border"} />
                    ))}
                  </span>
                  <span className="font-semibold text-white">{l.level}</span>
                </div>
                <p className="text-sm text-mist">{l.example}</p>
                <p className="text-sm leading-relaxed text-fog">
                  <span className="text-white">Your part: </span>
                  {l.you}
                </p>
              </FadeUpItem>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
