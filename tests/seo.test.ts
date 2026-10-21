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

import { HOTELS as H2 } from "../data/hotels";
import { NEARBY } from "../data/hotelContent";
import { makeDb } from "./helpers/pg";

test("Parrys and Ooty have their listing address and nearby places", () => {
  const parrys = H2.find((h) => h.slug === "parrys")!;
  const ooty = H2.find((h) => h.slug === "ooty")!;
  assert.match(parrys.address!, /221\/222, NSC Bose Road, Parry's Corner.*600001$/);
  assert.match(ooty.address!, /Westbury Road.*Hill Bunk, Ooty.*643001$/);
  assert.equal(NEARBY.parrys.length, 4);
  assert.equal(NEARBY.ooty.length, 5);
  assert.ok(NEARBY.parrys.every((n) => n.detail));
});

test("structured data splits the address into street and PIN code", () => {
  const g: any = hotelPageJsonLd(H2.find((h) => h.slug === "parrys")!, []);
  const a = g["@graph"].find((n: any) => n["@type"] === "Hotel").address;
  assert.equal(a.postalCode, "600001");
  assert.equal(a.addressLocality, "Chennai");
  assert.equal(a.streetAddress, "2nd Floor, 221/222, NSC Bose Road, Parry's Corner, George Town");
  const o: any = hotelPageJsonLd(H2.find((h) => h.slug === "ooty")!, []);
  assert.equal(o["@graph"].find((n: any) => n["@type"] === "Hotel").address.streetAddress, "158, Westbury Road, 175 B4, Ooty Club Road, Hill Bunk");
  const noAddr: any = hotelPageJsonLd(H2.find((h) => h.slug === "koyambedu")!, []);
  assert.equal(noAddr["@graph"][0].address.streetAddress, undefined);
});

test("database: addresses are loaded for the two branches, editable, and empty elsewhere", async () => {
  const { rpc } = await makeDb();
  const list = await rpc("public_hotels", {});
  assert.match(list.find((h: any) => h.slug === "parrys").address, /NSC Bose Road/);
  assert.match(list.find((h: any) => h.slug === "ooty").address, /Hill Bunk/);
  assert.equal(list.find((h: any) => h.slug === "koyambedu").address, "");
  const r = await rpc("admin_save_hotel", { mode: "update", slug: "koyambedu", address: "1 Test Road, Chennai 600092" });
  assert.equal(r.hotel.address, "1 Test Road, Chennai 600092");
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "koyambedu", tagline: "x" })).hotel.address, "1 Test Road, Chennai 600092", "kept");
});
