// Room types as guests see them: one page per room name (for example "Deluxe"),
// built from whatever the hotels currently offer in the admin. Nothing here is
// stored separately, so adding or removing a room in /admin changes these pages.
import { FEATURED_ROOMS, Hotel } from "./hotels";

export interface RoomOffer {
  hotelSlug: string;
  hotelName: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  maxGuests: number;
  images: string[];
}

export interface RoomKind {
  slug: string;
  name: string;
  description: string;
  featured: boolean;
  beds: number;
  baths: number;
  /** The most guests any hotel's version of this room takes. */
  maxGuests: number;
  minPrice: number;
  /** Photos uploaded in the admin for this room, across hotels (may be empty). */
  images: string[];
  offers: RoomOffer[];
}

export const roomSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const norm = (s: string) => s.trim().toLowerCase();

/** Wording written for the original room types, used until the admin writes one. */
const FALLBACK_COPY = new Map(FEATURED_ROOMS.map((r) => [norm(r.title), r]));

export function aggregateRooms(hotels: Hotel[]): RoomKind[] {
  const byName = new Map<string, RoomKind>();

  for (const h of hotels) {
    for (const r of h.rooms) {
      const key = norm(r.name);
      const offer: RoomOffer = {
        hotelSlug: h.slug,
        hotelName: h.name,
        city: h.city,
        price: r.price,
        beds: r.beds,
        baths: r.baths,
        maxGuests: r.maxGuests,
        images: r.images ?? [],
      };
      const known = FALLBACK_COPY.get(key);
      const kind =
        byName.get(key) ??
        ({
          slug: roomSlug(r.name),
          name: r.name,
          description: "",
          featured: Boolean(known?.tag),
          beds: r.beds,
          baths: r.baths,
          maxGuests: r.maxGuests,
          minPrice: r.price,
          images: [],
          offers: [],
        } satisfies RoomKind);
      if (!kind.description && r.description) kind.description = r.description;
      kind.offers.push(offer);
      for (const img of offer.images) if (!kind.images.includes(img)) kind.images.push(img);
      if (r.price < kind.minPrice) {
        kind.minPrice = r.price;
        kind.beds = r.beds;
        kind.baths = r.baths;
      }
      kind.maxGuests = Math.max(kind.maxGuests, r.maxGuests);
      byName.set(key, kind);
    }
  }

  const kinds = Array.from(byName.values());
  for (const k of kinds) {
    k.offers.sort((a, b) => a.price - b.price || a.hotelName.localeCompare(b.hotelName));
    if (!k.description) {
      k.description =
        FALLBACK_COPY.get(norm(k.name))?.description ??
        `${k.name}: ${k.beds} bed${k.beds > 1 ? "s" : ""}, ${k.baths} bath, for up to ${k.maxGuests} guests.`;
    }
  }
  // Cheapest first, like the original list.
  return kinds.sort((a, b) => a.minPrice - b.minPrice || a.name.localeCompare(b.name));
}

export const findRoom = (hotels: Hotel[], slug: string): RoomKind | undefined =>
  aggregateRooms(hotels).find((r) => r.slug === slug);

/** Placeholder shots used when a room has no uploaded photos, so every room page has a picture. */
const PLACEHOLDERS = ["/img/room-1.webp", "/img/room-2.webp", "/img/room-3.webp", "/img/room-4.webp", "/img/room-5.webp"];

export const roomImages = (room: RoomKind, index: number): string[] =>
  room.images.length > 0 ? room.images : [PLACEHOLDERS[index % PLACEHOLDERS.length]];
