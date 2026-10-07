import test from "node:test";
import assert from "node:assert/strict";
import { blockAdd, calendarQuery, hotelSave, roomSave, uploadBody } from "../lib/admin/schemas";
import { DEFAULT_HOTEL_IMAGE, isAllowedImageUrl, safeImage, sniffImage } from "../lib/images";

process.env.SUPABASE_URL = "https://abcd1234.supabase.co";
const STORAGE = "https://abcd1234.supabase.co/storage/v1/object/public/hotel-images/";

const fieldsOf = (r: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  r.success ? [] : Array.from(new Set(r.error!.issues.map((i) => String(i.path[0]))));
const create = (over: object = {}) =>
  hotelSave.safeParse({ mode: "create", slug: "al-noor-mysore", name: "Al Noor Mysore", city: "Mysuru", ...over });

test("hotel: creating needs a name and a city; updating does not", () => {
  assert.equal(create().success, true);
  assert.deepEqual(fieldsOf(create({ name: undefined })), ["name"]);
  assert.deepEqual(fieldsOf(create({ city: "" })), ["city"]);
  assert.equal(hotelSave.safeParse({ mode: "update", slug: "ooty", tagline: "Hills" }).success, true);
});

test("hotel: slug rules", () => {
  for (const bad of ["Al Noor", "al_noor", "-x", "x-", "a--b", "", "x".repeat(41), "ünï"]) assert.deepEqual(fieldsOf(create({ slug: bad })), ["slug"], bad);
  for (const good of ["ooty", "al-noor-2", "a1"]) assert.equal(create({ slug: good }).success, true, good);
});

test("hotel: phone is normalised to 10 digits (blank allowed), coordinates are coerced and range-checked", () => {
  const ok = create({ phone: "+91 98450-12345", lat: "12.2958", lng: 76.6394 });
  assert.ok(ok.success);
  assert.deepEqual([ok.data.phone, ok.data.lat, ok.data.lng], ["9845012345", 12.2958, 76.6394]);
  assert.equal((create({ phone: "" }) as any).data.phone, "");
  assert.deepEqual(fieldsOf(create({ phone: "12345" })), ["phone"]);
  const blank = create({ lat: "", lng: null });
  assert.ok(blank.success);
  assert.deepEqual([blank.data.lat, blank.data.lng], [null, null], "blank clears the map");
  assert.deepEqual(fieldsOf(create({ lat: 91 })), ["lat"]);
  assert.deepEqual(fieldsOf(create({ lng: "-181" })), ["lng"]);
  assert.deepEqual(fieldsOf(create({ lat: "abc" })), ["lat"]);
});

test("hotel: only known amenities, bounded text, photo must come from an allowed source", () => {
  assert.equal(create({ amenities: ["Wi-Fi", "Parking"] }).success, true);
  assert.deepEqual(fieldsOf(create({ amenities: ["Helipad"] })), ["amenities"]);
  assert.deepEqual(fieldsOf(create({ description: "x".repeat(1501) })), ["description"]);
  assert.deepEqual(fieldsOf(create({ tagline: "x".repeat(161) })), ["tagline"]);
  assert.equal(create({ image: "/img/lobby.webp" }).success, true);
  assert.equal(create({ image: STORAGE + "5ccc46cd-2274.webp" }).success, true);
  for (const bad of ["https://evil.example/x.jpg", "javascript:alert(1)", "/img/../secret.png", "/other/lobby.webp", "//evil.example/x.jpg", STORAGE + "../x.jpg", "https://other.supabase.co/storage/v1/object/public/hotel-images/x.jpg"])
    assert.deepEqual(fieldsOf(create({ image: bad })), ["image"], bad);
});

test("image rules: allow-list, safe fallback", () => {
  assert.equal(isAllowedImageUrl("/img/reviews/sonu.webp"), true);
  assert.equal(isAllowedImageUrl("/img/a b.webp"), false);
  assert.equal(safeImage("https://evil.example/x.jpg"), DEFAULT_HOTEL_IMAGE);
  assert.equal(safeImage(undefined), DEFAULT_HOTEL_IMAGE);
  assert.equal(safeImage("/img/pool-dusk.webp"), "/img/pool-dusk.webp");
});

test("uploads: file type comes from the real bytes, not the name or declared type", () => {
  const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(30)]);
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(30)]);
  const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(20)]);
  assert.deepEqual(sniffImage(jpg), { mime: "image/jpeg", ext: "jpg" });
  assert.deepEqual(sniffImage(png), { mime: "image/png", ext: "png" });
  assert.deepEqual(sniffImage(webp), { mime: "image/webp", ext: "webp" });
  for (const bad of [Buffer.from("GIF89a" + "x".repeat(40)), Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"),
                     Buffer.from("<html><script>alert(1)</script></html>"), Buffer.from("MZ" + "x".repeat(60)), Buffer.alloc(5), Buffer.from("RIFF....WAVE" + "x".repeat(20))])
    assert.equal(sniffImage(bad), null);
  assert.equal(uploadBody.safeParse({ data: "short" }).success, false);
  assert.equal(uploadBody.safeParse({ data: "A".repeat(200) }).success, true);
  assert.equal(uploadBody.safeParse({ data: "A".repeat(5_000_001) }).success, false);
});

