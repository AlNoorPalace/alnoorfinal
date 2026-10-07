import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { MIGRATIONS, baseBooking, iso, makeDb } from "./helpers/pg";

const newHotel = (over: Record<string, unknown> = {}) => ({
  mode: "create", slug: "mysore", name: "Al Noor Mysore", city: "Mysuru", state: "Karnataka",
  tagline: "Near the palace", description: "A calm stay.", phone: "9876501234",
  lat: 12.2958, lng: 76.6394, image: "/img/lobby.webp", amenities: ["Wi-Fi", "Parking"], active: true,
  ...over,
});
const room = (hotel: string, over: Record<string, unknown> = {}) => ({
  hotel, name: "Deluxe", total_rooms: 2, base_rate: 1200, max_guests: 2, beds: 1, baths: 1, ...over,
});
const roomsOf = async (rpc: any, hotel: string) =>
  (await rpc("admin_list_room_types", {})).filter((r: any) => r.hotel === hotel);

test("upgrade: a database with bookings and edited stock keeps everything", async () => {
  const db = new PGlite();
  await db.exec(readFileSync(MIGRATIONS[0], "utf8"));
  const rpc = async (fn: string, p: unknown = {}) => (await db.query<any>(`select public.${fn}($1::jsonb) r`, [JSON.stringify(p)])).rows[0].r;
  // what a live site looks like after migration 1 + the old seed + some use
  await db.exec(`insert into public.room_types (hotel_slug, name, total_rooms, base_rate, max_guests) values
    ('triplicane','Deluxe',3,899,2), ('ooty','Standard',3,899,2), ('custom-place','Cabin',2,500,2)`);
  await db.exec(`update public.room_types set total_rooms = 9, base_rate = 950 where hotel_slug='triplicane'`);
  const b = await rpc("create_booking", baseBooking());
  assert.equal(b.ok, true);

  await db.exec(readFileSync(MIGRATIONS[1], "utf8"));   // the upgrade

  const rooms = await rpc("admin_list_room_types");
  const tri = rooms.find((r: any) => r.hotel === "triplicane" && r.name === "Deluxe");
  assert.deepEqual([tri.total_rooms, tri.base_rate, tri.bookings], [9, 950, 1], "edited stock/rate and booking kept");
  assert.equal(rooms.find((r: any) => r.hotel === "ooty" && r.name === "Standard").total_rooms, 3);
  const hotels = await rpc("admin_list_hotels");
  assert.equal(hotels.find((h: any) => h.slug === "triplicane").name, "Al Noor Triplicane", "known hotel details filled in");
  assert.equal(hotels.find((h: any) => h.slug === "custom-place").name, "Custom Place", "unknown slug gets a placeholder hotel");
  const got = await rpc("get_booking", { reference: b.booking.reference, phone: "9876543210" });
  assert.equal(got.booking.hotel_name, "Al Noor Triplicane");
  assert.equal((await rpc("room_availability", { hotel: "triplicane", check_in: iso(0), check_out: iso(2) }))[0].available, 8);
});

test("public_hotels: active hotels only, sorted, with their active rooms", async () => {
  const { rpc } = await makeDb();
  let list = await rpc("public_hotels", {});
  assert.deepEqual(list.map((h: any) => h.slug), ["triplicane", "parrys", "koyambedu", "electronic-city", "koramangala", "hyderabad", "ooty"]);
  const tri = list[0];
  assert.deepEqual(tri.rooms.map((r: any) => [r.name, r.price, r.beds, r.baths, r.maxGuests]),
    [["Deluxe", 899, 1, 1, 2], ["Triple", 1499, 2, 1, 3], ["Quadruple", 1999, 2, 1, 5], ["Suite", 2999, 1, 1, 2]]);
  assert.deepEqual(tri.amenities.slice(0, 2), ["Wi-Fi", "Parking"]);
  assert.equal(tri.lat, 13.0665);

  await rpc("admin_save_hotel", { mode: "update", slug: "ooty", active: false });
  list = await rpc("public_hotels", {});
  assert.equal(list.some((h: any) => h.slug === "ooty"), false, "hidden hotel not published");
  const dx = (await roomsOf(rpc, "parrys")).find((r: any) => r.name === "Deluxe");
  await rpc("admin_save_room_type", { id: dx.id, active: false });
  assert.deepEqual((await rpc("public_hotels", {})).find((h: any) => h.slug === "parrys").rooms.map((r: any) => r.name), ["Standard"]);
});

