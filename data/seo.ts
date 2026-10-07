import { CONTACT, Hotel, SITE_URL, hotelPhone, maxPrice, minPrice } from "./hotels";
import { Faq } from "./hotelContent";

const priceRange = (h: Hotel) =>
  minPrice(h) === null ? undefined : `₹${minPrice(h)}–₹${maxPrice(h)}`;

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
          address: {
            "@type": "PostalAddress",
            addressLocality: h.city,
            addressRegion: h.state || undefined,
            addressCountry: "IN",
          },
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
        telephone: `+91-${hotelPhone(h)}`,
        priceRange: priceRange(h),
        address: {
          "@type": "PostalAddress",
          addressLocality: h.city,
          addressRegion: h.state || undefined,
          addressCountry: "IN",
        },
        geo: geo(h),
        amenityFeature: h.amenities.map((a) => ({
          "@type": "LocationFeatureSpecification",
          name: a,
          value: true,
        })),
        containsPlace: h.rooms.map((r) => ({
          "@type": "HotelRoom",
          name: r.name,
          occupancy: { "@type": "QuantitativeValue", maxValue: r.maxGuests },
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
