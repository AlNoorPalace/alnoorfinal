import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { getDb } from "../../../lib/booking/db";
import { adminListRoomTypes, adminUpdateRoomType } from "../../../lib/booking/service";

const patch = z.object({
  id: z.string().uuid(),
  total_rooms: z.number().int().min(0).max(500).optional(),
  base_rate: z.number().int().min(1).max(1_000_000).optional(),
  active: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "PATCH")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") {
      return res.status(200).json({ roomTypes: await adminListRoomTypes(db) });
    }
    const p = patch.safeParse(req.body);
    if (!p.success) return sendInvalid(res, p.error);
    const result = await adminUpdateRoomType(db, p.data);
    if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
    res.status(200).json({ roomType: result.room_type });
  } catch (e) {
    serverError(res, e, "admin rooms");
  }
}
