import type { NextApiRequest, NextApiResponse } from "next";
import { allow } from "../../lib/api";
import { getSiteHotels } from "../../lib/siteHotels";

/** Public list of hotels (what the website shows). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET")) return;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ hotels: await getSiteHotels() });
}
