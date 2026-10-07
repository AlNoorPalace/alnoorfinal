import type { NextApiRequest, NextApiResponse } from "next";
import { allow } from "../../../lib/api";
import { clearCookie, sameOrigin } from "../../../lib/admin/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  if (!sameOrigin(req)) return res.status(403).json({ error: "forbidden" });
  res.setHeader("Set-Cookie", clearCookie());
  res.status(200).json({ ok: true });
}
