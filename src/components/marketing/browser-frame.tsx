import { cn } from "@/lib/utils";

/**
 * Browser-chrome frame for product screenshots (design.md §5.2/§5.5). No
 * real screenshots are wired in yet — `children` renders whatever mock UI
 * is passed in; swap for an actual <Image> of the product once available.
 */
export function BrowserFrame({
  url = "app.strategicmachines.ai",
  className,
  children,
}: {
  url?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-obsidian-border bg-obsidian-2 shadow-2xl shadow-black/50",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-obsidian-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 rounded-full bg-obsidian px-3 py-1 font-mono text-[11px] text-mist">
          {url}
        </span>
      </div>
      <div className="relative aspect-[16/10] w-full">{children}</div>
    </div>
  );
}
