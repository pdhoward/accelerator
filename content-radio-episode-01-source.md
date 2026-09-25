# Radio Concierge AI — Episode 1 source brief

**How to use this file:** copy everything below into a new NotebookLM notebook (notebooklm.google.com) as a source document, then generate an Audio Overview. Send the resulting share link (or download the generated MP3) back so it can be wired into `content/radio.ts` and the `/radio` page. Edit any bracketed placeholder before generating — NotebookLM will read whatever's here as fact, so nothing bracketed should go in unedited.

---

## About Strategic Machines

Strategic Machines builds the operating system for boutique and luxury hospitality. The company's flagship product is a guest experience platform that unifies booking, payments, orders, and AI-powered concierge service into one system — instead of the patchwork of disconnected tools (a property management system, a separate booking widget, a separate payments processor, a separate chat app) that most hotels run today.

The company's engineering philosophy is that money and pricing logic should exist in exactly one place. A guest should never be quoted one price and charged another. Every reservation, every tax line, every refund is computed by the same engine, every time — a discipline the team calls "one ledger, one price, everywhere."

The platform is not a concept — it is live, in production, running a real resort's guest bookings and payments today.

## The Platform, in plain language

**Booking, payments, and orders.** Guests can find, reserve, and pay for rooms and on-property experiences — spa treatments, chef's table dinners, guided excursions — in one flow. Pricing accounts for length-of-stay discounts, seasonal rate cards, taxes, and promotional offers automatically, and the price a guest sees while browsing is exactly the price they're charged.

**An administrative control center.** Hotel staff can configure calendars, availability, amenities, pricing, and cancellation policy themselves, without needing an engineer — changing a rate or opening a new date range is a form, not a deploy.

**An AI concierge.** A guest-facing assistant that knows the property and can hold a real conversation — answering questions, checking availability, and helping start a booking — available any time, not just during front-desk hours.

**Experience discovery.** The platform surfaces real-time, locally relevant experiences and highlights to guests — matched to who they are and when they're staying — so a stay becomes more than just a room booked.

**A flexible cancellation and refund system.** Every reservation is pinned to the exact policy that was in effect the moment it was booked, so a policy change next season never retroactively changes what an existing guest is owed.

## Cypress Resort — Customer № 1

Cypress Resort is Strategic Machines' first production customer and a showcase of extraordinary guest experiences delivered. The resort had been running on an older, fragmented set of tools before moving onto the new platform — pricing and booking logic that had been implemented multiple times, in multiple places, tended to quietly drift out of sync, which is exactly the class of problem the platform was built to eliminate permanently.

Today, Cypress Resort's bookings, payments, and guest folios run entirely on the Strategic Machines platform, and every dollar that moves through a guest's stay is tracked as a single, auditable ledger entry.

[Placeholder — replace before generating: one or two real, specific facts about Cypress Resort worth mentioning by name — for example, what kind of property it is, its setting, or a signature experience it offers. Do not invent details; leave this bracket as-is if nothing is available yet, and NotebookLM will simply not elaborate on it.]

## This week at [Property Name] — sample format

*This section is a template for the recurring "what's on this week" briefing feature (see design.md §5.4 feature #11 and §5.6b). Replace the bracketed content with real, current information before generating an episode that claims to be a live weekly briefing. Leave it as a clearly hypothetical example if you want Episode 1 to demonstrate the format without claiming to be real-time.*

This week at [Property Name], here's what's available:

- **[Experience name]** — [one or two sentences describing it, and why it's worth a guest's time]
- **[Experience name]** — [one or two sentences]
- **[Seasonal or limited-time note]** — [e.g., a weather-dependent activity, a chef's special menu, a local event nearby]

Availability highlight: [e.g., "a small number of oceanview rooms have opened up for the coming weekend due to a cancellation" — only include if true]

Booking note: [e.g., how guests can reserve any of the above — through the app, by asking the concierge, or at the front desk]

## Closing note

Strategic Machines is not yet generally available to other properties — the company is building toward a public launch and maintaining a waiting list for hotels and resorts who want early access. Cypress Resort remains the platform's proving ground and first reference customer while that rollout continues.
