/**
 * Every improvement is a defined work package (gen2-crew.md §17, §21): one
 * request carried through a fixed path, with every artifact and decision kept
 * together. Written for owners and executives, not engineers.
 */

export const packageParts = [
  { name: "Your request", detail: "In your own words, typed or spoken. The team lead restates it and asks what's unclear." },
  { name: "The design", detail: "What will change, what must not, and how it will be proven. In plain English, for you to approve." },
  { name: "The plan", detail: "Small steps, each one tested on its own. Nothing is built that the plan doesn't name." },
  { name: "The tests", detail: "Every step adds tests that prove it. Nothing moves on until every test passes." },
  { name: "Your approvals", detail: "Who decided what, on which version, and when. A change after you approve resets the approval." },
  { name: "The release", detail: "Checked again, released, and confirmed live. If anything isn't clean, it stops." },
] as const;

/** How much you're asked, by how much is at stake (the complexity tiers). */
export const askLevels = [
  {
    level: "Simple",
    example: "A blurry photo, a broken link, a typo",
    you: "Nothing. The crew fixes it, proves it and ships it. You see it in the record.",
  },
  {
    level: "Standard",
    example: "Search by brand, a new page section",
    you: "Approve a one-page brief. The crew plans, builds and proves it; you decide when it ships.",
  },
  {
    level: "Sensitive",
    example: "Payments, prices, customer data, sign-in",
    you: "You approve the design, the plan, the preview and the release. Money and data always come to you.",
  },
] as const;

/** What one real change left behind: Machine Shop's "Buy now with Stripe" (work #9, released 2026-10-21). */
export const demoRecord = {
  title: "Buy now with Stripe",
  site: "Machine Shop, our test site",
  facts: [
    { label: "Request", value: "“Let shoppers pick a product, pay with Stripe and have it shipped. Test mode only.”" },
    { label: "Rated", value: "Sensitive: money moves, so the owner decides at each stop" },
    { label: "Design", value: "Approved v1: Buy now, price always from the catalog, flat $9.95 US shipping" },
    { label: "Plan", value: "4 steps, each with its own tests" },
    { label: "Tests", value: "243 → 276, every step passed first time" },
    { label: "Decisions", value: "Rating, design, plan, preview and release: all the owner's" },
    { label: "Record", value: "Written into the shop's own code repository at Prove" },
    { label: "Result", value: "Live: the drill at $136.63 + $9.95 shipping, in Stripe test mode" },
  ],
} as const;

export const demoVideo = {
  src: "/media/accelerator-demo.mp4",
  poster: "/media/accelerator-demo-poster.jpg",
  captions: "/media/accelerator-demo.en.vtt",
  durationLabel: "90 seconds",
  note: "The platform screens are an illustrative replay of the real run, labelled as a sample. The shop before and after is the live Machine Shop test site.",
} as const;
