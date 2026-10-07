import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { clientIp, rateLimit } from "../../../lib/rateLimit";
import { getDb } from "../../../lib/booking/db";
import { createBookingBody } from "../../../lib/booking/schemas";
import { createBooking } from "../../../lib/booking/service";
import { sendBookingEmails } from "../../../lib/booking/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  res.setHeader("Cache-Control", "no-store");

  const db = getDb();
  if (!db) return notConfigured(res);
  if (!rateLimit(`book:${clientIp(req)}`, 8, 10 * 60_000))
    return res.status(429).json({ error: "rate_limited" });

  const parsed = createBookingBody.safeParse(req.body);
  if (!parsed.success) return sendInvalid(res, parsed.error);

  try {
    const result = await createBooking(db, parsed.data);
    if (!result.ok) {
      return res.status(statusFor(result.error)).json(result);
    }
    const emailed = await sendBookingEmails(result.booking);
    res.status(201).json({ booking: result.booking, emailed });
  } catch (e) {
    serverError(res, e, "create booking");
  }
}
