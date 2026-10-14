import { test } from "node:test";
import assert from "node:assert/strict";
import { perspectiveSchema, historyUrl } from "./perspective.ts";

const input = {
  reviewId: "152499f9-bd3c-4aa8-a852-d50fd687412d", token: "a".repeat(64),
  goal: "Improve inquiries", mustPreserve: "Preserve pricing", changeFrequency: "weekly",
};

test("submitted perspective is bounded, normalized and tied to a review receipt", () => {
  const result = perspectiveSchema.parse({ ...input, goal: "  Improve inquiries  " });
  assert.equal(result.goal, "Improve inquiries");
  assert.equal(result.reviewId, input.reviewId);
  assert.equal(perspectiveSchema.safeParse({ ...input, token: "guessed" }).success, false);
  assert.equal(perspectiveSchema.safeParse({ ...input, reviewId: "not-a-review" }).success, false);
});

test("oversized comments, invalid frequencies and unexpected fields are rejected", () => {
  for (const changed of [{ goal: "x".repeat(1001) }, { mustPreserve: "x".repeat(1001) }, { changeFrequency: "hourly" }, { website: "https://other.example" }]) {
    assert.equal(perspectiveSchema.safeParse({ ...input, ...changed }).success, false);
  }
});

test("empty perspectives cannot pretend to be submitted business input", () => {
  assert.equal(perspectiveSchema.safeParse({ ...input, goal: "  ", mustPreserve: "", changeFrequency: "unknown" }).success, false);
  assert.equal(perspectiveSchema.safeParse({ ...input, goal: "", mustPreserve: "", changeFrequency: "rarely" }).success, true);
});

test("history accepts bare website addresses and excludes URL credentials, query and fragment", () => {
  assert.equal(historyUrl("example.com/products?token=private#customer"), "https://example.com/products");
  assert.equal(historyUrl("https://user:secret@example.com/path?email=private#details"), "https://example.com/path");
  assert.throws(() => historyUrl("file:///private"));
});

test("optional contact details are accepted and bounded without requiring business comments", () => {
  const result = perspectiveSchema.parse({ ...input, goal: "", mustPreserve: "", changeFrequency: "unknown", name: " Jane ", company: " Example Ltd ", phone: "+1 (555) 123-4567" });
  assert.equal(result.name, "Jane");
  assert.equal(result.company, "Example Ltd");
  assert.equal(perspectiveSchema.safeParse({ ...input, name: "x".repeat(121) }).success, false);
  assert.equal(perspectiveSchema.safeParse({ ...input, phone: "<script>" }).success, false);
});
