import test from "node:test";
import assert from "node:assert/strict";
import { HOTELS, SITE_URL, absUrl } from "../data/hotels";
import { aggregateRooms } from "../data/rooms";
import { hotelPageJsonLd, roomPageJsonLd } from "../data/seo";

test("absUrl keeps absolute photo URLs and prefixes site paths", () => {
  assert.equal(absUrl("/img/lobby.webp"), `${SITE_URL}/img/lobby.webp`);
  assert.equal(absUrl("https://x.supabase.co/storage/v1/object/public/hotel-images/a.webp"), "https://x.supabase.co/storage/v1/object/public/hotel-images/a.webp");
});

test("hotel structured data has photos, map, room offers and breadcrumb", () => {
  const h = HOTELS[0];
  const g: any = hotelPageJsonLd(h, []);
  const hotel = g["@graph"].find((n: any) => n["@type"] === "Hotel");
  assert.ok(hotel.image.length >= 1 && hotel.image.every((u: string) => u.startsWith("http")));
  assert.match(hotel.hasMap, /google\.com\/maps/);
  assert.ok(hotel.containsPlace.every((r: any) => r.offers.priceCurrency === "INR" && r.offers.price > 0));
  assert.ok(g["@graph"].some((n: any) => n["@type"] === "BreadcrumbList"));
});

test("room page structured data lists each hotel's price", () => {
  const room = aggregateRooms(HOTELS).find((r) => r.name === "Deluxe")!;
  const g: any = roomPageJsonLd(room, ["https://x/y.webp"]);
  const node = g["@graph"][0];
  assert.equal(node["@type"], "HotelRoom");
  assert.equal(node.offers.length, room.offers.length);
  assert.ok(node.offers.every((o: any) => o.priceCurrency === "INR"));
});
