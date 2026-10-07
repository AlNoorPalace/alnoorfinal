import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE = "an_admin";
const SESSION_HOURS = 12;

export const adminConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD) && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;

const sign = (payload: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");

const sha = (s: string) => createHash("sha256").update(s).digest();

export function passwordMatches(input: string): boolean {
  return timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD ?? ""));
}

export function sessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 3600;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${exp}.${sign(String(exp))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export function isAdmin(req: NextApiRequest): boolean {
  if (!adminConfigured()) return false;
  const raw = req.headers.cookie
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const expected = sign(exp);
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** Rejects cross-site requests (cookie is SameSite=Strict; this is defence in depth). */
export function sameOrigin(req: NextApiRequest): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

/** Returns true if the request may proceed; otherwise it has already responded. */
export function requireAdmin(req: NextApiRequest, res: NextApiResponse): boolean {
  res.setHeader("Cache-Control", "no-store");
  if (!adminConfigured()) {
    res.status(503).json({ error: "admin_not_configured" });
    return false;
  }
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "forbidden" });
    return false;
  }
  if (!isAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}
