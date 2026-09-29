import { ImageResponse } from "next/og";

import { brand, site } from "@/content/site";

// The 1200×630 social card for X, LinkedIn, iMessage, Slack etc. Rendered
// once at build time and referenced explicitly by every page's metadata
// (brand.socialImage), so the image is identical site-wide.
export const dynamic = "force-static";

const OBSIDIAN = "#0a0a0c";
const FOG = "#a9a9b2";
const CYAN = "#22d3ee";
const GOLD = "#c9a227";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 15% 0%, rgba(124,92,252,0.30), transparent 55%), radial-gradient(circle at 95% 100%, rgba(34,211,238,0.22), transparent 50%), #0a0a0c",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the image renderer needs a plain <img> */}
          <img src={brand.logoCard} width={72} height={72} alt="" style={{ borderRadius: 14 }} />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            You manage your website.
          </div>
          <div
            style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: CYAN }}
          >
            AI delivers the outcome.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: FOG, maxWidth: 900 }}>
            {site.subline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "16px 32px",
              borderRadius: 999,
              background: GOLD,
              color: OBSIDIAN,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Run a free Fit Scan
          </div>
          <div style={{ display: "flex", fontSize: 28, color: FOG }}>{site.domain}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
