import { randomUUID } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { deleteImageBody, uploadBody } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { adminImageInUse } from "../../../lib/booking/service";
import { MAX_IMAGE_BYTES, sniffImage, storagePathOf } from "../../../lib/images";

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

/**
 * POST { data: <base64 image> } -> { url }. Real file type is checked from the bytes.
 * DELETE { url } removes an uploaded file from storage, but only once no hotel or
 * room type uses it any more (bundled /img photos are never touched).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST", "DELETE")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

  if (req.method === "DELETE") {
    const del = deleteImageBody.safeParse(req.body);
    if (!del.success) return sendInvalid(res, del.error);
    const path = storagePathOf(del.data.url);
    if (!path) return res.status(200).json({ ok: true, removed: false });
    try {
      if (await adminImageInUse(db, del.data.url)) return res.status(200).json({ ok: true, removed: false });
      await db.removeImage(path);
      return res.status(200).json({ ok: true, removed: true });
    } catch (e) {
      return serverError(res, e, "image delete");
    }
  }

  const parsed = uploadBody.safeParse(req.body);
  if (!parsed.success) return sendInvalid(res, parsed.error);

  const bytes = Buffer.from(parsed.data.data.replace(/^data:[^;]+;base64,/, ""), "base64");
  if (bytes.length > MAX_IMAGE_BYTES) return res.status(413).json({ error: "too_large" });
  const kind = sniffImage(bytes);
  if (!kind) return res.status(415).json({ error: "unsupported_type" });

  try {
    const url = await db.uploadImage(`${randomUUID()}.${kind.ext}`, bytes, kind.mime);
    res.status(201).json({ url });
  } catch (e) {
    console.error("image upload failed", e);
    res.status(502).json({ error: "upload_failed" });
  }
}
