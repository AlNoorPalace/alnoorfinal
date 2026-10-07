import { CONTACT, HOTELS, Hotel, SITE_URL, minPrice } from "./hotels";
import { Faq } from "./hotelContent";

export const OG_IMAGE = `${SITE_URL}/img/og-image.jpg`;

/** schema.org graph: the company plus one Hotel node per branch. */
export function hotelGroupJsonLd() {
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
      ...HOTELS.map((h) => {
        const prices = h.rooms.map((r) => r.price);
        return {
          "@type": "Hotel",
          "@id": `${SITE_URL}/hotels/${h.slug}`,
          name: h.name,
          description: h.description,
          url: `${SITE_URL}/hotels/${h.slug}`,
          telephone: `+91-${h.phone}`,
          priceRange: `₹${minPrice(h)}–₹${Math.max(...prices)}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: h.city,
            addressRegion: h.state,
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: h.lat,
            longitude: h.lng,
          },
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
  const prices = h.rooms.map((r) => r.price);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": url,
        name: h.name,
        description: h.description,
        url,
        telephone: `+91-${h.phone}`,
        priceRange: `₹${minPrice(h)}–₹${Math.max(...prices)}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: h.city,
          addressRegion: h.state,
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: h.lat, longitude: h.lng },
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
