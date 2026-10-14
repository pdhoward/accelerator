import { KeyRound } from "lucide-react";

import { toolbeltPoints } from "@/content/accelerator";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

/** Steps of one tool call through the Toolbelt, shown as the diagram on the right. */
const callPath = [
  "Agent asks for a tool, with a single-job pass",
  "Toolbelt finds your site from the pass",
  "Checks the specialist may use this tool",
  "Checks the gate (money, data, sign-in, go live)",
  "Attaches your credential from the vault",
  "Calls the service, hides sensitive data, logs it",
];

/** How the crew acts on a client's accounts without holding their credentials (an MCP gateway). */
export function ToolbeltSection() {
  return (
    <section id="toolbelt" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
      <FadeUp className="grid items-start gap-12 lg:grid-cols-[1.2fr_1fr]">
        <FadeUpItem className="flex flex-col gap-5">
          <SectionEyebrow>The Toolbelt · planned security architecture</SectionEyebrow>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Connected services. Bounded authority.
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-fog">
            The planned Toolbelt connects your crew to approved services through a governed
            server gateway. Permissions, protected decisions and action records belong in
            the application. The platform already includes a vault; gateway rollout and
            service availability are being validated separately.
          </p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {toolbeltPoints.map((point) => (
              <div key={point.title} className="rounded-xl border border-obsidian-border bg-obsidian-2/50 p-4">
                <p className="font-semibold text-white">{point.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-fog">{point.body}</p>
              </div>
            ))}
          </div>
        </FadeUpItem>

        <FadeUpItem>
          <div className="overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-2 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-obsidian-border px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-mist">
              <KeyRound className="size-3.5" />
              One tool call, step by step
            </div>
            <ol className="flex flex-col gap-3 p-5 sm:p-6">
              {callPath.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-aurora-cyan/40 font-mono text-[11px] text-aurora-cyan">
                    {i + 1}
                  </span>
                  <span className="text-sm text-fog">{step}</span>
                </li>
              ))}
            </ol>
            <div className="border-t border-obsidian-border px-5 py-4 text-sm text-fog">
              <span className="text-white">Planned:</span> connect your own AI assistant to your
              Accelerator and ask your crew what shipped this week. The proposed connection provides read and request access;
              every gate still needs you.
            </div>
          </div>
        </FadeUpItem>
      </FadeUp>
    </section>
  );
}
