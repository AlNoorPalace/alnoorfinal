import { CONTACT, HOTELS, SITE_URL, minPrice } from "./hotels";

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
          "@id": `${SITE_URL}/hotels#${h.slug}`,
          name: h.name,
          description: h.description,
          url: `${SITE_URL}/hotels?city=${encodeURIComponent(h.city)}`,
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
