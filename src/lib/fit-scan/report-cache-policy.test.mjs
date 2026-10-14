import { test } from "node:test";
import assert from "node:assert/strict";
import { isRecentReport, publicReport, reportSiteKey, REPORT_TTL_MS } from "./report-cache-policy.ts";

test("reuse is limited to the original scan's seven-day window", () => {
  const now = Date.parse("2026-10-14T12:00:00Z");
  assert.equal(isRecentReport({ scannedAt: new Date(now - REPORT_TTL_MS + 1).toISOString() }, now), true);
  assert.equal(isRecentReport({ scannedAt: new Date(now - REPORT_TTL_MS).toISOString() }, now), false);
  assert.equal(isRecentReport({ scannedAt: new Date(now + 1).toISOString() }, now), false);
  assert.equal(isRecentReport({ scannedAt: "invalid" }, now), false);
});

test("same-site variants share a cache key without retaining query strings", () => {
  assert.equal(reportSiteKey(new URL("https://www.example.com/?visitor=one")), reportSiteKey(new URL("https://example.com/about")));
  assert.notEqual(reportSiteKey(new URL("https://other.example/")), reportSiteKey(new URL("https://example.com/")));
});

test("shared reports exclude private receipts and URL secrets without changing the original", () => {
  const original = { url: "https://example.com/?private=one", finalUrl: "https://example.com/#private", review: { token: "private-token" }, reusedReport: true, scannedAt: "2026-10-14T12:00:00Z" };
  const shared = publicReport(original);
  assert.equal(JSON.stringify(shared).includes("private"), false);
  assert.equal(shared.scannedAt, original.scannedAt);
  assert.equal(original.review.token, "private-token");
});
