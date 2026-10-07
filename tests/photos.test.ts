import test from "node:test";
import assert from "node:assert/strict";
import { makeDb } from "./helpers/pg";
import { hotelSave, roomSave, deleteImageBody } from "../lib/admin/schemas";
import { storagePathOf } from "../lib/images";

const U1 = "http://127.0.0.1:54321/storage/v1/object/public/hotel-images/a.webp";
const U2 = "http://127.0.0.1:54321/storage/v1/object/public/hotel-images/b.webp";

test("hotel gallery and room photos are stored and published", async () => {
  const { rpc } = await makeDb();
  const h = await rpc("admin_save_hotel", {
    mode: "create", slug: "mysore", name: "Al Noor Mysore", city: "Mysuru",
    image: "/img/lobby.webp", images: ["/img/reception.webp", U1],
  });
  assert.equal(h.ok, true);
  assert.deepEqual(h.hotel.images, ["/img/reception.webp", U1]);

  const r = await rpc("admin_save_room_type", { hotel: "mysore", name: "Deluxe", base_rate: 1200, images: [U2, "/img/room-2.webp"] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.room_type.images, [U2, "/img/room-2.webp"]);

  const pub = (await rpc("public_hotels", {})).find((x: any) => x.slug === "mysore");
  assert.deepEqual(pub.images, ["/img/reception.webp", U1]);
  assert.deepEqual(pub.rooms[0].images, [U2, "/img/room-2.webp"]);
});

test("deleting a photo (saving a shorter list) works, and omitting images keeps them", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", { mode: "create", slug: "x1", name: "X One", city: "Chennai", images: [U1, U2] });
  const rt = (await rpc("admin_save_room_type", { hotel: "x1", name: "Std", base_rate: 900, images: [U1, U2] })).room_type;

  // an update that doesn't mention images leaves them alone
  assert.deepEqual((await rpc("admin_save_hotel", { mode: "update", slug: "x1", tagline: "hi" })).hotel.images, [U1, U2]);
  assert.deepEqual((await rpc("admin_save_room_type", { id: rt.id, name: "Std" })).room_type.images, [U1, U2]);

  // removing one photo, then all of them
  assert.deepEqual((await rpc("admin_save_room_type", { id: rt.id, images: [U2] })).room_type.images, [U2]);
  assert.deepEqual((await rpc("admin_save_room_type", { id: rt.id, images: [] })).room_type.images, []);
  assert.deepEqual((await rpc("admin_save_hotel", { mode: "update", slug: "x1", images: [] })).hotel.images, []);
});

test("existing hotels and rooms start with no extra photos", async () => {
  const { rpc } = await makeDb();
  const list = await rpc("public_hotels", {});
  assert.ok(list.length > 0);
  for (const h of list) {
    assert.deepEqual(h.images, []);
    for (const r of h.rooms) assert.deepEqual(r.images, []);
  }
});

test("photo limits are enforced by the database", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", { mode: "create", slug: "x2", name: "X Two", city: "Chennai" });
  const many = (n: number) => Array.from({ length: n }, (_, i) => `/img/p${i}.webp`);
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "x2", images: many(13) })).error, "invalid");
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "x2", images: many(12) })).ok, true);
  assert.equal((await rpc("admin_save_room_type", { hotel: "x2", name: "R", base_rate: 500, images: many(9) })).error, "invalid");
  assert.equal((await rpc("admin_save_room_type", { hotel: "x2", name: "R", base_rate: 500, images: many(8) })).ok, true);
});

test("admin_image_in_use sees hotel cover, gallery and room photos", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", { mode: "create", slug: "x3", name: "X Three", city: "Chennai", image: U1, images: [U2] });
  await rpc("admin_save_room_type", { hotel: "x3", name: "R", base_rate: 500, images: ["/img/room-3.webp"] });
  assert.equal(await rpc("admin_image_in_use", { url: U1 }), true);
  assert.equal(await rpc("admin_image_in_use", { url: U2 }), true);
  assert.equal(await rpc("admin_image_in_use", { url: "/img/room-3.webp" }), true);
  assert.equal(await rpc("admin_image_in_use", { url: "/img/none.webp" }), false);
});

test("schemas only accept site photos and cap the count", () => {
  assert.equal(roomSave.safeParse({ hotel: "ooty", name: "X", base_rate: 5, images: ["/img/room-1.webp"] }).success, true);
  assert.equal(roomSave.safeParse({ hotel: "ooty", name: "X", base_rate: 5, images: ["https://evil.example/a.jpg"] }).success, false);
  assert.equal(roomSave.safeParse({ hotel: "ooty", name: "X", base_rate: 5, images: Array(9).fill("/img/room-1.webp") }).success, false);
  assert.equal(hotelSave.safeParse({ mode: "update", slug: "ooty", images: Array(13).fill("/img/lobby.webp") }).success, false);
  assert.equal(hotelSave.safeParse({ mode: "update", slug: "ooty", images: ["/img/lobby.webp", "/img/../secret"] }).success, false);
  assert.equal(deleteImageBody.safeParse({ url: "/img/x.webp" }).success, true);
});

test("only files in our own bucket can be removed from storage", () => {
  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  assert.equal(storagePathOf(U1), "a.webp");
  assert.equal(storagePathOf("/img/lobby.webp"), null);
  assert.equal(storagePathOf("https://evil.example/storage/v1/object/public/hotel-images/a.webp"), null);
  assert.equal(storagePathOf("http://127.0.0.1:54321/storage/v1/object/public/hotel-images/../x"), null);
});
