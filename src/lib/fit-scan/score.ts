import type { Signals, StackTier } from "./detect";
import type { Audit, AuditStatus, CategoryScore, FitVerdict } from "./types";

/**
 * Transparent, deterministic scoring (Lighthouse-style): every point comes
 * from a named audit a visitor can read. The LLM analyst never changes these
 * numbers — it only adds narrative.
 */

const STACK: Record<StackTier, { score: number; label: string }> = {
  core: { score: 100, label: "Supported today" },
  near: { score: 75, label: "Modern JavaScript — close fit" },
  roadmap: { score: 50, label: "Server framework — on the roadmap" },
  cms: { score: 30, label: "CMS — partial custody" },
  locked: { score: 10, label: "Hosted builder — code is locked" },
  unknown: { score: 40, label: "Not identified from outside" },
};

const WEIGHTS: Record<AuditStatus, number> = { pass: 1, warn: 0.5, fail: 0, info: 1 };

export type Scored = {
  audits: Audit[];
  categories: CategoryScore[];
  fitScore: number;
  verdict: FitVerdict;
  verdictLabel: string;
  verdictDetail: string;
  stackTierLabel: string;
  dayOneBacklog: number;
};

export function scoreSignals(s: Signals, scanYear: number): Scored {
  const audits: Audit[] = [];
  const add = (category: Audit["category"], id: string, status: AuditStatus, title: string, detail: string) =>
    audits.push({ category, id, status, title, detail });

  // ── Stack ────────────────────────────────────────────────────────────────
  const stack = STACK[s.stackTier];
  add(
    "stack",
    "framework",
    s.stackTier === "core" ? "pass" : s.stackTier === "near" || s.stackTier === "unknown" ? "warn" : "fail",
    s.framework ? `Built with ${s.framework}` : "Framework not identifiable",
    s.framework
      ? `${stack.label}.${s.frameworks.length > 1 ? ` Also detected: ${s.frameworks.slice(1).join(", ")}.` : ""}`
      : "The page doesn't reveal its framework. Commissioning reads the repository directly.",
  );
  if (s.jqueryMajor !== null) {
    add(
      "stack",
      "jquery",
      s.jqueryMajor < 3 ? "fail" : "warn",
      `jQuery ${s.jqueryMajor}.x in use`,
      s.jqueryMajor < 3
        ? "An end-of-life library with known vulnerabilities — a precise upgrade candidate."
        : "A legacy dependency; modern frameworks usually make it unnecessary.",
    );
  }

  // ── Application depth ────────────────────────────────────────────────────
  const depthParts: [boolean, number, string, string][] = [
    [s.hasPasswordField || s.hasAuthLinks, 25, "User accounts / sign-in", "Accounts mean state, permissions and data — where accelerated engineering pays off."],
    [s.hasCommerce, 25, "Transactions: checkout, booking or pricing", "Money flows need invariants and evidence; this is Customer Zero's home turf."],
    [s.hasAccountArea, 15, "An account, dashboard or portal area", "A logged-in product surface beyond the marketing pages."],
    [s.services.some((x) => ["Supabase", "Firebase", "Clerk", "Auth0", "Stripe"].includes(x)), 15, "Application back-end services", "Detected services that imply a real application back end."],
    [s.formCount > 0, 10, "Forms that capture data", `${s.formCount} form${s.formCount === 1 ? "" : "s"} on the home page.`],
    [(s.sitemapUrlCount ?? 0) > 50 || s.internalLinkCount > 60, 10, "A large surface area", `${s.sitemapUrlCount ?? "Unknown"} URLs in the sitemap; ${s.internalLinkCount} internal links on the home page.`],
  ];
  let depth = 0;
  for (const [hit, pts, title, detail] of depthParts) {
    if (hit) depth += pts;
    add("application", title, hit ? "pass" : "info", hit ? title : `No sign of: ${title.toLowerCase()}`, hit ? detail : "Not visible from the public site.");
  }
  depth = Math.min(100, depth);

  // ── Delivery ─────────────────────────────────────────────────────────────
  const delivery = s.stackTier === "locked" ? 20 : s.hostingModern ? 90 : s.hosting ? 70 : 40;
  add(
    "delivery",
    "hosting",
    s.hostingModern ? "pass" : s.hosting ? "warn" : "info",
    s.hosting ? `Hosted on ${s.hosting}` : "Hosting platform not identified",
    s.hostingModern
      ? "A git-driven platform with preview deployments — ready for gated, automated releases."
      : s.hosting
        ? "General cloud hosting; commissioning wires up preview environments and promotion gates."
        : "Commissioning inventories the pipeline directly.",
  );
  add(
    "delivery",
    "response",
    s.headerMs < 800 ? "pass" : s.headerMs < 1800 ? "warn" : "fail",
    `Server responded in ${s.headerMs} ms`,
    s.headerMs < 800 ? "Fast first response." : "Slow first byte — a performance backlog item.",
  );

  // ── Hygiene (each gap = a day-one backlog item) ──────────────────────────
  const h = s.securityHeaders;
  const hygiene: [string, AuditStatus, string, string][] = [
    ["https", s.https ? "pass" : "fail", "Served over HTTPS", s.https ? "Encrypted by default." : "Plain HTTP — fix before anything else."],
    ["mixed", s.mixedContent ? "fail" : "pass", "No insecure (http://) resources", s.mixedContent ? "Insecure assets load on a secure page." : "All assets load securely."],
    ["hsts", h.hsts ? "pass" : "warn", "Strict-Transport-Security header", h.hsts ? "HTTPS is enforced." : "Browsers aren't told to insist on HTTPS."],
    ["csp", h.csp ? "pass" : "warn", "Content-Security-Policy header", h.csp ? "Script sources are restricted." : "No CSP — the main defense against injected scripts is missing."],
    ["nosniff", h.nosniff ? "pass" : "warn", "X-Content-Type-Options: nosniff", h.nosniff ? "Present." : "Missing."],
    ["frame", h.frameProtection ? "pass" : "warn", "Clickjacking protection", h.frameProtection ? "Framing is restricted." : "Pages can be framed by other sites."],
    ["referrer", h.referrerPolicy ? "pass" : "warn", "Referrer-Policy header", h.referrerPolicy ? "Present." : "Missing."],
    ["powered-by", s.poweredBy ? "warn" : "pass", "Server stack not advertised", s.poweredBy ? `X-Powered-By: ${s.poweredBy} is exposed.` : "No X-Powered-By leak."],
    ["compression", s.compressed ? "pass" : "warn", "Compressed responses", s.compressed ? "Responses are compressed." : "HTML isn't compressed."],
    ["weight", s.bytes < 500_000 ? "pass" : s.bytes < 1_500_000 ? "warn" : "fail", "Lean HTML payload", `${Math.round(s.bytes / 1024)} KB of HTML.`],
    ["third-party", s.thirdPartyScriptHosts.length <= 8 ? "pass" : "warn", "Third-party scripts under control", `${s.thirdPartyScriptHosts.length} third-party script host${s.thirdPartyScriptHosts.length === 1 ? "" : "s"}.`],
    ["title", s.title ? "pass" : "fail", "Page title", s.title ? `"${s.title.slice(0, 70)}"` : "No <title>."],
    ["description", s.metaDescription ? "pass" : "warn", "Meta description", s.metaDescription ? "Present." : "Missing — hurts search snippets."],
    ["viewport", s.viewport ? "pass" : "fail", "Mobile viewport", s.viewport ? "Present." : "Not mobile-ready."],
    ["lang", s.lang ? "pass" : "warn", "Document language declared", s.lang ? "Present." : "Missing <html lang> — an accessibility gap."],
    ["canonical", s.canonical ? "pass" : "warn", "Canonical URL", s.canonical ? "Present." : "Missing."],
    ["og", s.ogImage ? "pass" : "warn", "Social share image", s.ogImage ? "Present." : "Links shared on social show no preview."],
    ["robots", s.hasRobots ? "pass" : "warn", "robots.txt", s.hasRobots ? "Present." : "Missing."],
    ["sitemap", s.sitemapUrlCount ? "pass" : "warn", "XML sitemap", s.sitemapUrlCount ? `${s.sitemapUrlCount} URLs.` : "Not found at /sitemap.xml."],
  ];
  if (s.copyrightYear !== null) {
    const stale = s.copyrightYear < scanYear - 1;
    hygiene.push([
      "freshness",
      stale ? "warn" : "pass",
      "Signs of active maintenance",
      stale ? `The footer says © ${s.copyrightYear} — often a sign the site has fallen behind.` : `Footer is current (© ${s.copyrightYear}).`,
    ]);
  }
  for (const [id, status, title, detail] of hygiene) add("hygiene", id, status, title, detail);

  const hygieneAudits = audits.filter((a) => a.category === "hygiene");
  const hygieneScore = Math.round(
    (hygieneAudits.reduce((sum, a) => sum + WEIGHTS[a.status], 0) / hygieneAudits.length) * 100,
  );

  const fitScore = Math.round(stack.score * 0.45 + depth * 0.35 + delivery * 0.2);
  const dayOneBacklog = audits.filter((a) => a.status === "fail" || a.status === "warn").length;

  const categories: CategoryScore[] = [
    { id: "stack", label: "Stack fit", score: stack.score, summary: stack.label },
    { id: "application", label: "Application depth", score: depth, summary: depth >= 50 ? "A real web application" : depth >= 25 ? "Some application features" : "Mostly a content site" },
    { id: "delivery", label: "Delivery pipeline", score: delivery, summary: s.hosting ?? "Not identified" },
    { id: "hygiene", label: "Hygiene", score: hygieneScore, summary: `${dayOneBacklog} gap${dayOneBacklog === 1 ? "" : "s"} found from outside` },
  ];

  const { verdict, verdictLabel, verdictDetail } = decide(s.stackTier, depth, fitScore);
  return { audits, categories, fitScore, verdict, verdictLabel, verdictDetail, stackTierLabel: stack.label, dayOneBacklog };
}

