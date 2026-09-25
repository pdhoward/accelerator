import { technologyPartners } from "@/content/partners";
import { Marquee } from "@/components/motion/marquee";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function TrustBar() {
  return (
    <section className="border-y border-obsidian-border bg-obsidian py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex justify-center">
          <SectionEyebrow dot={false}>
            Commissions applications built on the modern web stack
          </SectionEyebrow>
        </div>
        <Marquee>
          {technologyPartners.map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-lg font-medium text-mist/70 grayscale transition-all hover:text-white hover:opacity-100"
            >
              {partner.name}
            </a>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
