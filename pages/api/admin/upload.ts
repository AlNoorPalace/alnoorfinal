import { randomUUID } from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError } from "../../../lib/api";
import { requireAdmin } from "../../../lib/admin/auth";
import { uploadBody } from "../../../lib/admin/schemas";
import { getDb } from "../../../lib/booking/db";
import { MAX_IMAGE_BYTES, sniffImage } from "../../../lib/images";

export const config = { api: { bodyParser: { sizeLimit: "6mb" } } };

/** POST { data: <base64 image> } -> { url }. Real file type is checked from the bytes. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "POST")) return;
  if (!requireAdmin(req, res)) return;
  const db = getDb();
  if (!db) return notConfigured(res);

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
    serverError(res, e, "image upload");
  }
}
