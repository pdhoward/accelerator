import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-obsidian-border bg-obsidian px-4 text-sm text-white placeholder:text-mist outline-none transition-colors selection:bg-aurora-violet/40",
        "focus-visible:border-aurora-violet/60 focus-visible:ring-2 focus-visible:ring-aurora-violet/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500/60 aria-invalid:ring-red-500/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
