import type { NextApiRequest, NextApiResponse } from "next";
import { allow } from "../../../lib/api";
import { adminConfigured, passwordMatches, sameOrigin, sessionCookie } from "../../../lib/admin/auth";
import { clientIp, rateLimit } from "../../../lib/rateLimit";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  res.setHeader("Cache-Control", "no-store");
  if (!adminConfigured()) return res.status(503).json({ error: "admin_not_configured" });
  if (!sameOrigin(req)) return res.status(403).json({ error: "forbidden" });
  if (!rateLimit(`admin-login:${clientIp(req)}`, 6, 10 * 60_000))
    return res.status(429).json({ error: "rate_limited" });

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || !passwordMatches(password))
    return res.status(401).json({ error: "wrong_password" });

  res.setHeader("Set-Cookie", sessionCookie());
  res.status(200).json({ ok: true });
}
