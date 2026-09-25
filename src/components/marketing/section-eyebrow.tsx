import { cn } from "@/lib/utils";

export function SectionEyebrow({
  children,
  className,
  dot = true,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-mist",
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-aurora-gradient" />}
      {children}
    </p>
  );
}
