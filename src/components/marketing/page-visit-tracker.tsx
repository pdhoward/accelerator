"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** First-party page views, no cookies, no query strings or cross-site identifier. */
export function PageVisitTracker() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || previous.current === pathname) return;
    if (navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    previous.current = pathname;
    try {
      let sessionId = sessionStorage.getItem("sm-visit-session");
      const landing = !sessionId;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("sm-visit-session", sessionId);
      }
      let referrerHost: string | null = null;
      try { referrerHost = document.referrer ? new URL(document.referrer).hostname : null; } catch { /* unavailable */ }
      const payload = JSON.stringify({ id: crypto.randomUUID(), sessionId, path: pathname, referrerHost, landing });
      void fetch("/api/page-visits", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true,
      }).catch(() => { /* Analytics must never interrupt the website. */ });
    } catch { /* Storage/privacy restrictions disable tracking without breaking navigation. */ }
  }, [pathname]);
  return null;
}
