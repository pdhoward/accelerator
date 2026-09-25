import { createHash } from "node:crypto";

import { createWaitlistClient } from "@/lib/supabase/server";

/**
 * Spend guard for the Fit Scan. The authoritative limits live in Postgres
 * (supabase/sm_fit_scan.sql → sm_fit_scan_admit), because serverless
 * instances don't share memory and can't cap Claude spend on their own.
 *
 * Fails closed: if the shared counter can't be reached, the scan still runs
 * under a per-instance limit but never calls the paid analyst. The one
 * exception is local development with FIT_SCAN_DEV_ANALYST=1.
 */

export type Admission =
  | { allowed: true; analyst: boolean; metered: boolean }
  | { allowed: false; reason: "ip" | "global" };

const LOCAL_LIMIT = 5;
const LOCAL_WINDOW_MS = 60 * 60 * 1000;
const localLog = new Map<string, { count: number; resetAt: number }>();

function hashIp(ip: string) {
  const salt = process.env.FIT_SCAN_IP_SALT ?? "sm-fit-scan";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function admitLocally(ipHash: string): Admission {
  const now = Date.now();
  const entry = localLog.get(ipHash);
  if (!entry || now > entry.resetAt) {
    localLog.set(ipHash, { count: 1, resetAt: now + LOCAL_WINDOW_MS });
  } else if (++entry.count > LOCAL_LIMIT) {
    return { allowed: false, reason: "ip" };
  }
  const devAnalyst = process.env.NODE_ENV === "development" && process.env.FIT_SCAN_DEV_ANALYST === "1";
  return { allowed: true, analyst: devAnalyst, metered: false };
}

export async function admitScan(ip: string, host: string): Promise<Admission> {
  const ipHash = hashIp(ip);
  try {
    const { data, error } = await createWaitlistClient().rpc("sm_fit_scan_admit", {
      p_ip_hash: ipHash,
      p_host: host,
    });
    if (error || !data) throw error ?? new Error("empty admission");
    const result = data as { allowed: boolean; analyst?: boolean; reason?: "ip" | "global" };
    return result.allowed
      ? { allowed: true, analyst: !!result.analyst, metered: true }
      : { allowed: false, reason: result.reason ?? "ip" };
  } catch (err) {
    console.error("fit-scan: shared budget unavailable, failing closed on the analyst", err);
    return admitLocally(ipHash);
  }
}
