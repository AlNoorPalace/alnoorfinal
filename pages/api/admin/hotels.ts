import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { hotelDelete, hotelSave } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { adminDeleteHotel, adminListHotels, adminSaveHotel } from "../../../lib/booking/service";
import { revalidateSite } from "../../../lib/revalidate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "POST", "DELETE")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") return res.status(200).json({ hotels: await adminListHotels(db) });

    if (req.method === "POST") {
      const parsed = hotelSave.safeParse(req.body);
      if (!parsed.success) return sendInvalid(res, parsed.error);
      const result = await adminSaveHotel(db, parsed.data);
      if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
      await revalidateSite(res, [parsed.data.slug]);
      return res.status(parsed.data.mode === "create" ? 201 : 200).json({ hotel: result.hotel });
    }

    const parsed = hotelDelete.safeParse(req.body);
    if (!parsed.success) return sendInvalid(res, parsed.error);
    const result = await adminDeleteHotel(db, parsed.data.slug);
    if (!result.ok) {
      return res.status(statusFor(result.error)).json(result);
    }
    await revalidateSite(res, [parsed.data.slug]);
    res.status(200).json({ ok: true });
  } catch (e) {
    serverError(res, e, "admin hotels");
  }
}
