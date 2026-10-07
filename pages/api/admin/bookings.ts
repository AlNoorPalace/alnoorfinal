import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { getDb } from "../../../lib/booking/db";
import { adminCancel, adminListBookings } from "../../../lib/booking/service";
import { sendCancellationEmail } from "../../../lib/booking/mail";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(""));
const filters = z.object({
  hotel: z.string().max(40).optional(),
  status: z.enum(["confirmed", "cancelled", ""]).optional(),
  from: date,
  to: date,
  q: z.string().max(60).optional(),
});
const cancelBody = z.object({ reference: z.string().trim().min(6).max(20) });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "POST")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") {
      const f = filters.safeParse(req.query);
      if (!f.success) return sendInvalid(res, f.error);
      return res.status(200).json({ bookings: await adminListBookings(db, f.data) });
    }
    const b = cancelBody.safeParse(req.body);
    if (!b.success) return sendInvalid(res, b.error);
    const result = await adminCancel(db, b.data.reference);
    if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
    await sendCancellationEmail(result.booking);
    res.status(200).json({ booking: result.booking });
  } catch (e) {
    serverError(res, e, "admin bookings");
  }
}
