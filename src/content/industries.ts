/**
 * Industry crews (gen2-crew.md §20, domain packs). A crew is configured for
 * one industry: its vocabulary, the places a change needs extra care, the
 * customer journeys that must keep working, and the measures that matter.
 * Commerce is proven on Machine Shop; Hospitality's pack is built and in
 * early access; the rest are planned. Keep claims to what is built.
 */

export type IndustryStatus = "available" | "early" | "soon";

export type Industry = {
  id: string;
  name: string;
  status: IndustryStatus;
  /** One line: who it is for. */
  forWhom: string;
  /** The words the crew uses with you. */
  speaks: string[];
  /** Where a change gets extra care, and why. */
  care: { area: string; why: string }[];
  /** The journey the crew keeps working, step by step. */
  journey?: string[];
  /** The measures the crew reports against. */
  measures?: string[];
  /** Proof so far, in one line. */
  proof?: string;
};

export const STATUS_LABEL: Record<IndustryStatus, string> = {
  available: "Available",
  early: "Early access",
  soon: "Coming soon",
};

export const industries: Industry[] = [
  {
    id: "commerce",
    name: "Commerce and online stores",
    status: "available",
    forWhom: "Shops that sell products online: catalogs, quotes, carts and checkout.",
    speaks: ["catalog", "product", "variant", "price", "promotion", "cart", "checkout", "order", "inventory", "fulfilment"],
    care: [
      { area: "Checkout and payments", why: "money moves, and an error costs a sale" },
      { area: "Prices, promotions and tax", why: "a small rule change touches every order" },
      { area: "Stock and availability", why: "overselling, or hiding what you have" },
      { area: "Customer accounts and orders", why: "personal data and order history" },
    ],
    journey: ["Find a product", "Compare", "Cart or quote", "Checkout", "Order confirmed"],
    measures: ["Conversion rate", "Average order value", "Quote completion"],
    proof: "Proven on Machine Shop: Buy now with Stripe, from request to release, with every decision on record.",
  },
  {
    id: "hospitality",
    name: "Hospitality: hotels, resorts and restaurants",
    status: "early",
    forWhom: "Properties that sell stays, tables and experiences online.",
    speaks: ["property", "room type", "rate plan", "availability", "reservation", "stay", "guest", "folio", "deposit", "cancellation policy"],
    care: [
      { area: "Rates and availability", why: "a wrong price or a double booking" },
      { area: "Reservations and changes", why: "a guest's stay depends on it" },
      { area: "Deposits, payments and refunds", why: "money moves" },
      { area: "Cancellation and booking policies", why: "terms your guests agreed to" },
    ],
    journey: ["Search dates", "Choose a room or table", "Book", "Pay a deposit", "Confirmed"],
    measures: ["Occupancy", "Booking conversion", "Revenue per available room"],
    proof: "The pack is built from a working resort platform, our Customer Zero. Early access on synthetic data.",
  },
  {
    id: "faith",
    name: "Churches and faith communities",
    status: "soon",
    forWhom: "Congregations with online giving, events, groups and streaming.",
    speaks: ["congregation", "giving", "pledge", "ministry", "small group", "event", "volunteer", "livestream"],
    care: [
      { area: "Online giving and recurring gifts", why: "donors' money and their trust" },
      { area: "Member and child records", why: "personal data, often about families" },
    ],
  },
  {
    id: "nonprofit",
    name: "Charities and nonprofits",
    status: "soon",
    forWhom: "Organizations that raise funds, run campaigns and recruit volunteers.",
    speaks: ["donor", "campaign", "gift", "recurring giving", "grant", "volunteer", "impact report", "gift receipt"],
    care: [
      { area: "Donations and gift receipts", why: "money, and receipts donors rely on" },
      { area: "Donor records", why: "personal data and consent to contact" },
    ],
  },
  {
    id: "insurance",
    name: "Insurance agencies",
    status: "soon",
    forWhom: "Independent agencies that quote, bind and service policies.",
    speaks: ["quote", "policy", "carrier", "coverage", "premium", "renewal", "claim", "certificate"],
    care: [
      { area: "Quote and application forms", why: "personal and financial data" },
      { area: "Coverage descriptions", why: "what you promise must match the policy" },
    ],
  },
  {
    id: "financial-planning",
    name: "Financial planning and wealth advisors",
    status: "soon",
    forWhom: "Advisory firms that book meetings, share reports and onboard clients.",
    speaks: ["client", "household", "plan", "portfolio", "review meeting", "onboarding", "disclosure"],
    care: [
      { area: "Client onboarding and documents", why: "sensitive financial information" },
      { area: "Disclosures and marketing claims", why: "rules on what an advisor may say" },
    ],
  },
  {
    id: "accounting",
    name: "Accounting and tax firms",
    status: "soon",
    forWhom: "Practices with client portals, document requests and appointments.",
    speaks: ["engagement", "return", "deadline", "document request", "client portal", "invoice"],
    care: [{ area: "Client documents and portals", why: "tax and financial records" }],
  },
  {
    id: "legal",
    name: "Law firms",
    status: "soon",
    forWhom: "Firms with intake forms, consultations and client communication.",
    speaks: ["matter", "intake", "consultation", "practice area", "retainer", "conflict check"],
    care: [{ area: "Intake and client messages", why: "confidential information" }],
  },
  {
    id: "real-estate",
    name: "Real estate and property management",
    status: "soon",
    forWhom: "Brokerages and managers with listings, showings, applications and rent.",
    speaks: ["listing", "showing", "lead", "application", "lease", "tenant", "maintenance request", "rent"],
    care: [
      { area: "Rental applications", why: "personal and financial data" },
      { area: "Listings and fair-housing wording", why: "what a listing may say" },
    ],
  },
  {
    id: "home-services",
    name: "Home services and the trades",
    status: "soon",
    forWhom: "HVAC, plumbing, roofing, electrical and landscaping companies.",
    speaks: ["service area", "estimate", "booking", "technician", "job", "invoice", "maintenance plan"],
    care: [{ area: "Online booking and estimates", why: "every lost form is a lost job" }],
  },
  {
    id: "health-practices",
    name: "Dental, medical and wellness practices",
    status: "soon",
    forWhom: "Independent practices with booking, forms and patient communication.",
    speaks: ["patient", "appointment", "provider", "intake form", "insurance", "reminder"],
    care: [{ area: "Patient forms and messages", why: "health information has strict rules" }],
  },
  {
    id: "veterinary",
    name: "Veterinary clinics",
    status: "soon",
    forWhom: "Clinics with appointments, reminders and pet records.",
    speaks: ["patient", "owner", "appointment", "vaccination reminder", "prescription refill"],
    care: [{ area: "Appointments and refills", why: "pet health and owners' data" }],
  },
  {
    id: "fitness",
    name: "Fitness studios and gyms",
    status: "soon",
    forWhom: "Studios that sell memberships, class packs and bookings.",
    speaks: ["membership", "class", "schedule", "class pack", "trial", "instructor", "waitlist"],
    care: [{ area: "Memberships and recurring billing", why: "money moves every month" }],
  },
  {
    id: "education",
    name: "Private schools and training providers",
    status: "soon",
    forWhom: "Schools, academies and course providers with enrolment and tuition.",
    speaks: ["enrolment", "course", "cohort", "tuition", "admission", "parent", "student"],
    care: [{ area: "Student and parent records", why: "personal data about minors" }],
  },
  {
    id: "associations",
    name: "Membership associations",
    status: "soon",
    forWhom: "Trade and professional associations with dues, events and directories.",
    speaks: ["member", "dues", "renewal", "chapter", "event", "directory", "certification"],
    care: [{ area: "Dues and renewals", why: "recurring payments and member trust" }],
  },
  {
    id: "events",
    name: "Event venues and wedding services",
    status: "soon",
    forWhom: "Venues, planners and caterers with inquiries, packages and deposits.",
    speaks: ["inquiry", "date hold", "package", "proposal", "deposit", "contract", "guest count"],
    care: [{ area: "Date holds and deposits", why: "a double-booked date can't be undone" }],
  },
  {
    id: "travel",
    name: "Travel and tour operators",
    status: "soon",
    forWhom: "Operators that sell tours, departures and itineraries.",
    speaks: ["tour", "departure", "itinerary", "traveler", "booking", "deposit", "waiver"],
    care: [{ area: "Departures and capacity", why: "overselling a tour" }],
  },
  {
    id: "automotive",
    name: "Automotive dealers and service centers",
    status: "soon",
    forWhom: "Dealers and shops with inventory, trade-ins and service booking.",
    speaks: ["inventory", "VIN", "trade-in", "test drive", "service appointment", "financing"],
    care: [{ area: "Prices and financing offers", why: "advertised terms must be accurate" }],
  },
  {
    id: "community-banking",
    name: "Credit unions and community banks",
    status: "soon",
    forWhom: "Local institutions with rates, applications and member services.",
    speaks: ["member", "rate", "application", "branch", "loan", "account"],
    care: [{ area: "Rates and applications", why: "regulated disclosures and personal data" }],
  },
  {
    id: "staffing",
    name: "Staffing and recruiting agencies",
    status: "soon",
    forWhom: "Agencies with job boards, candidate applications and client requests.",
    speaks: ["job order", "candidate", "application", "placement", "client", "timesheet"],
    care: [{ area: "Candidate applications", why: "personal data and fair hiring" }],
  },
  {
    id: "b2b",
    name: "Manufacturers and distributors",
    status: "soon",
    forWhom: "B2B sellers with catalogs, price lists, quotes and reorders.",
    speaks: ["SKU", "price list", "quote", "purchase order", "reorder", "account", "lead time"],
    care: [{ area: "Customer-specific pricing", why: "each account may see a different price" }],
  },
];
