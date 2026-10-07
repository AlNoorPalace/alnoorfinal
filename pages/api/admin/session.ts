import type { NextApiRequest, NextApiResponse } from "next";
import { allow } from "../../../lib/api";
import { adminConfigured, isAdmin } from "../../../lib/admin/auth";
import { getDb } from "../../../lib/booking/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET")) return;
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    configured: adminConfigured(),
    databaseConfigured: Boolean(getDb()),
    authed: isAdmin(req),
  });
}