test("add a hotel: validation, duplicate slug, ordering, partial edits", async () => {
  const { rpc } = await makeDb();
  const ok = await rpc("admin_save_hotel", newHotel());
  assert.deepEqual([ok.ok, ok.hotel.slug, ok.hotel.sort_order, ok.hotel.room_types, ok.hotel.bookings], [true, "mysore", 8, 0, 0]);
  assert.equal((await rpc("admin_save_hotel", newHotel())).error, "slug_taken");
  for (const bad of [{ slug: "Bad Slug" }, { slug: "-x" }, { slug: "a--b" }, { slug: "x".repeat(41) }, { name: "A" }, { city: "" },
                     { phone: "12345" }, { phone: "98765abcde" }, { lat: 120 }, { lng: -200 }]) {
    const r = await rpc("admin_save_hotel", newHotel({ slug: "tmp-" + Math.random().toString(36).slice(2, 6), ...bad }));
    // an invalid slug override replaces the generated one, others keep the generated slug
    assert.deepEqual([r.ok, r.error], [false, "invalid"], JSON.stringify(bad));
  }
  assert.equal((await rpc("admin_list_hotels", {})).length, 8, "rejected hotels were not saved");

  // partial update keeps the rest; lat/lng can be cleared
  const up = await rpc("admin_save_hotel", { mode: "update", slug: "mysore", tagline: "New tagline", lat: null, lng: "" });
  assert.deepEqual([up.hotel.tagline, up.hotel.name, up.hotel.lat, up.hotel.lng, up.hotel.phone], ["New tagline", "Al Noor Mysore", null, null, "9876501234"]);
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "nowhere", name: "Xx" })).error, "not_found");
  assert.equal((await rpc("admin_save_hotel", { mode: "update", slug: "mysore", amenities: [] })).hotel.amenities.length, 0);
});

test("a new hotel with new rooms is bookable straight away; a hidden hotel is not", async () => {
  const { rpc } = await makeDb();
  await rpc("admin_save_hotel", newHotel());
  const r = await rpc("admin_save_room_type", room("mysore", { name: "Palace View", total_rooms: 1, base_rate: 1500 }));
  assert.equal(r.ok, true);
  const q = { hotel: "mysore", check_in: iso(0), check_out: iso(2) };
  assert.deepEqual((await rpc("room_availability", q)).map((x: any) => [x.room_type, x.available, x.rate]), [["Palace View", 1, 1500]]);
  const b = await rpc("create_booking", baseBooking({ hotel: "mysore", room_type: "Palace View" }));
  assert.deepEqual([b.ok, b.booking.total, b.booking.hotel_name], [true, 3000, "Al Noor Mysore"]);
  assert.equal((await rpc("create_booking", baseBooking({ hotel: "mysore", room_type: "Palace View" }))).error, "sold_out");

  await rpc("admin_save_hotel", { mode: "update", slug: "mysore", active: false });
  assert.deepEqual(await rpc("room_availability", q), [], "hidden hotel offers nothing");
  assert.equal((await rpc("create_booking", baseBooking({ hotel: "mysore", room_type: "Palace View" }))).error, "room_not_found");
  assert.equal((await rpc("get_booking", { reference: b.booking.reference, phone: "9876543210" })).ok, true, "existing booking still viewable");
  await rpc("admin_save_hotel", { mode: "update", slug: "mysore", active: true });
  assert.equal((await rpc("room_availability", q)).length, 1, "showing it again restores it");
});

