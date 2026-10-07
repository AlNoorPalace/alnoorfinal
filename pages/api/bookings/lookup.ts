import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError } from "../../../lib/api";
import { clientIp, rateLimit } from "../../../lib/rateLimit";
import { getDb } from "../../../lib/booking/db";
import { lookupBody } from "../../../lib/booking/schemas";
import { lookupBooking } from "../../../lib/booking/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  res.setHeader("Cache-Control", "no-store");

  const db = getDb();
  if (!db) return notConfigured(res);
  // Reference + phone is the only credential, so keep guessing expensive.
  if (!rateLimit(`lookup:${clientIp(req)}`, 15, 10 * 60_000))
    return res.status(429).json({ error: "rate_limited" });

  const parsed = lookupBody.safeParse(req.body);
  if (!parsed.success) return sendInvalid(res, parsed.error);

  try {
    const result = await lookupBooking(db, parsed.data);
    if (!result.ok) return res.status(404).json({ error: "not_found" });
    res.status(200).json({ booking: result.booking });
  } catch (e) {
    serverError(res, e, "lookup");
  }
}
