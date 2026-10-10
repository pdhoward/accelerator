export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Is this another AI coding assistant?",
    answer:
      "No. Coding assistants help an engineer write code, and a person still owns every merge. The Accelerator takes custody of the whole application: the backlog, implementation, regression, refactoring and release. It proves each change with evidence. Your team sets the mission and the limits.",
  },
  {
    question: "If nobody reviews the code, why should I trust it?",
    answer:
      "Because the model that writes a change never grades it. Every change is judged independently: held-out tests it can't edit, invariant checks, replay of historical behavior, synthetic users and preview telemetry. You get an evidence package explaining why the change is safe. High-risk classes such as money, auth and destructive migrations always stop at a human gate.",
  },
  {
    question: "Does the AI get access to my production database?",
    answer:
      "Not with write access. Generator sessions work against a test database. Production is read-only or reached through a controlled promotion path. The interlocks are enforced, not merely conventions.",
  },
  {
    question: "What does my team do after commissioning?",
    answer:
      "They move from the IDE to the Control Room. They set the mission, prioritize outcomes, challenge results, approve gated changes and decide how much autonomy to grant. Engineers who stay become operators and application physicists rather than line workers.",
  },
  {
    question: "Which applications can you commission today?",
    answer:
      "We start narrow on purpose: production web applications built with TypeScript/Next.js, Postgres or Supabase, GitHub, and Vercel-style CI/CD. That is the stack Customer Zero runs on. Other stacks follow once commissioning is proven repeatable.",
  },
  {
    question: "Why not just use Claude or ChatGPT directly?",
    answer:
      "Use them, and connect them to your Accelerator. On its own a model forgets your business between sessions, can't reach your accounts safely and grades its own work. The Accelerator gives your site its own crew of specialist agents, a private Library that remembers every decision, design and change, a secured Toolbelt to act on your accounts, and an independent judge with human gates before anything goes live.",
  },
  {
    question: "How do you handle my credentials?",
    answer:
      "Your keys stay in an encrypted vault and never enter a prompt, chat or log. Agents call named tools through our MCP Toolbelt, which attaches the credential on our server, checks the gate and records the call. Each job gets a short-lived pass for one site and one task, and each specialist sees only the tools its role allows. Most services connect with a sign-in button instead of a pasted key.",
  },
  {
    question: "Where is my site's knowledge kept, and can I take it with me?",
    answer:
      "What someone needs to understand your site (the handbook, decisions, approved designs, site skills and tests) is written into your own repository as plain files. The working history (conversations, evidence, the tool log and releases) lives in your private Library with us, separated from every other client, and you can export all of it at any time.",
  },
  {
    question: "Who is Customer Zero?",
    answer:
      "Cypress Resort. Its live booking, payments and ledger platform was built and is operated this way: 615 automated tests, hundreds of changes, real guests and real money. We are packaging what made that work.",
  },
  {
    question: "Are you locked to one AI model?",
    answer:
      "No. Models are replaceable parts of the Accelerator. What persists is your Application Model, your tests and your evidence history, and those stay yours.",
  },
];
