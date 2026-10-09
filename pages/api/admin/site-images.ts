import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError, statusFor } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { siteImageSet } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { adminImageInUse, adminSetSiteImage } from "../../../lib/booking/service";
import { storagePathOf } from "../../../lib/images";
import { revalidateSite } from "../../../lib/revalidate";
import { SITE_IMAGE_SLOTS, getSiteImageOverrides } from "../../../lib/siteImages";

/**
 * GET  -> every website picture slot with its current picture.
 * POST { slot, url } -> use this picture there ("" puts the bundled picture back).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET", "POST")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  try {
    if (req.method === "GET") {
      const overrides = await getSiteImageOverrides();
      return res.status(200).json({
        slots: SITE_IMAGE_SLOTS.map((s) => ({
          key: s.key,
          label: s.label,
          where: s.where,
          fallback: s.fallback,
          url: overrides[s.key] ?? null,
        })),
      });
    }

    const parsed = siteImageSet.safeParse(req.body);
    if (!parsed.success) return sendInvalid(res, parsed.error);
    const result = await adminSetSiteImage(db, parsed.data.slot, parsed.data.url);
    if (!result.ok) return res.status(statusFor(result.error)).json({ error: result.error });
    // Free the old uploaded file if nothing uses it any more.
    const prev = result.previous;
    if (prev && prev !== parsed.data.url) {
      const path = storagePathOf(prev);
      if (path && !(await adminImageInUse(db, prev))) await db.removeImage(path).catch(() => undefined);
    }
    await revalidateSite(res);
    res.status(200).json({ ok: true });
  } catch (e) {
    serverError(res, e, "admin site images");
  }
}
