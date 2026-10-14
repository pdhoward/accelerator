import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareReview, feedbackHash } from "./review-entry.ts";

test("each cached response gets a private receipt, without modifying the shared report", () => {
  const result = { fitScore: 63, verdict: "low-value" };
  const a = prepareReview("https://example.com/", result, true);
  const b = prepareReview("https://example.com/", result, true);
  assert.notEqual(a.receipt.id, b.receipt.id);
  assert.notEqual(a.receipt.token, b.receipt.token);
  assert.equal(a.receipt.token.length, 64);
  assert.equal(a.row.cache_hit, true);
  assert.deepEqual(result, { fitScore: 63, verdict: "low-value" });
});

test("history stores only the feedback token hash and summary, not the raw token or full report", () => {
  const entry = prepareReview("https://example.com/", { fitScore: 80, verdict: "strong", analysis: { privateDetail: "not retained" } }, false);
  assert.equal(entry.row.feedback_token_hash, feedbackHash(entry.receipt.token));
  assert.equal(JSON.stringify(entry.row).includes(entry.receipt.token), false);
  assert.equal(JSON.stringify(entry.row).includes("privateDetail"), false);
  assert.equal(entry.row.status, "completed");
});

test("failed reviews do not invent scores or a business verdict", () => {
  const entry = prepareReview("https://example.com/", null, false);
  assert.equal(entry.row.status, "failed");
  assert.equal(entry.row.fit_score, null);
  assert.equal(entry.row.verdict, null);
});