test("room types: create, rename, duplicate/invalid/unknown-hotel errors, delete rules", async () => {
  const { rpc } = await makeDb();
  assert.equal((await rpc("admin_save_room_type", room("ooty", { name: "Cottage" }))).ok, true);
  assert.equal((await rpc("admin_save_room_type", room("ooty", { name: "Cottage" }))).error, "name_taken");
  assert.equal((await rpc("admin_save_room_type", room("atlantis"))).error, "hotel_not_found");
  for (const bad of [{ total_rooms: -1 }, { base_rate: 0 }, { max_guests: 0 }, { beds: 0 }, { baths: 25 }, { name: null }])
    assert.equal((await rpc("admin_save_room_type", room("ooty", { name: "Tmp" + Math.random(), ...bad }))).error, "invalid", JSON.stringify(bad));
  const cottage = (await roomsOf(rpc, "ooty")).find((r: any) => r.name === "Cottage");
  assert.equal((await rpc("admin_save_room_type", { id: cottage.id, name: "Standard" })).error, "name_taken", "rename onto an existing name");
  assert.equal((await rpc("admin_save_room_type", { id: cottage.id, name: "Garden Cottage", beds: 2 })).room_type.name, "Garden Cottage");

  // delete: free of bookings -> removed; with bookings -> refused
  const b = await rpc("create_booking", baseBooking({ hotel: "ooty", room_type: "Garden Cottage" }));
  assert.equal(b.ok, true);
  const refused = await rpc("admin_delete_room_type", { id: cottage.id });
  assert.deepEqual([refused.ok, refused.error, refused.bookings], [false, "has_bookings", 1]);
  const spare = (await rpc("admin_save_room_type", room("ooty", { name: "Spare" }))).room_type;
  assert.equal((await rpc("admin_delete_room_type", { id: spare.id })).ok, true);
  assert.equal((await rpc("admin_delete_room_type", { id: spare.id })).error, "not_found");
  assert.equal((await roomsOf(rpc, "ooty")).some((r: any) => r.name === "Spare"), false);
});

test("delete a hotel: only when it has no bookings; removes its rooms; closures cascade", async () => {
  const { rpc, db } = await makeDb();
  await rpc("admin_save_hotel", newHotel());
  const rt = (await rpc("admin_save_room_type", room("mysore"))).room_type;
  await rpc("admin_add_block", { room_type_id: rt.id, from: iso(0), to: iso(1), rooms: 1, reason: "paint" });
  assert.equal((await rpc("admin_delete_hotel", { slug: "mysore" })).ok, true);
  assert.equal(((await db.query("select count(*)::int n from public.room_types where hotel_slug='mysore'")).rows[0] as any).n, 0);
  assert.equal(((await db.query("select count(*)::int n from public.room_blocks")).rows[0] as any).n, 0, "closures removed with the rooms");
  assert.equal((await rpc("admin_delete_hotel", { slug: "mysore" })).error, "not_found");

  // a hotel with a (even cancelled) booking can't be deleted, only hidden
  const b = await rpc("create_booking", baseBooking());   // triplicane
  const refused = await rpc("admin_delete_hotel", { slug: "triplicane" });
  assert.deepEqual([refused.ok, refused.error, refused.bookings], [false, "has_bookings", 1]);
  await rpc("cancel_booking", { reference: b.booking.reference, admin: true });
  assert.equal((await rpc("admin_delete_hotel", { slug: "triplicane" })).error, "has_bookings", "cancelled bookings still protect history");
  assert.equal((await rpc("admin_list_hotels", {})).find((h: any) => h.slug === "triplicane").room_types, 4, "nothing was removed");
});

test("closures take rooms off sale for exactly the closed nights and stop bookings", async () => {
  const { rpc } = await makeDb();
  const dx = (await roomsOf(rpc, "triplicane")).find((r: any) => r.name === "Deluxe");   // 3 rooms
  const add = await rpc("admin_add_block", { room_type_id: dx.id, from: iso(1), to: iso(2), rooms: 2, reason: "Renovation" });
  assert.deepEqual([add.ok, add.overbooked_nights, add.block.rooms], [true, 0, 2]);
  const avail = async (a: number, b: number) =>
    (await rpc("room_availability", { hotel: "triplicane", check_in: iso(a), check_out: iso(b) })).find((r: any) => r.room_type === "Deluxe").available;
  assert.equal(await avail(0, 1), 3, "night before the closure is unaffected");
  assert.equal(await avail(1, 2), 1, "first closed night");
  assert.equal(await avail(2, 3), 1, "to-date is INCLUSIVE: second closed night");
  assert.equal(await avail(3, 4), 3, "night after is unaffected");
  assert.equal(await avail(0, 4), 1, "a stay spanning the closure gets the minimum");

  assert.equal((await rpc("create_booking", baseBooking({ check_in: iso(1), check_out: iso(2), rooms: 2 }))).error, "sold_out");
  assert.equal((await rpc("create_booking", baseBooking({ check_in: iso(1), check_out: iso(2), rooms: 1 }))).ok, true);
  assert.equal((await rpc("create_booking", baseBooking({ check_in: iso(3), check_out: iso(4), rooms: 3, adults: 6 }))).ok, true);

  // remove the closure -> rooms return (one is now booked)
  assert.equal((await rpc("admin_delete_block", { id: add.block.id })).ok, true);
  assert.equal(await avail(1, 2), 2);
  assert.equal((await rpc("admin_delete_block", { id: add.block.id })).error, "not_found");
});

