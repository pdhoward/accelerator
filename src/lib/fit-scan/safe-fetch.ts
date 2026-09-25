import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

/**
 * Fetches a user-supplied URL without letting it reach private infrastructure
 * (SSRF). Every hop — including each redirect — must resolve only to public
 * addresses on port 80/443.
 *
 * Residual risk: fetch() re-resolves DNS after our check, so a rebinding DNS
 * server could still swap in a private address between check and connect.
 * Acceptable for a marketing-site scanner on serverless hosting; pin the
 * resolved IP with a custom undici dispatcher if this ever runs on a host
 * with sensitive internal services.
 */

const blocked = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 128],
  ["::1", 128],
  // No ::ffff:0:0/96 rule: BlockList checks IPv4 addresses against mapped
  // IPv6 rules, so it would block every IPv4 host. The IPv4 rules above
  // already cover mapped addresses such as ::ffff:127.0.0.1.
  ["64:ff9b::", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(net, prefix, "ipv6");
}

export class ScanError extends Error {}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  if (family === 6) return !blocked.check(address, "ipv6");
  return false;
}

/** Turns loose user input ("acme.com") into a validated https URL. */
export function normalizeTarget(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) throw new ScanError("Enter a website address.");
  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    throw new ScanError("That doesn't look like a website address.");
  }
  assertAllowedUrl(url);
  url.hash = "";
  return url;
}

function assertAllowedUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ScanError("Only http and https addresses can be scanned.");
  }
  if (url.username || url.password) throw new ScanError("Addresses with credentials can't be scanned.");
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new ScanError("Only standard web ports can be scanned.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    (!isIP(host) && !host.includes("."))
  ) {
    throw new ScanError("Only public websites can be scanned.");
  }
}

async function assertPublicHost(url: URL) {
  assertAllowedUrl(url);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true, verbatim: true }).catch(() => {
        throw new ScanError(`Couldn't find ${host} — check the address.`);
      });
  if (addresses.length === 0 || !addresses.every((a) => isPublicAddress(a.address))) {
    throw new ScanError("Only public websites can be scanned.");
  }
}

export type SafeResponse = {
  finalUrl: URL;
  status: number;
  headers: Headers;
  body: string;
  /** Milliseconds until response headers arrived on the final hop. */
  headerMs: number;
  bytes: number;
  truncated: boolean;
};

const USER_AGENT = "StrategicMachines-FitScan/1.0 (+https://strategicmachines.ai/fit-scan)";

export async function safeFetch(
  target: URL,
  { timeoutMs = 10_000, maxBytes = 2_000_000, maxRedirects = 4 } = {},
): Promise<SafeResponse> {
  let url = target;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHost(url);
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
        cache: "no-store",
      });
    } catch {
      throw new ScanError(`${url.hostname} didn't respond in time.`);
    }
    const headerMs = Date.now() - started;

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      await res.body?.cancel();
      url = new URL(res.headers.get("location")!, url);
      continue;
    }

    const { text, bytes, truncated } = await readCapped(res, maxBytes);
    return { finalUrl: url, status: res.status, headers: res.headers, body: text, headerMs, bytes, truncated };
  }
  throw new ScanError("Too many redirects.");
}

async function readCapped(res: Response, maxBytes: number) {
  if (!res.body) return { text: "", bytes: 0, truncated: false };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      truncated = true;
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
  return { text, bytes, truncated };
}
