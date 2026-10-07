import test from "node:test";
import assert from "node:assert/strict";
import { makeDb } from "./helpers/pg";
import { HOTELS } from "../data/hotels";
import { aggregateRooms, roomImages, roomSlug } from "../data/rooms";
import { roomSave } from "../lib/admin/schemas";

test("room types come from the hotels' rooms, cheapest first, one per name", () => {
  const rooms = aggregateRooms(HOTELS);
  const names = rooms.map((r) => r.name);
  assert.equal(new Set(names).size, names.length, "no duplicate names");
  assert.ok(names.includes("Deluxe"));
  for (let i = 1; i < rooms.length; i++) assert.ok(rooms[i - 1].minPrice <= rooms[i].minPrice);
  const deluxe = rooms.find((r) => r.name === "Deluxe")!;
  assert.equal(deluxe.minPrice, Math.min(...deluxe.offers.map((o) => o.price)));
  assert.ok(deluxe.offers.length >= 2, "offered at several hotels");
  assert.ok(deluxe.description.length > 10);
});

test("a room added in the admin appears, and one that is removed disappears", () => {
  const hotels = structuredClone(HOTELS);
  hotels[0].rooms.push({ name: "Family Loft", price: 2750, beds: 3, baths: 2, maxGuests: 6, description: "Two floors for a big family." });
  const loft = aggregateRooms(hotels).find((r) => r.slug === "family-loft")!;
  assert.equal(loft.description, "Two floors for a big family.");
  assert.equal(loft.offers[0].hotelSlug, hotels[0].slug);
  hotels[0].rooms = hotels[0].rooms.filter((r) => r.name !== "Family Loft");
  assert.equal(aggregateRooms(hotels).some((r) => r.slug === "family-loft"), false);
});

test("uploaded photos are used, otherwise a placeholder; description falls back", () => {
  const hotels = structuredClone(HOTELS);
  hotels[0].rooms.push({ name: "Plain Room", price: 500, beds: 1, baths: 1, maxGuests: 2 });
  const plain = aggregateRooms(hotels).find((r) => r.slug === "plain-room")!;
  assert.match(plain.description, /1 bed, 1 bath/);
  assert.equal(roomImages(plain, 7)[0], "/img/room-3.webp");
  plain.images = ["/img/room-5.webp", "/img/room-1.webp"];
  assert.deepEqual(roomImages(plain, 0), ["/img/room-5.webp", "/img/room-1.webp"]);
});

test("slugs", () => {
  assert.equal(roomSlug("Deluxe Triple"), "deluxe-triple");
  assert.equal(roomSlug("  King Suite!! "), "king-suite");
});

test("room description is stored, published and limited", async () => {
  const { rpc } = await makeDb();
  const first = (await rpc("admin_list_room_types", {}))[0];
  const saved = await rpc("admin_save_room_type", { id: first.id, description: "Quiet, high floor." });
  assert.equal(saved.room_type.description, "Quiet, high floor.");
  const pub = (await rpc("public_hotels", {})).find((h: any) => h.slug === first.hotel);
  assert.ok(pub.rooms.some((r: any) => r.description === "Quiet, high floor."));
  // an update without a description keeps it
  assert.equal((await rpc("admin_save_room_type", { id: first.id, base_rate: first.base_rate })).room_type.description, "Quiet, high floor.");
  assert.equal((await rpc("admin_save_room_type", { id: first.id, description: "x".repeat(601) })).error, "invalid");
  assert.equal(roomSave.safeParse({ id: first.id, description: "x".repeat(601) }).success, false);
});
