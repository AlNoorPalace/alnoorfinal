import { CONTACT, Hotel, SITE_URL, absUrl, hotelPhone, maxPrice, minPrice } from "./hotels";
import { roomSlug as roomSlugOf } from "./rooms";
import type { RoomKind } from "./rooms";
import { Faq } from "./hotelContent";

const priceRange = (h: Hotel) =>
  minPrice(h) === null ? undefined : `₹${minPrice(h)}–₹${maxPrice(h)}`;

/** The PIN code at the end of a listing address, if there is one. */
const postalCode = (h: Hotel) => h.address?.match(/\b\d{6}\b/)?.[0];

/** The street line: the listing address without its trailing ", City, State PIN". */
const streetOf = (h: Hotel): string | undefined => {
  if (!h.address) return undefined;
  const parts = h.address.split(",").map((p) => p.trim()).filter(Boolean);
  const same = (p: string, v: string) => v !== "" && p.replace(/\s*\d{6}$/, "").toLowerCase() === v.toLowerCase();
  // Drop a trailing "State PIN" and "City" only; "Ooty Club Road" must survive.
  if (parts.length > 1 && (same(parts[parts.length - 1], h.state) || /^\d{6}$/.test(parts[parts.length - 1]))) parts.pop();
  if (parts.length > 1 && same(parts[parts.length - 1], h.city)) parts.pop();
  return parts.join(", ");
};

/** schema.org postal address. */
const postalAddress = (h: Hotel) => ({
  "@type": "PostalAddress",
  streetAddress: streetOf(h),
  addressLocality: h.city,
  addressRegion: h.state || undefined,
  postalCode: postalCode(h),
  addressCountry: "IN",
});

const geo = (h: Hotel) =>
  h.lat === null || h.lng === null
    ? undefined
    : { "@type": "GeoCoordinates", latitude: h.lat, longitude: h.lng };

export const OG_IMAGE = `${SITE_URL}/img/og-image.jpg`;

/** schema.org graph: the company plus one Hotel node per branch. */
export function hotelGroupJsonLd(hotels: Hotel[]) {
  const orgId = `${SITE_URL}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Al Noor Group of Hotels",
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        email: CONTACT.email,
        telephone: "+91-7338944222",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Al Noor Group of Hotels",
        publisher: { "@id": orgId },
        inLanguage: "en-IN",
      },
      ...hotels.map((h) => {
        return {
          "@type": "Hotel",
          "@id": `${SITE_URL}/hotels/${h.slug}`,
          name: h.name,
          description: h.description || undefined,
          url: `${SITE_URL}/hotels/${h.slug}`,
          telephone: `+91-${hotelPhone(h)}`,
          priceRange: priceRange(h),
          address: postalAddress(h),
          geo: geo(h),
          amenityFeature: h.amenities.map((a) => ({
            "@type": "LocationFeatureSpecification",
            name: a,
            value: true,
          })),
          parentOrganization: { "@id": orgId },
        };
      }),
    ],
  };
}

/** schema.org graph for one hotel's detail page. */
export function hotelPageJsonLd(h: Hotel, faqs: Faq[]) {
  const url = `${SITE_URL}/hotels/${h.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": url,
        name: h.name,
        description: h.description || undefined,
        url,
        image: [h.image, ...(h.images ?? [])].filter((s, i, a) => a.indexOf(s) === i).map(absUrl),
        hasMap: h.lat !== null && h.lng !== null ? `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}` : undefined,
        telephone: `+91-${hotelPhone(h)}`,
        priceRange: priceRange(h),
        address: postalAddress(h),
        geo: geo(h),
        amenityFeature: h.amenities.map((a) => ({
          "@type": "LocationFeatureSpecification",
          name: a,
          value: true,
        })),
        containsPlace: h.rooms.map((r) => ({
          "@type": "HotelRoom",
          name: r.name,
          url: `${SITE_URL}/rooms/${roomSlugOf(r.name)}`,
          occupancy: { "@type": "QuantitativeValue", maxValue: r.maxGuests },
          bed: { "@type": "BedDetails", numberOfBeds: r.beds },
          ...(r.images && r.images.length ? { image: r.images.map(absUrl) } : {}),
          offers: { "@type": "Offer", price: r.price, priceCurrency: "INR", url },
        })),
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Hotels", item: `${SITE_URL}/hotels` },
          { "@type": "ListItem", position: 3, name: h.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** schema.org graph for a room type's page: the room, who offers it, and the breadcrumb. */
export function roomPageJsonLd(room: RoomKind, images: string[]) {
  const url = `${SITE_URL}/rooms/${room.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HotelRoom",
        "@id": url,
        name: room.name,
        description: room.description,
        url,
        image: images,
        occupancy: { "@type": "QuantitativeValue", maxValue: room.maxGuests },
        bed: { "@type": "BedDetails", numberOfBeds: room.beds },
        offers: room.offers.map((o) => ({
          "@type": "Offer",
          price: o.price,
          priceCurrency: "INR",
          url: `${SITE_URL}/hotels/${o.hotelSlug}`,
          offeredBy: { "@type": "Hotel", name: o.hotelName, url: `${SITE_URL}/hotels/${o.hotelSlug}` },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Rooms", item: `${SITE_URL}/#rooms` },
          { "@type": "ListItem", position: 3, name: room.name, item: url },
        ],
      },
    ],
  };
}
