import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest",
  {
    variants: {
      variant: {
        default: "border-obsidian-border bg-obsidian-2 text-fog",
        gold: "border-gold/40 bg-gold/10 text-gold-bright",
        live: "border-signal/30 bg-signal/10 text-signal",
        roadmap: "border-obsidian-border bg-transparent text-mist",
        aurora: "border-aurora-violet/30 bg-aurora-violet/10 text-aurora-cyan",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
