import test from "node:test";
import assert from "node:assert/strict";
import { upiLink } from "../lib/upi";

test("UPI link carries payee, exact amount and booking reference", () => {
  const l = upiLink(1798, "AN-ABC123")!;
  const u = new URL(l.replace("upi://pay", "https://x/pay"));
  assert.equal(u.searchParams.get("pa"), "7338944222@okbizaxis");
  assert.equal(u.searchParams.get("am"), "1798.00");
  assert.equal(u.searchParams.get("cu"), "INR");
  assert.equal(u.searchParams.get("tn"), "Booking AN-ABC123");
});

test("no link for bad amounts", () => {
  for (const a of [0, -5, NaN, Infinity, 2_000_000]) assert.equal(upiLink(a, "X1"), null, String(a));
});

test("reference cannot inject extra UPI parameters", () => {
  const l = upiLink(100, "A&am=1&pa=evil@x")!;
  assert.equal(l.match(/[?&]pa=/g)!.length, 1);
  assert.equal(l.match(/[?&]am=/g)!.length, 1);
});

import { minAdvance, parseAdvance } from "../lib/upi";

test("advance: minimum 500, up to the booking total, whole rupees", () => {
  assert.deepEqual(parseAdvance("500", 1798), { ok: true, amount: 500 });
  assert.deepEqual(parseAdvance("1798", 1798), { ok: true, amount: 1798 });
  assert.deepEqual(parseAdvance(" 1000 ", 1798), { ok: true, amount: 1000 });
  for (const bad of ["", "499", "0", "1799", "12.5", "-600", "abc", "5e3", "1,000", "99999999"])
    assert.equal(parseAdvance(bad, 1798).ok, false, bad);
  assert.match((parseAdvance("499", 1798) as any).error, /minimum advance is ₹500/);
});

test("a bill under 500 can be paid in full", () => {
  assert.equal(minAdvance(300), 300);
  assert.equal(minAdvance(5000), 500);
  assert.deepEqual(parseAdvance("300", 300), { ok: true, amount: 300 });
  assert.equal(parseAdvance("299", 300).ok, false);
});

test("the QR link carries exactly the amount typed", () => {
  const p = parseAdvance("750", 1798);
  assert.ok(p.ok);
  assert.match(upiLink((p as any).amount, "ALN-ABC123")!, /am=750\.00/);
});
