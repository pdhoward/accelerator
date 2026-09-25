import { AuroraMesh } from "@/components/motion/aurora-mesh";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

/**
 * Shared header for secondary pages (/platform, /pricing, etc.) — a lighter
 * echo of the homepage hero (design.md §6), reused instead of re-styled per
 * page.
 */
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-20">
      <AuroraMesh className="opacity-60" />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeUp className="flex flex-col items-center gap-5">
          <FadeUpItem>
            <SectionEyebrow className="justify-center">{eyebrow}</SectionEyebrow>
          </FadeUpItem>
          <FadeUpItem>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
          </FadeUpItem>
          {description && (
            <FadeUpItem>
              <p className="max-w-xl text-lg leading-relaxed text-fog">{description}</p>
            </FadeUpItem>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
