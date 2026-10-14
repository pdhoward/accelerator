import { test } from "node:test";
import assert from "node:assert/strict";
import { pageVisitSchema, trafficSource } from "./traffic.ts";

test("only page paths and referrer hostnames are accepted, never query strings or full referrer URLs", () => {
  const value = { id: "152499f9-bd3c-4aa8-a852-d50fd687412d", sessionId: "353e5c30-4c23-4c59-b305-757d4ab39c19", path: "/pricing", referrerHost: "www.google.com", landing: true };
  assert.equal(pageVisitSchema.safeParse(value).success, true);
  for (const change of [{ path: "/?email=private" }, { path: "//other.example" }, { path: "/path#private" }, { referrerHost: "https://google.com/search?q=private" }, { ip: "127.0.0.1" }]) {
    assert.equal(pageVisitSchema.safeParse({ ...value, ...change }).success, false);
  }
});

test("search referrals, internal navigation and absent attribution stay distinct", () => {
  assert.equal(trafficSource("www.google.com", "strategicmachines.ai"), "search");
  assert.equal(trafficSource("www.google.co.uk", "strategicmachines.ai"), "search");
  assert.equal(trafficSource("bing.com", "strategicmachines.ai"), "search");
  assert.equal(trafficSource(null, "strategicmachines.ai"), "direct-or-unknown");
  assert.equal(trafficSource("strategicmachines.ai", "strategicmachines.ai"), "internal");
  assert.equal(trafficSource("google.com.other.example", "strategicmachines.ai"), "referral");
});
