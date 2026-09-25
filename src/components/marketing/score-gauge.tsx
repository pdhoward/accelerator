import { cn } from "@/lib/utils";

/** Lighthouse-style circular score. Color bands: ≥75 good, ≥50 fair, else poor. */
export function ScoreGauge({
  score,
  label,
  size = 88,
  className,
}: {
  score: number | null;
  label: string;
  size?: number;
  className?: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const value = score ?? 0;
  const color =
    score === null ? "var(--sm-mist)" : value >= 75 ? "var(--sm-signal-green)" : value >= 50 ? "var(--sm-gold-bright)" : "#f87171";

  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label}: ${score ?? "not available"}`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--sm-obsidian-border)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.9s ease-out" }}
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={color} style={{ fontSize: 26, fontWeight: 600, fontFamily: "var(--font-mono)" }}>
          {score ?? "—"}
        </text>
      </svg>
      <span className="text-xs text-fog">{label}</span>
    </div>
  );
}
