import type { NextApiRequest } from "next";

// Best-effort, per-server-instance limiter. On serverless platforms each warm
// instance keeps its own counters, so this slows abuse but is not a hard cap.
const hits = new Map<string, number[]>();

export function clientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

/** Returns true when the request is allowed. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    });
  }
  return true;
}
