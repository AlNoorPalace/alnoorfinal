import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { idBody, roomSave } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { adminDeleteRoomType, adminListRoomTypes, adminSaveRoomType } from "../../../lib/booking/service";
import { revalidateSite } from "../../../lib/revalidate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "POST", "DELETE")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") return res.status(200).json({ roomTypes: await adminListRoomTypes(db) });

    if (req.method === "POST") {
      const parsed = roomSave.safeParse(req.body);
      if (!parsed.success) return sendInvalid(res, parsed.error);
      const result = await adminSaveRoomType(db, parsed.data);
      if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
      // A database without the photos migration silently ignores `images`; say so instead of "saving" nothing.
      if (parsed.data.images !== undefined && !Array.isArray(result.room_type.images))
        return res.status(409).json({ error: "migration_needed" });
      await revalidateSite(res);
      return res.status(parsed.data.id ? 200 : 201).json({ roomType: result.room_type });
    }

    const parsed = idBody.safeParse(req.body);
    if (!parsed.success) return sendInvalid(res, parsed.error);
    const result = await adminDeleteRoomType(db, parsed.data.id);
    if (!result.ok) return res.status(statusFor(result.error)).json(result);
    await revalidateSite(res);
    res.status(200).json({ ok: true });
  } catch (e) {
    serverError(res, e, "admin rooms");
  }
}
