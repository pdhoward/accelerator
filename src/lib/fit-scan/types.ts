export type AuditStatus = "pass" | "warn" | "fail" | "info";

export type AuditCategory = "stack" | "application" | "delivery" | "hygiene";

export type Audit = {
  id: string;
  category: AuditCategory;
  title: string;
  detail: string;
  status: AuditStatus;
};

export type CategoryScore = {
  id: "stack" | "application" | "delivery" | "hygiene";
  label: string;
  score: number;
  summary: string;
};

export type FitVerdict = "strong" | "candidate" | "cms" | "roadmap" | "low-value" | "replatform" | "not-a-fit";

export type LighthouseScores = {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
};

export type BacklogItem = {
  title: string;
  why: string;
  level: "AC1" | "AC2" | "AC3";
};

export type Analysis = {
  analyst: string;
  businessSummary: string;
  applicationType: string;
  firstBacklog: BacklogItem[];
  risks: string[];
  pitch: string;
};

export type FitScanResult = {
  url: string;
  finalUrl: string;
  scannedAt: string;
  verdict: FitVerdict;
  verdictLabel: string;
  verdictDetail: string;
  fitScore: number;
  categories: CategoryScore[];
  detected: {
    framework: string | null;
    stackTier: string;
    hosting: string | null;
    services: string[];
  };
  audits: Audit[];
  dayOneBacklog: number;
  lighthouse: LighthouseScores | null;
  analysis: Analysis | null;
  notes: string[];
};