function decide(tier: StackTier, depth: number, fit: number): Pick<Scored, "verdict" | "verdictLabel" | "verdictDetail"> {
  if (tier === "locked") {
    return depth >= 40
      ? { verdict: "replatform", verdictLabel: "Replatform first", verdictDetail: "There's a real application here, but its code is locked inside a hosted builder. A migration to an owned codebase comes before custody, and the Accelerator can run that migration." }
      : { verdict: "not-a-fit", verdictLabel: "Not a fit today", verdictDetail: "A hosted-builder site with little application logic. The builder already does what the Accelerator would." };
  }
  if (tier === "cms") {
    return { verdict: "cms", verdictLabel: "Partial fit (CMS)", verdictDetail: "Theme, plugin, performance and upgrade work suits the Accelerator well. Full custody depends on how much custom application code sits behind the CMS." };
  }
  if (tier === "roadmap") {
    return { verdict: "roadmap", verdictLabel: "Future candidate", verdictDetail: "A server-side framework we plan to support after our TypeScript beachhead. Talk to us if the backlog is urgent." };
  }
  if (depth < 25) {
    return { verdict: "low-value", verdictLabel: "Low accelerator value", verdictDetail: "Mostly a content site. The Accelerator pays off on applications with accounts, transactions and a backlog. An upgrade and hygiene sprint may still be worth it." };
  }
  if (fit >= 75) {
    return { verdict: "strong", verdictLabel: "Strong candidate", verdictDetail: "A modern application on a stack we support today. This is the profile we commission in about six weeks." };
  }
  return { verdict: "candidate", verdictLabel: "Candidate", verdictDetail: "A plausible fit. A scoping call and a look at the repository would confirm it." };
}
