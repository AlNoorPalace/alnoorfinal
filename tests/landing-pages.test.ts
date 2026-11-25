import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { LANDING_PAGES } from "../data/landingPages";
import { landingPageJsonLd } from "../data/seo";

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

test("each page has its own title, description, heading and photos (no copies)", () => {
  for (const key of ["title", "description", "h1", "intro"] as const) {
    assert.equal(new Set(LANDING_PAGES.map((p) => p[key])).size, LANDING_PAGES.length, key);
  }
  for (const p of LANDING_PAGES) {
    assert.ok(p.description.length <= 160, `${p.slug} description is ${p.description.length} characters`);
    assert.ok(p.title.length <= 65, `${p.slug} title is ${p.title.length} characters`);
    assert.ok(p.faqs.length >= 3);
    assert.ok(p.photos.length >= 2 && p.photos[0].src === p.hero.src);
  }
  const heroes = LANDING_PAGES.map((p) => p.hero.src);
  assert.equal(new Set(heroes).size, heroes.length, "every page leads with a different photo");
});

test("every photo file exists and every photo has alt text", () => {
  for (const p of LANDING_PAGES) {
    assert.ok(existsSync(`public${p.ogImage}`), p.ogImage);
    for (const ph of [p.hero, ...p.photos]) {
      assert.ok(existsSync(`public${ph.src}`), ph.src);
      assert.ok(ph.alt.length > 15, `alt text for ${ph.src}`);
    }
  }
});

test("structured data: hotel, page, breadcrumb and FAQ", () => {
  const g: any = landingPageJsonLd(LANDING_PAGES[0], { phone: "9600158529", lat: 13.0855, lng: 80.2822 });
  assert.deepEqual(g["@graph"].map((n: any) => n["@type"]), ["Hotel", "WebPage", "BreadcrumbList", "FAQPage"]);
  assert.equal(g["@graph"][0].address.postalCode, "600001");
  assert.equal(g["@graph"][3].mainEntity.length, LANDING_PAGES[0].faqs.length);
});
