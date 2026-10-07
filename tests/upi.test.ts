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
