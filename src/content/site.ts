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

/**
 * Brand imagery, served from Cloudinary. Variants are Cloudinary URL
 * transformations of the one 512×512 master icon, so nothing is re-uploaded:
 * - logoNav: 96px (3× the 32px it renders at), auto format/quality.
 * - socialImage: the icon at 380px, padded — never upscaled (c_lpad) — onto a
 *   1200×630 canvas in the obsidian background, the size X and Open Graph
 *   large preview cards expect.
 */
const CLOUDINARY = "https://res.cloudinary.com/stratmachine/image/upload";
const LOGO_ID = "v1592332363/machine/icon-512x512_zaffp5.png";

export const brand = {
  logo: `${CLOUDINARY}/${LOGO_ID}`,
  logoNav: `${CLOUDINARY}/w_96,h_96,c_fit,f_auto,q_auto/${LOGO_ID}`,
  socialImage: {
    url: `${CLOUDINARY}/w_380,h_380,c_fit/c_lpad,w_1200,h_630,b_rgb:0a0a0c/f_png/${LOGO_ID}`,
    width: 1200,
    height: 630,
    alt: "Strategic Machines",
  },
} as const;


export type NavItem = {
  label: string;
  href: string;
  /** Off-site destination: opens in a new tab (see components/marketing/nav-link.tsx). */
  external?: boolean;
};

export const blogUrl = "https://blog.strategicmachines.ai/";

export const primaryNav: NavItem[] = [
  { label: "Fit Scan", href: "/fit-scan" },
  { label: "The Accelerator", href: "/platform" },
  { label: "Commissioning", href: "/#commissioning" },
  { label: "Customer Zero", href: "/customers/cypress-resort" },
  { label: "Pricing", href: "/pricing" },
  { label: "Partners", href: "/partners" },
  { label: "Company", href: "/company" },
  { label: "Blog", href: blogUrl, external: true },
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
      { label: "Blog", href: blogUrl, external: true },
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
