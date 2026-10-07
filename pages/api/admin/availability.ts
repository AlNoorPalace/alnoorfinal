import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { blockAdd, calendarQuery, idBody } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { todayIST } from "../../../lib/booking/config";
import {
  adminAddBlock,
  adminCalendar,
  adminDeleteBlock,
  adminListBlocks,
} from "../../../lib/booking/service";

/**
 * GET    ?roomTypeId=&month=YYYY-MM  -> calendar for one room type + its closures
 * POST   { room_type_id, from, to, rooms?, reason? } -> close rooms for dates
 * DELETE { id }                       -> reopen
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "POST", "DELETE")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") {
      const q = calendarQuery.safeParse(req.query);
      if (!q.success) return sendInvalid(res, q.error);
      const cal = await adminCalendar(db, { room_type_id: q.data.roomTypeId, month: q.data.month });
      if (!cal.ok) return res.status(statusFor(cal.error)).json({ error: cal.error });
      const blocks = await adminListBlocks(db, { room_type_id: q.data.roomTypeId, today: todayIST() });
      return res.status(200).json({ roomType: cal.room_type, days: cal.days, blocks });
    }

    if (req.method === "POST") {
      const b = blockAdd.safeParse(req.body);
      if (!b.success) return sendInvalid(res, b.error);
      const result = await adminAddBlock(db, b.data);
      if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
      return res.status(201).json({ block: result.block, overbookedNights: result.overbooked_nights });
    }

    const d = idBody.safeParse(req.body);
    if (!d.success) return sendInvalid(res, d.error);
    const result = await adminDeleteBlock(db, d.data.id);
    if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
    res.status(200).json({ ok: true });
  } catch (e) {
    serverError(res, e, "admin availability");
  }
}
