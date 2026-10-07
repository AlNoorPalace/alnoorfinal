import test from "node:test";
import assert from "node:assert/strict";
import { baseBooking, iso, makeDb } from "./helpers/pg";

const avail = (rows: any[], name: string) => rows.find((r) => r.room_type === name);

test("migrations load the 7 hotels and 19 room types with the site's prices", async () => {
  const { db } = await makeDb();
  const r = await db.query("select count(*)::int n from public.room_types");
  assert.equal((r.rows[0] as any).n, 19);
  assert.equal(((await db.query("select count(*)::int n from public.hotels")).rows[0] as any).n, 7);
  const { rpc } = await makeDb();
  const rows = await rpc("room_availability", { hotel: "parrys", check_in: iso(0), check_out: iso(1) });
  assert.deepEqual(rows.map((x: any) => [x.room_type, x.rate]), [["Standard", 799], ["Deluxe", 1499]]);
});

test("availability reflects confirmed bookings, per night", async () => {
  const { rpc } = await makeDb();
  const q = { hotel: "triplicane", check_in: iso(0), check_out: iso(3) };
  assert.equal(avail(await rpc("room_availability", q), "Deluxe").available, 3);

  const b = await rpc("create_booking", baseBooking({ check_in: iso(1), check_out: iso(2), rooms: 2 }));
  assert.equal(b.ok, true);
  // The booked night leaves 1 room for any range that includes it...
  assert.equal(avail(await rpc("room_availability", q), "Deluxe").available, 1);
  // ...but ranges that don't touch it are unaffected.
  assert.equal(
    avail(await rpc("room_availability", { ...q, check_in: iso(2), check_out: iso(3) }), "Deluxe").available, 3);
});

test("check-out day is free: back-to-back stays do not collide", async () => {
  const { rpc } = await makeDb();
  const a = await rpc("create_booking", baseBooking({ check_in: iso(0), check_out: iso(2), rooms: 3 }));
  assert.equal(a.ok, true);
  const same = await rpc("create_booking", baseBooking({ check_in: iso(1), check_out: iso(3), rooms: 1 }));
  assert.deepEqual([same.ok, same.error], [false, "sold_out"]);
  const next = await rpc("create_booking", baseBooking({ check_in: iso(2), check_out: iso(4), rooms: 3 }));
  assert.equal(next.ok, true, "arriving on the previous guest's check-out day is allowed");
});

test("never oversells: 5 competing requests for 3 rooms -> exactly 3 succeed", async () => {
  const { rpc } = await makeDb();
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) => rpc("create_booking", baseBooking({ guest_name: `G${i}` })))
  );
  assert.equal(results.filter((r) => r.ok).length, 3);
  assert.equal(results.filter((r) => r.error === "sold_out").length, 2);
  const refs = results.filter((r) => r.ok).map((r) => r.booking.reference);
  assert.equal(new Set(refs).size, 3, "references are unique");
  assert.ok(refs.every((r: string) => /^ALN-[A-HJKMNP-Z2-9]{6}$/.test(r)), "references use the unambiguous alphabet");
});

test("multi-room request needs all rooms free", async () => {
  const { rpc } = await makeDb();
  await rpc("create_booking", baseBooking({ rooms: 2 }));
  const r = await rpc("create_booking", baseBooking({ rooms: 2 }));
  assert.deepEqual([r.ok, r.error, r.available], [false, "sold_out", 1]);
});

test("price comes from the database, corporate discount is applied server-side", async () => {
  const { rpc } = await makeDb();
  const r = await rpc("create_booking", baseBooking({
    hotel: "electronic-city", room_type: "Deluxe Twin", check_in: iso(0), check_out: iso(4),
    rooms: 1, corporate: true, discount_pct: 20,
  }));
  assert.equal(r.ok, true);
  assert.deepEqual(
    [r.booking.nightly_rate, r.booking.nights, r.booking.subtotal, r.booking.discount, r.booking.total],
    [1499, 4, 5996, 1199, 4797]);
  // a caller-supplied price is ignored: there is no price field in the contract
  const r2 = await rpc("create_booking", { ...baseBooking({ room_type: "Suite" }), nightly_rate: 1, total: 1 });
  assert.equal(r2.booking.nightly_rate, 2999);
});

test("capacity and input limits are enforced", async () => {
  const { rpc } = await makeDb();
  assert.equal((await rpc("create_booking", baseBooking({ adults: 3 }))).error, "over_capacity"); // Deluxe max 2
  assert.equal((await rpc("create_booking", baseBooking({ adults: 3, rooms: 2 }))).ok, true);
  assert.equal((await rpc("create_booking", baseBooking({ check_out: iso(0) }))).error, "invalid_dates");
  assert.equal((await rpc("create_booking", baseBooking({ check_out: iso(31) }))).error, "invalid_dates");
  assert.equal((await rpc("create_booking", baseBooking({ rooms: 7 }))).error, "invalid_guests");
  assert.equal((await rpc("create_booking", baseBooking({ room_type: "Penthouse" }))).error, "room_not_found");
  assert.equal((await rpc("create_booking", baseBooking({ hotel: "nowhere" }))).error, "room_not_found");
});

test("lookup needs the reference AND the matching phone", async () => {
  const { rpc } = await makeDb();
  const { booking } = await rpc("create_booking", baseBooking({ guest_phone: "+91 98765-43210" }));
  assert.equal(booking.guest_phone, "9876543210", "phone is normalised to 10 digits");
  assert.equal((await rpc("get_booking", { reference: booking.reference.toLowerCase(), phone: "09876543210" })).ok, true);
  assert.equal((await rpc("get_booking", { reference: booking.reference, phone: "9000000000" })).error, "not_found");
  assert.equal((await rpc("get_booking", { reference: "ALN-NOPE22", phone: "9876543210" })).error, "not_found");
});

