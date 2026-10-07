import type { NextApiRequest, NextApiResponse } from "next";
import { allow, notConfigured, sendInvalid, serverError } from "../../lib/api";
import { clientIp, rateLimit } from "../../lib/rateLimit";
import { getDb } from "../../lib/booking/db";
import { availabilityQuery } from "../../lib/booking/schemas";
import { getAvailability, nightsFor } from "../../lib/booking/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allow(req, res, "GET")) return;
  res.setHeader("Cache-Control", "no-store");

  const db = getDb();
  if (!db) return notConfigured(res);
  if (!rateLimit(`avail:${clientIp(req)}`, 60, 60_000))
    return res.status(429).json({ error: "rate_limited" });

  const parsed = availabilityQuery.safeParse({
    hotel: req.query.hotel,
    checkIn: req.query.checkIn,
    checkOut: req.query.checkOut,
  });
  if (!parsed.success) return sendInvalid(res, parsed.error);

  const rooms = Math.min(Math.max(parseInt(String(req.query.rooms ?? "1"), 10) || 1, 1), 6);
  const guests = Math.max(parseInt(String(req.query.guests ?? "1"), 10) || 1, 1);

  try {
    const nights = nightsFor(parsed.data.checkIn, parsed.data.checkOut);
    const list = await getAvailability(db, parsed.data);
    if (list.length === 0) {
      console.warn(
        `[availability] No active room types found for "${parsed.data.hotel}". ` +
          "Has supabase/seed.sql been run (or are the rooms switched off in /admin)?"
      );
    }
    res.status(200).json({
      nights,
      rooms: list.map((r) => ({
        roomType: r.room_type,
        rate: r.rate,
        available: r.available,
        maxGuests: r.max_guests,
        // Can the requested number of rooms hold the party, and are they free?
        bookable: r.available >= rooms && guests <= r.max_guests * rooms,
        fitsParty: guests <= r.max_guests * rooms,
        total: r.rate * nights * rooms,
      })),
    });
  } catch (e) {
    serverError(res, e, "availability");
  }
}
