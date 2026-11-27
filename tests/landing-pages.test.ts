import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { LANDING_PAGES } from "../data/landingPages";
import { LANDING_SEO, LANDING_SEO_COMMON, landingJsonLd } from "../data/landingSeo";

test("five landing pages with the requested addresses", () => {
  assert.deepEqual(
    LANDING_PAGES.map((p) => p.slug),
    [
      "business-class-hotels-in-parrys-corner-chennai",
      "budget-hotels-in-parrys-corner-chennai",
      "budget-friendly-hotels-near-madras-high-court-chennai",
      "couple-friendly-hotels-in-egmore",
      "hotels-in-mannady-chennai",
    ]
  );
});

test("each page has its own heading, introduction and lead photo (no copies)", () => {
  for (const key of ["h1", "intro"] as const) {
    assert.equal(new Set(LANDING_PAGES.map((p) => p[key])).size, LANDING_PAGES.length, key);
  }
  for (const p of LANDING_PAGES) {
    assert.ok(p.faqs.length >= 3);
    assert.ok(p.photos.length >= 2 && p.photos[0].src === p.hero.src);
  }
  const heroes = LANDING_PAGES.map((p) => p.hero.src);
  assert.equal(new Set(heroes).size, heroes.length, "every page leads with a different photo");
});

test("every photo file exists and every photo has alt text", () => {
  for (const p of LANDING_PAGES) {
    for (const ph of [p.hero, ...p.photos]) {
      assert.ok(existsSync(`public${ph.src}`), ph.src);
      assert.ok(ph.alt.length > 15, `alt text for ${ph.src}`);
    }
  }
});

test("search block: every page has exactly the values from the owner's SEO document", () => {
  assert.deepEqual(Object.keys(LANDING_SEO), LANDING_PAGES.map((p) => p.slug));
  const e = LANDING_SEO["business-class-hotels-in-parrys-corner-chennai"];
  assert.equal(e.title, "Business Class Hotels in Parrys Corner Chennai | Premium Stays");
  assert.equal(e.canonical, "https://www.alnoorpalace.in/business-class-hotels-in-parrys-corner-chennai");
  assert.equal(e.ogTitle, "Premium Hotels in Parrys Corner | Al Noor Residency");
  assert.equal(LANDING_SEO["budget-hotels-in-parrys-corner-chennai"].title, "Budget Hotels in Parrys Corner | Family Hotel ");
  assert.equal(LANDING_SEO["budget-friendly-hotels-near-madras-high-court-chennai"].title, "Budget-Friendly Hotels Near Madras High Court Chennai");
  assert.equal(LANDING_SEO["couple-friendly-hotels-in-egmore"].title, "Couple-Friendly Hotels in Egmore, Chennai | Private Couple Stays");
  assert.equal(LANDING_SEO["hotels-in-mannady-chennai"].title, "Best Hotels in Mannady, Chennai | Premium Hotel");
  assert.equal(LANDING_SEO_COMMON.author, "Al NOOR RESIDENCY ");
  assert.equal(LANDING_SEO_COMMON.contact, "booking@alnoorresidency.in");
  for (const [slug, v] of Object.entries(LANDING_SEO)) {
    assert.equal(v.canonical, `https://www.alnoorpalace.in/${slug}`);
    assert.equal(v.jsonUrl, `https://www.alnoorpalace.in/${slug}/`);
  }
});

test("structured data is the document's LocalBusiness block", () => {
  const ld: any = landingJsonLd(LANDING_SEO["hotels-in-mannady-chennai"]);
  assert.equal(ld["@type"], "LocalBusiness");
  assert.equal(ld.name, "Al NOOR RESIDENCY");
  assert.equal(ld["@id"], "https://www.alnoorpalace.in/");
  assert.equal(ld.url, "https://www.alnoorpalace.in/hotels-in-mannady-chennai/");
  assert.equal(ld.address.streetAddress, "2nd Floor, 221/222, NSC Bose Rd, Parrys Corner, George Town,Tamil Nadu");
  assert.equal(ld.address.postalCode, "600001");
  assert.deepEqual([ld.geo.latitude, ld.geo.longitude], [13.08901, 80.28581]);
  assert.equal(ld.openingHoursSpecification.dayOfWeek.length, 7);
  assert.deepEqual([ld.openingHoursSpecification.opens, ld.openingHoursSpecification.closes], ["00:00", "23:59"]);
  assert.equal(ld.telephone, "+91 96001 58529");
});
