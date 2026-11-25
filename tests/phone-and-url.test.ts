import test from "node:test";
import assert from "node:assert/strict";
import { baseBooking, makeDb } from "./helpers/pg";
import { CONTACT, HOTELS } from "../data/hotels";
import { hotelSave } from "../lib/admin/schemas";

test("one phone number everywhere: contact details, every built-in hotel and every hotel in the database", async () => {
  assert.deepEqual(CONTACT.phones, [{ label: "+91 96001 58529", tel: "+919600158529" }]);
  assert.equal(CONTACT.primaryTel, "+919600158529");
  assert.equal(CONTACT.whatsapp, "https://wa.me/919600158529");
  assert.ok(HOTELS.every((h) => h.phone === "9600158529"));
  const { rpc } = await makeDb();
  const hotels = await rpc("admin_list_hotels", {});
  assert.ok(hotels.length >= 7 && hotels.every((h: any) => h.phone === "9600158529"));
});

test("renaming a hotel's URL name keeps its rooms and bookings and redirects the old address", async () => {
  const { rpc } = await makeDb();
  const b = await rpc("create_booking", baseBooking()); // triplicane
  assert.equal(b.ok, true);
  const r = await rpc("admin_save_hotel", { mode: "update", slug: "triplicane", new_slug: "triplicane-marina" });
  assert.equal(r.ok, true);
  assert.equal(r.hotel.slug, "triplicane-marina");
  assert.equal((await rpc("admin_list_room_types", {})).filter((x: any) => x.hotel === "triplicane-marina").length > 0, true, "rooms moved");
  assert.equal((await rpc("admin_list_room_types", {})).some((x: any) => x.hotel === "triplicane"), false);
  const bookings = await rpc("admin_list_bookings", {});
  assert.equal(bookings.find((x: any) => x.reference === b.booking.reference).hotel, "triplicane-marina", "booking moved");
  assert.equal(await rpc("hotel_redirect", { slug: "triplicane" }), "triplicane-marina");
  assert.equal(await rpc("hotel_redirect", { slug: "parrys" }), null, "a live address does not redirect");
  assert.equal(await rpc("hotel_redirect", { slug: "never-existed" }), null);
  // the new address takes bookings
  const again = await rpc("create_booking", baseBooking({ hotel: "triplicane-marina", check_in: "2030-02-10", check_out: "2030-02-12" }));
  assert.equal(again.ok, true);
});

test("renaming twice follows the chain; renaming back removes the stale redirect; taken names are refused", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", { mode: "update", slug: "ooty", new_slug: "ooty-hills" });
  await rpc("admin_save_hotel", { mode: "update", slug: "ooty-hills", new_slug: "ooty-lake" });
  assert.equal(await rpc("hotel_redirect", { slug: "ooty" }), "ooty-lake", "first old address follows to the latest");
  assert.equal(await rpc("hotel_redirect", { slug: "ooty-hills" }), "ooty-lake");
  await rpc("admin_save_hotel", { mode: "update", slug: "ooty-lake", new_slug: "ooty" });
  assert.equal(await rpc("hotel_redirect", { slug: "ooty" }), null, "ooty is live again");
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "ooty", new_slug: "parrys" })).error, "slug_taken");
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "ooty", name: "Al Noor Ooty Hills" })).ok, true, "other edits still work without a rename");
});

test("a hidden hotel's old address does not redirect to a page that is not shown", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", { mode: "update", slug: "ooty", new_slug: "ooty-new", active: false });
  assert.equal(await rpc("hotel_redirect", { slug: "ooty" }), null);
});

test("the new URL name must be a valid address", () => {
  assert.equal(hotelSave.safeParse({ mode: "update", slug: "ooty", new_slug: "palace" }).success, true);
  for (const bad of ["Palace", "al noor", "../x", "a--b", "-x", "x".repeat(41), "palace/new"])
    assert.equal(hotelSave.safeParse({ mode: "update", slug: "ooty", new_slug: bad }).success, false, bad);
});
