/**
 * Pure signal extraction from what a public site reveals: its HTML, response
 * headers, robots.txt and sitemap. No I/O here — see scan.ts for fetching.
 */

export type StackTier = "core" | "near" | "roadmap" | "cms" | "locked" | "unknown";

export type PageInput = {
  html: string;
  headers: Headers;
  finalUrl: URL;
  headerMs: number;
  bytes: number;
  robotsTxt: string | null;
  sitemapUrlCount: number | null;
};

type Rule = { name: string; tier: StackTier; html?: RegExp[]; header?: [string, RegExp][]; cookie?: RegExp[] };

// Order matters: the first match is reported as the primary framework.
const FRAMEWORKS: Rule[] = [
  { name: "Wix", tier: "locked", html: [/static\.wixstatic\.com/i, /wix-code/i], header: [["x-wix-request-id", /./]] },
  { name: "Squarespace", tier: "locked", html: [/static1\.squarespace\.com/i, /Squarespace\.Constants/i] },
  { name: "Webflow", tier: "locked", html: [/data-wf-page=/i, /webflow\.js/i, /<meta[^>]+generator[^>]+Webflow/i] },
  { name: "Framer", tier: "locked", html: [/framerusercontent\.com/i, /<meta[^>]+generator[^>]+Framer/i] },
  { name: "Shopify", tier: "locked", html: [/cdn\.shopify\.com/i, /Shopify\.theme/i], header: [["x-shopid", /./]] },
  { name: "Next.js", tier: "core", html: [/\/_next\/static\//i, /__NEXT_DATA__/, /self\.__next_f/], header: [["x-powered-by", /next\.js/i], ["x-nextjs-cache", /./], ["x-nextjs-prerender", /./]] },
  { name: "Nuxt", tier: "near", html: [/__NUXT__/, /\/_nuxt\//i] },
  { name: "SvelteKit", tier: "near", html: [/__sveltekit/, /\/_app\/immutable\//i] },
  { name: "Remix / React Router", tier: "near", html: [/__remixContext/, /__reactRouterContext/] },
  { name: "Astro", tier: "near", html: [/<astro-island/i, /\/_astro\//i] },
  { name: "Gatsby", tier: "near", html: [/___gatsby/] },
  { name: "Angular", tier: "near", html: [/ng-version=/i] },
  { name: "WordPress", tier: "cms", html: [/\/wp-content\//i, /\/wp-includes\//i, /<meta[^>]+generator[^>]+WordPress/i] },
  { name: "Drupal", tier: "cms", html: [/Drupal\.settings/, /<meta[^>]+generator[^>]+Drupal/i], header: [["x-drupal-cache", /./]] },
  { name: "Ghost", tier: "cms", html: [/<meta[^>]+generator[^>]+Ghost/i] },
  { name: "Ruby on Rails", tier: "roadmap", html: [/name="csrf-param"\s+content="authenticity_token"/i, /data-turbo-track/i] },
  { name: "Django", tier: "roadmap", html: [/csrfmiddlewaretoken/i], cookie: [/csrftoken=/i] },
  { name: "Laravel", tier: "roadmap", cookie: [/laravel_session=/i] },
  { name: "ASP.NET", tier: "roadmap", html: [/__VIEWSTATE/], header: [["x-aspnet-version", /./], ["x-powered-by", /asp\.net/i]] },
  { name: "Vue", tier: "near", html: [/data-v-[0-9a-f]{6,}/i, /data-server-rendered/i] },
  { name: "React", tier: "near", html: [/data-reactroot/i, /react-dom/i, /id="root"><\/div>/i] },
  { name: "PHP", tier: "roadmap", header: [["x-powered-by", /php/i]] },
];

const HOSTS: { name: string; modern: boolean; header: [string, RegExp][] }[] = [
  { name: "Vercel", modern: true, header: [["x-vercel-id", /./], ["server", /vercel/i]] },
  { name: "Netlify", modern: true, header: [["x-nf-request-id", /./], ["server", /netlify/i]] },
  { name: "Render", modern: true, header: [["rndr-id", /./], ["x-render-origin-server", /./]] },
  { name: "Fly.io", modern: true, header: [["fly-request-id", /./]] },
  { name: "Heroku", modern: true, header: [["via", /vegur/i]] },
  { name: "Firebase Hosting", modern: true, header: [["x-served-by", /cache-.*firebase/i]] },
  { name: "GitHub Pages", modern: true, header: [["server", /github\.com/i]] },
  { name: "Cloudflare", modern: true, header: [["cf-ray", /./]] },
  { name: "AWS", modern: false, header: [["x-amz-cf-id", /./], ["x-amzn-requestid", /./], ["server", /amazons3|awselb/i]] },
  { name: "Azure", modern: false, header: [["x-azure-ref", /./], ["x-ms-request-id", /./]] },
  { name: "Google Cloud", modern: false, header: [["x-cloud-trace-context", /./], ["server", /google frontend/i]] },
];

const SERVICES: [string, RegExp][] = [
  ["Supabase", /\.supabase\.co/i],
  ["Firebase", /firebaseio\.com|firebaseapp\.com|gstatic\.com\/firebasejs/i],
  ["Stripe", /js\.stripe\.com/i],
  ["Clerk", /clerk\.(?:accounts|[a-z0-9-]+\.)|@clerk\//i],
  ["Auth0", /auth0\.com/i],
  ["Sentry", /sentry-cdn|ingest\.sentry\.io|@sentry\//i],
  ["PostHog", /posthog/i],
  ["Segment", /cdn\.segment\.com/i],
  ["Google Analytics", /googletagmanager\.com|google-analytics\.com/i],
  ["Vercel Analytics", /\/_vercel\/insights|va\.vercel-scripts\.com/i],
  ["Intercom", /widget\.intercom\.io/i],
  ["HubSpot", /js\.hs-scripts\.com|hs-analytics/i],
  ["Algolia", /algolia/i],
  ["Mapbox", /api\.mapbox\.com/i],
  ["Hotjar", /static\.hotjar\.com/i],
  ["Mixpanel", /cdn\.mxpnl\.com|mixpanel/i],
  ["LaunchDarkly", /launchdarkly/i],
  ["Cloudinary", /res\.cloudinary\.com/i],
];

export type Signals = {
  framework: string | null;
  frameworks: string[];
  stackTier: StackTier;
  hosting: string | null;
  hostingModern: boolean;
  services: string[];
  https: boolean;
  headerMs: number;
  bytes: number;
  scriptCount: number;
  thirdPartyScriptHosts: string[];
  formCount: number;
  hasPasswordField: boolean;
  hasAuthLinks: boolean;
  hasCommerce: boolean;
  hasAccountArea: boolean;
  internalLinkCount: number;
  sitemapUrlCount: number | null;
  hasRobots: boolean;
  title: string | null;
  metaDescription: boolean;
  viewport: boolean;
  lang: boolean;
  canonical: boolean;
  ogImage: boolean;
  copyrightYear: number | null;
  jqueryMajor: number | null;
  mixedContent: boolean;
  securityHeaders: {
    hsts: boolean;
    csp: boolean;
    nosniff: boolean;
    referrerPolicy: boolean;
    frameProtection: boolean;
    permissionsPolicy: boolean;
  };
  poweredBy: string | null;
  compressed: boolean;
  visibleText: string;
};

function matches(rule: { html?: RegExp[]; header?: [string, RegExp][]; cookie?: RegExp[] }, html: string, headers: Headers, cookies: string) {
  return (
    rule.html?.some((r) => r.test(html)) ||
    rule.header?.some(([name, r]) => r.test(headers.get(name) ?? "")) ||
    rule.cookie?.some((r) => r.test(cookies)) ||
    false
  );
}

export function extractSignals(input: PageInput): Signals {
  const { html, headers, finalUrl } = input;
  const cookies = headers.get("set-cookie") ?? "";

  const matchedFrameworks = FRAMEWORKS.filter((f) => matches(f, html, headers, cookies));
  const primary = matchedFrameworks[0] ?? null;
  const host = HOSTS.find((h) => matches(h, html, headers, cookies)) ?? null;

  const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const thirdPartyScriptHosts = [
    ...new Set(
      scriptSrcs
        .map((src) => {
          try {
            return new URL(src, finalUrl).hostname;
          } catch {
            return null;
          }
        })
        .filter((h): h is string => !!h && h !== finalUrl.hostname && !h.endsWith(`.${rootDomain(finalUrl.hostname)}`)),
    ),
  ];

  const hrefs = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const internalLinkCount = new Set(
    hrefs.filter((h) => h.startsWith("/") || h.includes(finalUrl.hostname)),
  ).size;
  const linkText = hrefs.join(" ").toLowerCase();
  const text = visibleText(html);
  const lowerText = text.toLowerCase();

  const jq = html.match(/jquery[.-]?(?:min\.)?(?:js)?[^"']*?(?:[@/-]|ver=)(\d)\.\d+/i);
  const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
  const csp = headers.get("content-security-policy") ?? "";

  return {
    framework: primary?.name ?? null,
    frameworks: matchedFrameworks.map((f) => f.name),
    stackTier: primary?.tier ?? "unknown",
    hosting: host?.name ?? null,
    hostingModern: host?.modern ?? false,
    services: SERVICES.filter(([, r]) => r.test(html)).map(([name]) => name),
    https: finalUrl.protocol === "https:",
    headerMs: input.headerMs,
    bytes: input.bytes,
    scriptCount: scriptSrcs.length,
    thirdPartyScriptHosts,
    formCount: (html.match(/<form[\s>]/gi) ?? []).length,
    hasPasswordField: /<input[^>]+type=["']password["']/i.test(html),
    hasAuthLinks: /\b(log ?in|sign ?in|sign ?up|register)\b/.test(lowerText) || /\/(login|signin|sign-in|signup|sign-up|auth)\b/.test(linkText),
    hasCommerce:
      /js\.stripe\.com/i.test(html) ||
      /\b(add to cart|checkout|book now|reserve now|buy now|subscribe)\b/.test(lowerText) ||
      /\/(cart|checkout|book|booking|reserve|pricing)\b/.test(linkText),
    hasAccountArea: /\/(account|dashboard|portal|app|admin|my-)\b/.test(linkText) || /\b(my account|dashboard)\b/.test(lowerText),
    internalLinkCount,
    sitemapUrlCount: input.sitemapUrlCount,
    hasRobots: !!input.robotsTxt,
    title: html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ?? null,
    metaDescription: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i.test(html),
    viewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    lang: /<html[^>]+lang=["'][a-z]/i.test(html),
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    ogImage: /<meta[^>]+property=["']og:image["']/i.test(html),
    copyrightYear: years.length ? Math.max(...years) : null,
    jqueryMajor: jq ? Number(jq[1]) : null,
    mixedContent: finalUrl.protocol === "https:" && /<(?:script|link|img|iframe)[^>]+(?:src|href)=["']http:\/\//i.test(html),
    securityHeaders: {
      hsts: headers.has("strict-transport-security"),
      csp: !!csp,
      nosniff: /nosniff/i.test(headers.get("x-content-type-options") ?? ""),
      referrerPolicy: headers.has("referrer-policy"),
      frameProtection: headers.has("x-frame-options") || /frame-ancestors/i.test(csp),
      permissionsPolicy: headers.has("permissions-policy"),
    },
    poweredBy: headers.get("x-powered-by"),
    compressed: /br|gzip|zstd|deflate/i.test(headers.get("content-encoding") ?? ""),
    visibleText: text.slice(0, 6000),
  };
}

function rootDomain(host: string) {
  return host.split(".").slice(-2).join(".");
}

function visibleText(html: string) {
  return html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Counts <loc> entries; a sitemap index counts its child sitemaps instead. */
export function countSitemapUrls(xml: string): number {
  return (xml.match(/<loc>/gi) ?? []).length;
}
