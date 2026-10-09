import test from "node:test";
import assert from "node:assert/strict";
import { addDays, todayIST } from "../lib/booking/config";
import { createBookingBody } from "../lib/booking/schemas";
import { adminCancel, cancelBooking, createBooking, getAvailability, lookupBooking } from "../lib/booking/service";
import { makeDb } from "./helpers/pg";

const start = addDays(todayIST(), 20);
const input = (over: object = {}) =>
  createBookingBody.parse({
    hotel: "electronic-city", roomType: "Deluxe Twin", checkIn: start, checkOut: addDays(start, 4),
    rooms: 1, adults: 2, children: 0, name: "Meera Nair", phone: "+91 98123 45678",
    email: "meera@example.com", corporate: false, ...over,
  });

test("online bookings never get a discount, even if an old page still sends corporate: true", async () => {
  const { dbApi: db } = await makeDb();
  const plain = await createBooking(db, input());
  assert.ok(plain.ok && plain.booking);
  assert.deepEqual([plain.booking.subtotal, plain.booking.discount, plain.booking.total], [5996, 0, 5996]);
  const old = await createBooking(db, input({ corporate: true }));
  assert.ok(old.ok && old.booking);
  assert.deepEqual([old.booking.discount, old.booking.total, old.booking.corporate], [0, 5996, false]);
});

test("availability, lookup and cancel round-trip through the service layer", async () => {
  const { dbApi: db } = await makeDb();
  const q = { hotel: "electronic-city", checkIn: start, checkOut: addDays(start, 2) };
  assert.equal((await getAvailability(db, q)).find((r) => r.room_type === "Deluxe Twin")?.available, 3);

  const r = await createBooking(db, input({ rooms: 3, adults: 6 }));
  assert.ok(r.ok && r.booking);
  const ref = r.booking.reference;
  assert.equal((await getAvailability(db, q)).find((x) => x.room_type === "Deluxe Twin")?.available, 0);

  assert.equal((await lookupBooking(db, { reference: ref, phone: "9812345678" })).ok, true);
  assert.equal((await lookupBooking(db, { reference: ref, phone: "9000000000" })).ok, false);
  assert.equal((await cancelBooking(db, { reference: ref, phone: "9000000000" })).ok, false);
  const c = await cancelBooking(db, { reference: ref, phone: "9812345678" });
  assert.ok(c.ok && c.booking.status === "cancelled");
  assert.equal((await getAvailability(db, q)).find((x) => x.room_type === "Deluxe Twin")?.available, 3);
  const again = await adminCancel(db, ref);
  assert.ok(again.ok);
});

test("sold-out surfaces as a structured error, not an exception", async () => {
  const { dbApi: db } = await makeDb();
  await createBooking(db, input({ rooms: 3, adults: 6 }));
  const r = await createBooking(db, input());
  assert.deepEqual([r.ok, !r.ok && r.error, !r.ok && r.available], [false, "sold_out", 0]);
});
