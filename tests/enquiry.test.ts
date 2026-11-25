import test from "node:test";
import assert from "node:assert/strict";
import { cleanPhone, enquiryLink } from "../components/site/EnquiryPopup";

test("phone numbers: 10-digit Indian mobiles, with or without +91 or 0", () => {
  assert.equal(cleanPhone("98765 43210"), "9876543210");
  assert.equal(cleanPhone("+91 98765-43210"), "9876543210");
  assert.equal(cleanPhone("919876543210"), "9876543210");
  assert.equal(cleanPhone("09876543210"), "9876543210");
  for (const bad of ["", "12345", "5876543210", "98765432101", "abcdefghij", "0000000000"]) assert.equal(cleanPhone(bad), null, bad);
});

test("the WhatsApp link carries exactly what the guest typed, safely encoded", () => {
  const url = enquiryLink({ name: "Meera & Sons", phone: "+91 9876543210", message: "2 rooms, 10-12 Dec\nCheck-in early?", page: "https://www.alnoorpalace.in/hotels/parrys" });
  assert.ok(url.startsWith("https://wa.me/919600158529?text="));
  const text = decodeURIComponent(url.split("?text=")[1]);
  assert.match(text, /Name: Meera & Sons/);
  assert.match(text, /Contact number: \+91 9876543210/);
  assert.match(text, /Message: 2 rooms, 10-12 Dec\nCheck-in early\?/);
  assert.match(text, /Page: https:\/\/www\.alnoorpalace\.in\/hotels\/parrys/);
  assert.ok(!url.includes(" ") && !url.includes("\n"), "no raw spaces or line breaks in the URL");
  assert.equal(url.match(/\?/g)!.length, 1, "no extra query separators injected");
});

test("no message line when the optional message is empty", () => {
  const text = decodeURIComponent(enquiryLink({ name: "Ravi", phone: "+91 9876543210", message: "", page: "https://x/y" }).split("?text=")[1]);
  assert.ok(!text.includes("Message:"));
});
