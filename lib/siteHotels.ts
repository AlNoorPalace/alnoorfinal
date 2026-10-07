import { HOTELS, Hotel, RoomType } from "../data/hotels";
import { getDb } from "./booking/db";
import { safeImage } from "./images";

interface DbRoom {
  name: string;
  price: number;
  beds: number;
  baths: number;
  maxGuests: number;
}
interface DbHotel {
  slug: string;
  name: string;
  city: string;
  state: string;
  tagline: string;
  description: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  image: string;
  amenities: string[];
  rooms: DbRoom[];
}

const toHotel = (h: DbHotel): Hotel => ({
  slug: h.slug,
  name: h.name,
  city: h.city,
  state: h.state ?? "",
  tagline: h.tagline ?? "",
  description: h.description ?? "",
  phone: h.phone ?? "",
  lat: typeof h.lat === "number" ? h.lat : null,
  lng: typeof h.lng === "number" ? h.lng : null,
  image: safeImage(h.image),
  amenities: Array.isArray(h.amenities) ? h.amenities : [],
  rooms: (h.rooms ?? []).map(
    (r): RoomType => ({
      name: r.name,
      price: r.price,
      beds: r.beds,
      baths: r.baths,
      maxGuests: r.maxGuests,
    })
  ),
});

/** How long (seconds) a generated page is served before it is rebuilt from the database. */
export const SITE_REVALIDATE_SECONDS = 300;

/**
 * The hotels to show on the website: active hotels from the database, or the
 * built-in copy when the database is not configured or cannot be reached.
 * (If the database answers with an empty list, that is respected: it means every
 * hotel has been hidden or removed on purpose.)
 */
export async function getSiteHotels(): Promise<Hotel[]> {
  const db = getDb();
  if (!db) return HOTELS;
  try {
    const rows = await db.rpc<DbHotel[]>("public_hotels", {});
    if (!Array.isArray(rows)) return HOTELS;
    return rows.map(toHotel);
  } catch (e) {
    console.error("[hotels] could not load hotels from the database, using the built-in list:", e);
    return HOTELS;
  }
}