test("cancelling releases the rooms; cancel is idempotent; phone must match", async () => {
  const { rpc } = await makeDb();
  const full = await rpc("create_booking", baseBooking({ rooms: 3 }));
  const ref = full.booking.reference;
  assert.equal((await rpc("create_booking", baseBooking())).error, "sold_out");

  assert.equal((await rpc("cancel_booking", { reference: ref, phone: "9000000000", today: iso(-5) })).error, "not_found");
  const c = await rpc("cancel_booking", { reference: ref, phone: "9876543210", today: iso(-5) });
  assert.deepEqual([c.ok, c.booking.status, c.booking.cancelled_by], [true, "cancelled", "guest"]);
  assert.equal((await rpc("cancel_booking", { reference: ref, phone: "9876543210", today: iso(-5) })).already_cancelled, true);
  assert.equal((await rpc("create_booking", baseBooking({ rooms: 3 }))).ok, true, "rooms are bookable again");
});

test("guests cannot cancel a stay that already started; admin can", async () => {
  const { rpc } = await makeDb();
  const { booking } = await rpc("create_booking", baseBooking());
  const late = await rpc("cancel_booking", { reference: booking.reference, phone: "9876543210", today: iso(1) });
  assert.equal(late.error, "stay_started");
  const adm = await rpc("cancel_booking", { reference: booking.reference, admin: true, today: iso(1) });
  assert.deepEqual([adm.ok, adm.booking.cancelled_by], [true, "admin"]);
});

test("admin: list/filter bookings and update rooms & rates", async () => {
  const { rpc } = await makeDb();
  await rpc("create_booking", baseBooking({ guest_name: "Alice Rao" }));
  const o = await rpc("create_booking", baseBooking({ hotel: "ooty", room_type: "Standard", guest_name: "Bob" }));
  await rpc("cancel_booking", { reference: o.booking.reference, admin: true });
  assert.equal((await rpc("admin_list_bookings", {})).length, 2);
  assert.equal((await rpc("admin_list_bookings", { hotel: "ooty" })).length, 1);
  assert.equal((await rpc("admin_list_bookings", { status: "cancelled" })).length, 1);
  assert.equal((await rpc("admin_list_bookings", { q: "alice" })).length, 1);
  assert.equal((await rpc("admin_list_bookings", { q: "98765" })).length, 2);
  assert.equal((await rpc("admin_list_bookings", { from: iso(5) })).length, 0);

  const rooms = await rpc("admin_list_room_types", {});
  assert.equal(rooms.length, 19);
  const dx = rooms.find((r: any) => r.hotel === "triplicane" && r.name === "Deluxe");
  const up = await rpc("admin_save_room_type", { id: dx.id, total_rooms: 10, base_rate: 950 });
  assert.deepEqual([up.ok, up.room_type.total_rooms, up.room_type.base_rate], [true, 10, 950]);
  assert.equal((await rpc("admin_save_room_type", { id: dx.id, total_rooms: -1 })).error, "invalid");
  assert.equal((await rpc("admin_save_room_type", { id: dx.id, base_rate: 0 })).error, "invalid");
  assert.equal((await rpc("admin_save_room_type", { id: "00000000-0000-0000-0000-000000000000" })).error, "not_found");
  // new rate/stock apply to new bookings
  const b = await rpc("create_booking", baseBooking({ rooms: 4, adults: 8 }));
  assert.deepEqual([b.ok, b.booking.nightly_rate], [true, 950]);
  // inactive room types disappear from availability and can't be booked
  await rpc("admin_save_room_type", { id: dx.id, active: false });
  assert.equal((await rpc("room_availability", { hotel: "triplicane", check_in: iso(0), check_out: iso(1) })).some((r: any) => r.room_type === "Deluxe"), false);
  assert.equal((await rpc("create_booking", baseBooking())).error, "room_not_found");
});

test("re-running the hotel migration never overwrites edited hotels, stock or rates", async () => {
  const { db, rpc } = await makeDb();
  const dx = (await rpc("admin_list_room_types", {})).find((r: any) => r.hotel === "ooty" && r.name === "Standard");
  await rpc("admin_save_room_type", { id: dx.id, total_rooms: 11, base_rate: 1234, beds: 3 });
  await rpc("admin_save_hotel", { mode: "update", slug: "ooty", name: "Al Noor Ooty Hills", tagline: "Edited" });
  await db.exec(require("node:fs").readFileSync("supabase/migrations/20260102000000_hotel_management.sql", "utf8"));
  const after = (await rpc("admin_list_room_types", {})).find((r: any) => r.id === dx.id);
  assert.deepEqual([after.total_rooms, after.base_rate, after.beds], [11, 1234, 3]);
  const hotel = (await rpc("admin_list_hotels", {})).find((h: any) => h.slug === "ooty");
  assert.deepEqual([hotel.name, hotel.tagline], ["Al Noor Ooty Hills", "Edited"]);
  assert.equal((await rpc("admin_list_hotels", {})).length, 7);
});

test("row level security is on for every table", async () => {
  const { db } = await makeDb();
  const r = await db.query("select relname, relrowsecurity from pg_class where relname in ('room_types','bookings','hotels','room_blocks') order by 1");
  assert.deepEqual(r.rows.map((x: any) => [x.relname, x.relrowsecurity]),
    [["bookings", true], ["hotels", true], ["room_blocks", true], ["room_types", true]]);
});
