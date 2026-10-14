import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStartingPoint } from "./starting-point.ts";
import { extractSignals } from "./detect.ts";
import { scoreSignals } from "./score.ts";

const report = {
  finalUrl: "https://example.com/", scannedAt: "2026-10-14T12:00:00.000Z",
  verdict: "low-value", verdictDetail: "Little application depth visible.",
  fitScore: 38, categories: [], analysis: null,
  audits: [{ category: "application", status: "info", title: "No sign of: transactions" }],
};
const context = { goal: "", mustPreserve: "", changeFrequency: "unknown" };

test("a low-value public scan recommends proportionate care without inventing capabilities", () => {
  const result = buildStartingPoint(report, context);
  assert.equal(result.opportunity, "focused-care");
  assert.equal(result.capabilities.length, 0);
  assert.match(result.recommendation, /focused maintenance/i);
  assert.match(result.unknowns.join(" "), /business rules/i);
});

test("an active business need exposes a disagreement with the public scan rather than overriding it", () => {
  const input = structuredClone(report);
  const result = buildStartingPoint(input, {
    goal: "Customers need to request quotes behind our login",
    mustPreserve: "Never change agreed pricing",
    changeFrequency: "weekly",
  });
  assert.equal(result.opportunity, "clarify-depth");
  assert.match(result.recommendation, /public scan/i);
  assert.equal(result.agreement.goal, "Customers need to request quotes behind our login");
  assert.equal(result.agreement.mustPreserve, "Never change agreed pricing");
  assert.deepEqual(input, report);
  assert.match(result.suggestedCheck, /agreed rule/i);
});

test("only positive public application signals become proposed capabilities", () => {
  const result = buildStartingPoint({ ...report, verdict: "strong", audits: [
    { category: "application", status: "pass", title: "User accounts / sign-in" },
    { category: "application", status: "info", title: "No sign of: payments" },
    { category: "hygiene", status: "pass", title: "HTTPS" },
  ] }, context);
  assert.deepEqual(result.capabilities, ["User accounts / sign-in"]);
  assert.equal(result.opportunity, "governed-improvement");
  assert.match(result.suggestedCheck, /expected result/i);
});

test("unknown and incompatible stacks do not become promised implementations", () => {
  const result = buildStartingPoint({ ...report, verdict: "not-a-fit" }, {
    ...context, goal: "Improve checkout", changeFrequency: "weekly",
  });
  assert.equal(result.opportunity, "technical-review");
  assert.match(result.recommendation, /compatibility/i);
});

test("optional business context has an explicit unconfirmed state", () => {
  const result = buildStartingPoint(report, context);
  assert.equal(result.agreement.goal, null);
  assert.equal(result.agreement.mustPreserve, null);
  assert.equal(result.agreement.status, "draft-not-approved");
});

function publicPage(body) {
  return extractSignals({
    html: `<html lang="en"><head><title>Example business</title><meta name="viewport" content="width=device-width"></head><body><script src="/_next/static/app.js"></script>${body}</body></html>`,
    headers: new Headers({ "server": "Vercel" }),
    finalUrl: new URL("https://example.com/"), headerMs: 100, bytes: 1000,
    robotsTxt: null, sitemapUrlCount: null,
  });
}

test("content sites retain the low-value verdict even on a highly compatible stack", () => {
  const scored = scoreSignals(publicPage("<h1>Our company</h1><p>Articles and services.</p>"), 2026);
  assert.equal(scored.fitScore, 63);
  assert.equal(scored.verdict, "low-value");
  assert.equal(scored.categories.find((c) => c.id === "stack").score, 100);
  assert.equal(scored.categories.find((c) => c.id === "application").score, 0);
  assert.match(scored.verdictDetail, /limited value/i);
});

test("transactional public signals retain technical scores without proving delivery gates", () => {
  const scored = scoreSignals(publicPage('<a href="/login">Sign in</a><a href="/dashboard">Dashboard</a><a href="/checkout">Checkout</a><form></form><script src="https://js.stripe.com/v3/"></script>'), 2026);
  assert.equal(scored.fitScore, 95);
  assert.equal(scored.verdict, "strong");
  assert.match(scored.audits.find((a) => a.id === "hosting").detail, /does not verify/i);
  assert.doesNotMatch(scored.verdictDetail, /six weeks/i);
});
