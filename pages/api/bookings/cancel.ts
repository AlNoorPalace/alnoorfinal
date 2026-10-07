import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { clientIp, rateLimit } from "../../../lib/rateLimit";
import { getDb } from "../../../lib/booking/db";
import { lookupBody } from "../../../lib/booking/schemas";
import { cancelBooking } from "../../../lib/booking/service";
import { sendCancellationEmail } from "../../../lib/booking/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  res.setHeader("Cache-Control", "no-store");

  const db = getDb();
  if (!db) return notConfigured(res);
  if (!rateLimit(`cancel:${clientIp(req)}`, 10, 10 * 60_000))
    return res.status(429).json({ error: "rate_limited" });

  const parsed = lookupBody.safeParse(req.body);
  if (!parsed.success) return sendInvalid(res, parsed.error);

  try {
    const result = await cancelBooking(db, parsed.data);
    if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
    if (!result.already_cancelled) await sendCancellationEmail(result.booking);
    res.status(200).json({ booking: result.booking });
  } catch (e) {
    serverError(res, e, "cancel booking");
  }
}