test("closing everything (default) and the overbooking warning", async () => {
  const { rpc } = await makeDb();
  const dx = (await roomsOf(rpc, "triplicane")).find((r: any) => r.name === "Deluxe");
  await rpc("create_booking", baseBooking({ check_in: iso(1), check_out: iso(3), rooms: 2, adults: 4 }));
  const all = await rpc("admin_add_block", { room_type_id: dx.id, from: iso(0), to: iso(4), reason: "Closed" });   // no rooms -> all 3
  assert.deepEqual([all.ok, all.block.rooms, all.overbooked_nights], [true, 3, 2], "2 nights already hold 2 rooms + 3 closed > 3 total");
  assert.equal((await rpc("room_availability", { hotel: "triplicane", check_in: iso(0), check_out: iso(1) })).find((r: any) => r.room_type === "Deluxe").available, 0);
  assert.equal((await rpc("admin_add_block", { room_type_id: dx.id, from: iso(5), to: iso(4) })).error, "invalid_dates");
  assert.equal((await rpc("admin_add_block", { room_type_id: dx.id, from: iso(0), to: iso(400) })).error, "invalid_dates");
  assert.equal((await rpc("admin_add_block", { room_type_id: dx.id, from: iso(5), to: iso(6), rooms: 0 })).error, "invalid");
  assert.equal((await rpc("admin_add_block", { room_type_id: "00000000-0000-0000-0000-000000000000", from: iso(5), to: iso(6) })).error, "not_found");
});

test("availability calendar and closure list", async () => {
  const { rpc } = await makeDb();
  const dx = (await roomsOf(rpc, "triplicane")).find((r: any) => r.name === "Deluxe");
  const month = iso(0).slice(0, 7);
  const first = `${month}-01`;
  await rpc("create_booking", baseBooking({ check_in: iso(0), check_out: iso(2) }));
  await rpc("admin_add_block", { room_type_id: dx.id, from: iso(1), to: iso(1), rooms: 1, reason: "Fumigation" });
  const cal = await rpc("admin_calendar", { room_type_id: dx.id, month });
  assert.equal(cal.ok, true);
  assert.equal(cal.days.length, new Date(Date.UTC(+month.slice(0, 4), +month.slice(5), 0)).getUTCDate(), "one entry per day");
  assert.equal(cal.days[0].date, first);
  const day = (n: number) => cal.days.find((d: any) => d.date === iso(n));
  assert.deepEqual([day(0).booked, day(0).blocked, day(0).available], [1, 0, 2]);
  assert.deepEqual([day(1).booked, day(1).blocked, day(1).available], [1, 1, 1]);
  assert.deepEqual([day(2).booked, day(2).blocked, day(2).available], [0, 0, 3], "check-out day is free");
  assert.equal((await rpc("admin_calendar", { room_type_id: dx.id, month: "nonsense" })).error, "invalid");
  assert.equal((await rpc("admin_calendar", { room_type_id: "00000000-0000-0000-0000-000000000000", month })).error, "not_found");

  const blocks = await rpc("admin_list_blocks", { today: iso(0) });
  assert.deepEqual(blocks.map((b: any) => [b.hotel, b.room_type, b.from, b.reason]), [["triplicane", "Deluxe", iso(1), "Fumigation"]]);
  assert.equal((await rpc("admin_list_blocks", { today: iso(5) })).length, 0, "past closures drop off");
  assert.equal((await rpc("admin_list_blocks", { today: iso(0), hotel: "ooty" })).length, 0);
});

test("everything admin/new is locked to the service role", async () => {
  const { db } = await makeDb();
  // PGlite has no anon/service_role roles; check PUBLIC has no execute on any of our functions.
  const r = await db.query(`select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('public', p.oid, 'execute')
      and (p.proname like 'admin_%' or p.proname in ('public_hotels','create_booking','room_availability','_peak_usage'))`);
  assert.deepEqual(r.rows, []);
});
