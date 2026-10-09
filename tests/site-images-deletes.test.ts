import test from "node:test";
import assert from "node:assert/strict";
import { baseBooking, makeDb } from "./helpers/pg";
import { siteImageSet } from "../lib/admin/schemas";
import { DEFAULT_SITE_IMAGES, SITE_IMAGE_SLOTS } from "../lib/siteImagesDefaults";

const U1 = "http://127.0.0.1:54321/storage/v1/object/public/hotel-images/a.webp";

test("website pictures: set, replace, reset, and the default stays when no row", async () => {
  const { rpc } = await makeDb();
  assert.deepEqual(await rpc("site_images", {}), {}, "nothing overridden at first");
  assert.deepEqual(await rpc("admin_set_site_image", { slot: "hero", url: U1 }), { ok: true, previous: null });
  assert.deepEqual(await rpc("site_images", {}), { hero: U1 });
  assert.equal((await rpc("admin_set_site_image", { slot: "hero", url: "/img/lobby.webp" })).previous, U1);
  assert.equal((await rpc("admin_set_site_image", { slot: "hero", url: "" })).previous, "/img/lobby.webp");
  assert.deepEqual(await rpc("site_images", {}), {}, "reset removes the row");
  assert.equal((await rpc("admin_set_site_image", { slot: "BAD SLOT!", url: U1 })).error, "invalid");
});

test("every slot has a bundled default and the schema only allows known slots and safe URLs", () => {
  assert.equal(Object.keys(DEFAULT_SITE_IMAGES).length, SITE_IMAGE_SLOTS.length);
  assert.equal(siteImageSet.safeParse({ slot: "hero", url: "/img/lobby.webp" }).success, true);
  assert.equal(siteImageSet.safeParse({ slot: "hero", url: "" }).success, true);
  assert.equal(siteImageSet.safeParse({ slot: "nope", url: "/img/lobby.webp" }).success, false);
  assert.equal(siteImageSet.safeParse({ slot: "hero", url: "https://evil.example/x.jpg" }).success, false);
});

test("photo usage lists hotels, rooms and website pictures; in-use sees site pictures", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_set_site_image", { slot: "about_main", url: U1 });
  assert.equal(await rpc("admin_image_in_use", { url: U1 }), true);
  const usage = await rpc("admin_image_usage", {});
  assert.deepEqual(usage.find((u: any) => u.url === U1).used_by, ["Website picture: about_main"]);
  assert.ok(usage.some((u: any) => u.used_by.some((l: string) => l.endsWith("(cover)"))));
  await rpc("admin_set_site_image", { slot: "about_main", url: "" });
  assert.equal(await rpc("admin_image_in_use", { url: U1 }), false);
});

test("deleting a booking removes it and frees the room", async () => {
  const { rpc } = await makeDb();
  const b = await rpc("create_booking", baseBooking());
  assert.equal(b.ok, true);
  const ref = b.booking.reference;
  assert.equal((await rpc("admin_delete_booking", { reference: ref.toLowerCase() })).ok, true);
  assert.equal((await rpc("admin_list_bookings", {})).some((x: any) => x.reference === ref), false);
  assert.equal((await rpc("admin_delete_booking", { reference: ref })).error, "not_found");
  assert.equal((await rpc("get_booking", { reference: ref, phone: "9876543210" })).ok, false);
});

test("hotels and rooms with bookings: refused, then deleted together with the bookings when forced", async () => {
  const { rpc } = await makeDb();
  const b = await rpc("create_booking", baseBooking());
  const slug = b.booking.hotel;
  const refused = await rpc("admin_delete_hotel", { slug });
  assert.equal(refused.error, "has_bookings");
  assert.ok(refused.bookings >= 1);
  assert.equal((await rpc("admin_list_hotels", {})).some((h: any) => h.slug === slug), true, "still there");

  const done = await rpc("admin_delete_hotel", { slug, force: true });
  assert.equal(done.ok, true);
  assert.ok(done.deleted_bookings >= 1);
  assert.equal((await rpc("admin_list_hotels", {})).some((h: any) => h.slug === slug), false);
  assert.equal((await rpc("admin_list_bookings", {})).some((x: any) => x.reference === b.booking.reference), false);
});

test("forced room-type delete takes its bookings but not other rooms' bookings", async () => {
  const { rpc } = await makeDb();
  const b1 = await rpc("create_booking", baseBooking());
  const rooms = (await rpc("admin_list_room_types", {})).filter((r: any) => r.hotel === b1.booking.hotel);
  const other = rooms.find((r: any) => r.name !== b1.booking.room_type)!;
  const b2 = await rpc("create_booking", baseBooking({ room_type: other.name }));
  assert.equal(b2.ok, true);
  const mine = rooms.find((r: any) => r.name === b1.booking.room_type)!;
  assert.equal((await rpc("admin_delete_room_type", { id: mine.id })).error, "has_bookings");
  assert.equal((await rpc("admin_delete_room_type", { id: mine.id, force: true })).ok, true);
  const left = (await rpc("admin_list_bookings", {})).map((x: any) => x.reference);
  assert.equal(left.includes(b1.booking.reference), false);
  assert.equal(left.includes(b2.booking.reference), true);
});
