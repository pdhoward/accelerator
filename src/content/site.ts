export const site = {
  name: "Strategic Machines",
  product: "The Accelerator",
  tagline: "Hands off the code. Hands on the controls.",
  description:
    "The Accelerator takes custody of your existing web application — building, testing, shipping and improving it with AI — while your team runs it from a control room, not an IDE.",
  domain: "strategicmachines.ai",
  url: "https://strategicmachines.ai",
  waitlistCtaLabel: "Commission your app",
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Fit Scan", href: "/fit-scan" },
  { label: "The Accelerator", href: "/platform" },
  { label: "Commissioning", href: "/#commissioning" },
  { label: "Customer Zero", href: "/customers/cypress-resort" },
  { label: "Pricing", href: "/pricing" },
  { label: "Partners", href: "/partners" },
  { label: "Company", href: "/company" },
];

export const footerColumns: { title: string; items: NavItem[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Fit Scan", href: "/fit-scan" },
      { label: "The Accelerator", href: "/platform" },
      { label: "Commissioning", href: "/#commissioning" },
      { label: "Evidence, not code review", href: "/#evidence" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/company" },
      { label: "Customer Zero", href: "/customers/cypress-resort" },
      { label: "Partner Program", href: "/partners" },
      { label: "Apply for commissioning", href: "/#waitlist" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];
