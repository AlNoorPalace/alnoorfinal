import test from "node:test";
import assert from "node:assert/strict";
import { addDays, todayIST } from "../lib/booking/config";
import { availabilityQuery, createBookingBody, lookupBody, normalizePhone } from "../lib/booking/schemas";

const ci = addDays(todayIST(), 10);
const co = addDays(todayIST(), 13);
const valid = {
  hotel: "triplicane", roomType: "Deluxe", checkIn: ci, checkOut: co,
  rooms: 1, adults: 2, children: 0, name: "Asha Rao", phone: "9876543210",
  email: "", notes: "", corporate: false,
};
const bad = (over: object) => createBookingBody.safeParse({ ...valid, ...over });
const fieldsOf = (r: ReturnType<typeof bad>) => (r.success ? [] : r.error.issues.map((i) => String(i.path[0])));

test("a valid booking passes", () => assert.equal(bad({}).success, true));

test("phone numbers are normalised to the last 10 digits", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "9876543210");
  assert.equal(normalizePhone("098765 43210"), "9876543210");
  const r = bad({ phone: "+91 98765 43210" });
  assert.equal(r.success && r.data.phone, "9876543210");
  assert.deepEqual(fieldsOf(bad({ phone: "12345" })), ["phone"]);
});

test("dates: past, inverted, too long, too far ahead, malformed", () => {
  assert.deepEqual(fieldsOf(bad({ checkIn: addDays(todayIST(), -1), checkOut: co })), ["checkIn"]);
  assert.deepEqual(fieldsOf(bad({ checkIn: co, checkOut: ci })), ["checkOut"]);
  assert.deepEqual(fieldsOf(bad({ checkOut: addDays(ci, 31) })), ["checkOut"]);
  assert.ok(fieldsOf(bad({ checkIn: addDays(todayIST(), 400), checkOut: addDays(todayIST(), 402) })).includes("checkIn"));
  assert.ok(fieldsOf(bad({ checkIn: "2030-02-31" })).includes("checkIn"));
  assert.ok(fieldsOf(bad({ checkIn: "tomorrow" })).includes("checkIn"));
  assert.equal(bad({ checkIn: todayIST(), checkOut: addDays(todayIST(), 1) }).success, true, "today is allowed");
});

test("hotel and room type must exist together", () => {
  assert.ok(fieldsOf(bad({ hotel: "mars" })).includes("hotel"));
  assert.deepEqual(fieldsOf(bad({ roomType: "Penthouse" })), ["roomType"]);
  assert.deepEqual(fieldsOf(bad({ hotel: "parrys", roomType: "Suite" })), ["roomType"], "Suite is not a Parrys room");
  assert.equal(bad({ hotel: "parrys", roomType: "Standard" }).success, true);
});

test("guest counts, name, email and honeypot", () => {
  assert.deepEqual(fieldsOf(bad({ rooms: 7 })), ["rooms"]);
  assert.deepEqual(fieldsOf(bad({ adults: 0 })), ["adults"]);
  assert.deepEqual(fieldsOf(bad({ children: -1 })), ["children"]);
  assert.deepEqual(fieldsOf(bad({ name: "A" })), ["name"]);
  assert.deepEqual(fieldsOf(bad({ email: "not-an-email" })), ["email"]);
  assert.equal(bad({ email: "a@b.co" }).success, true);
  assert.deepEqual(fieldsOf(bad({ website: "http://spam" })), ["website"]);
  assert.equal(bad({ website: "" }).success, true);
  assert.deepEqual(fieldsOf(bad({ notes: "x".repeat(501) })), ["notes"]);
});

test("unknown client fields (e.g. a price) are stripped, never forwarded", () => {
  const r = bad({ total: 1, nightlyRate: 1, discountPct: 100 });
  assert.equal(r.success, true);
  const keys = Object.keys((r as any).data);
  for (const forbidden of ["total", "nightlyRate", "discountPct"]) assert.ok(!keys.includes(forbidden), forbidden);
});

test("availability query and lookup body", () => {
  assert.equal(availabilityQuery.safeParse({ hotel: "ooty", checkIn: ci, checkOut: co }).success, true);
  assert.equal(availabilityQuery.safeParse({ hotel: "ooty", checkIn: co, checkOut: ci }).success, false);
  assert.equal(lookupBody.safeParse({ reference: "ALN-ABC234", phone: "98765 43210" }).success, true);
  assert.equal(lookupBody.safeParse({ reference: "ALN-ABC234", phone: "123" }).success, false);
});
