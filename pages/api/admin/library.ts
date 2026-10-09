import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, serverError } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { getDb } from "../../../lib/booking/db";
import { adminImageUsage } from "../../../lib/booking/service";

/** GET -> every uploaded photo, newest first, with where each one is used. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);
  try {
    const [files, usage] = await Promise.all([db.listImages(), adminImageUsage(db)]);
    const used = new Map(usage.map((u) => [u.url, u.used_by]));
    res.status(200).json({
      files: files.map((f) => ({ ...f, usedBy: used.get(f.url) ?? [] })),
    });
  } catch (e) {
    serverError(res, e, "admin library");
  }
}