test("room types: creating needs hotel, name and rate; ranges enforced", () => {
  const ok = { hotel: "ooty", name: "Cottage", base_rate: 1800 };
  assert.equal(roomSave.safeParse(ok).success, true);
  assert.deepEqual(fieldsOf(roomSave.safeParse({ ...ok, hotel: undefined })), ["hotel"]);
  assert.deepEqual(fieldsOf(roomSave.safeParse({ ...ok, name: "" })), ["name"]);
  assert.deepEqual(fieldsOf(roomSave.safeParse({ hotel: "ooty", name: "X" })), ["base_rate"]);
  assert.equal(roomSave.safeParse({ id: "3f9d1c0e-5b7a-4c53-9f3a-1d2e3f4a5b6c", total_rooms: 5 }).success, true, "update by id needs nothing else");
  for (const bad of [{ total_rooms: -1 }, { total_rooms: 501 }, { base_rate: 0 }, { max_guests: 0 }, { beds: 21 }, { baths: 0 }, { total_rooms: 1.5 }])
    assert.equal(roomSave.safeParse({ ...ok, ...bad }).success, false, JSON.stringify(bad));
  assert.deepEqual(fieldsOf(roomSave.safeParse({ ...ok, id: "not-a-uuid" })), ["id"]);
});

test("closures and calendar queries", () => {
  const id = "3f9d1c0e-5b7a-4c53-9f3a-1d2e3f4a5b6c";
  assert.equal(blockAdd.safeParse({ room_type_id: id, from: "2030-01-10", to: "2030-01-12", rooms: 1, reason: "Paint" }).success, true);
  assert.equal(blockAdd.safeParse({ room_type_id: id, from: "2030-01-10", to: "2030-01-12" }).success, true, "rooms optional = all");
  assert.equal(blockAdd.safeParse({ room_type_id: id, from: "10/01/2030", to: "2030-01-12" }).success, false);
  assert.equal(blockAdd.safeParse({ room_type_id: id, from: "2030-01-10", to: "2030-01-12", rooms: 0 }).success, false);
  assert.equal(blockAdd.safeParse({ room_type_id: id, from: "2030-01-10", to: "2030-01-12", reason: "x".repeat(201) }).success, false);
  assert.equal(calendarQuery.safeParse({ roomTypeId: id, month: "2030-02" }).success, true);
  for (const m of ["2030-13", "2030-00", "2030-2", "feb 2030", "2030-02-01"]) assert.equal(calendarQuery.safeParse({ roomTypeId: id, month: m }).success, false, m);
});
