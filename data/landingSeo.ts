// The search-engine head block for each landing page, exactly as supplied in the owner's
// "Al Noor path page SEO work" document. Do not reword, reorder or add to these values.
// (The only change from the document: the JSON-LD telephone is the site's one phone number.)

export interface LandingSeoEntry {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  twitterTitle: string;
  twitterDescription: string;
  ogTitle: string;
  ogDescription: string;
  /** The "url" inside the LocalBusiness data. */
  jsonUrl: string;
}

export const LANDING_SEO: Record<string, LandingSeoEntry> = {
  "business-class-hotels-in-parrys-corner-chennai": {
    title: "Business Class Hotels in Parrys Corner Chennai | Premium Stays",
    description:
      "Al Noor Residency offers comfortable business class accommodation in Parrys Corner, Chennai with affordable hotel rooms, modern amenities and convenient city access",
    keywords:
      "business class hotel parrys corner, best hotel rooms near parrys corner, hotels near chennai , budget-friendly hotels, business travel rooms parrys corner",
    canonical: "https://www.alnoorpalace.in/business-class-hotels-in-parrys-corner-chennai",
    twitterTitle: "Business Hotels in Parrys Corner Chennai | Al Noor Residency",
    twitterDescription:
      "Al Noor Residency - delivers quality business stays in Parrys Corner, featuring comfortable rooms, convenient business stays and easy access to key commercial areas",
    ogTitle: "Premium Hotels in Parrys Corner | Al Noor Residency",
    ogDescription:
      "Al Noor Residency - provides convenient rooms in Parrys Corner, with essential facilities and easy access to business hubs",
    jsonUrl: "https://www.alnoorpalace.in/business-class-hotels-in-parrys-corner-chennai/",
  },
  "budget-hotels-in-parrys-corner-chennai": {
    title: "Budget Hotels in Parrys Corner | Family Hotel ",
    description:
      "Al Noor Residency offers budget-friendly hotels in Parrys Corner with comfortable rooms and convenient access for every traveller",
    keywords:
      "budget hotels near parrys corner, best budget hotel near parrys corner, budget-friendly stays near chennai, budget hotels in parrys corner, family budget stay in parrys corner",
    canonical: "https://www.alnoorpalace.in/budget-hotels-in-parrys-corner-chennai",
    twitterTitle: "Affordable Stays in Parrys Corner | Al Noor Residency",
    twitterDescription:
      "Al Noor Residency - provides affordable hotel stays in Parrys Corner, essential comforts and convenient city access in chennai",
    ogTitle: "Best Budget Hotel in Parrys Corner| Al Noor Residency",
    ogDescription:
      "Al Noor Residency - offers hotel rooms in Parrys Corner, providing affordable rooms, couple-friendly stays and comfortable rooms for business travellers",
    jsonUrl: "https://www.alnoorpalace.in/budget-hotels-in-parrys-corner-chennai/",
  },
  "budget-friendly-hotels-near-madras-high-court-chennai": {
    title: "Budget-Friendly Hotels Near Madras High Court Chennai",
    description:
      "Al Noor Residency offers budget-friendly accommodation near Madras High Court, with comfortable rooms in parrys corner and convenient access to city attractions",
    keywords:
      "hotels near madras high court, budget business hotels near high court, budget-friendly stays near chennai, family budget stay in high court",
    canonical: "https://www.alnoorpalace.in/budget-friendly-hotels-near-madras-high-court-chennai",
    twitterTitle: "Affordable Hotel Near Madras High Court | Al Noor Residency",
    twitterDescription:
      "Al Noor Residency - offers affordable stays near Madras High Court, Chennai, with premium rooms, convenient facilities and easy access to nearby business areas",
    ogTitle: "Budget Hotels Near Madras High Court| Al Noor Residency",
    ogDescription:
      "Al Noor Residency - provides budget hotels near Madras High Court, featuring quality rooms, offering budget friendly hotels and convenient access to city landmarks",
    jsonUrl: "https://www.alnoorpalace.in/budget-friendly-hotels-near-madras-high-court-chennai/",
  },
  "couple-friendly-hotels-in-egmore": {
    title: "Couple-Friendly Hotels in Egmore, Chennai | Private Couple Stays",
    description:
      "Al Noor Residency offers couple-friendly accommodation in Egmore, Chennai, with comfortable rooms, affordable stays and convenient access to key locations",
    keywords:
      "couple friendly budget stays, comfortable rooms for couples, budget friendly couple hotels egmore, affordable hotel rooms egmore, premium couple stays",
    canonical: "https://www.alnoorpalace.in/couple-friendly-hotels-in-egmore",
    twitterTitle: "Comfortable Couple Stays in Egmore | Al Noor Residency",
    twitterDescription:
      "Al Noor Residency - offers couple-friendly hotel stays near Egmore, featuring comfortable, well-maintained rooms and premium stays for couple",
    ogTitle: "Best Couple-Friendly hotels in Egmore | Al Noor Residency",
    ogDescription:
      "Al Noor Residency - offers couple-friendly hotel stays in Egmore, Chennai, with comfortable private rooms, affordable rates and convenient city access",
    jsonUrl: "https://www.alnoorpalace.in/couple-friendly-hotels-in-egmore/",
  },
  "hotels-in-mannady-chennai": {
    title: "Best Hotels in Mannady, Chennai | Premium Hotel",
    description:
      "Al Noor Residency offers comfortable hotel near Mannady, Chennai, with affordable rooms, convenient amenities and easy access to nearby commercial area",
    keywords:
      "hotels in mannady chennai, budget hotels mannady, business class hotels chennai, comfortable hotel rooms mannady, premium hotel rooms mannady",
    canonical: "https://www.alnoorpalace.in/hotels-in-mannady-chennai",
    twitterTitle: "Comfortable Hotels in Mannady, Chennai | Al Noor Residency",
    twitterDescription:
      "Al Noor Residency - welcomes travellers to Mannady, Chennai, with budget-friendly rooms, pleasant accommodation and premium hotel stay with convenient city access",
    ogTitle: "Affordable Hotel Stays in Mannady | Al Noor Residency",
    ogDescription:
      "Al Noor Residency - provides quality accommodation in Mannady with budget friendly rooms, affordable hotel stays and easy access to local business hubs",
    jsonUrl: "https://www.alnoorpalace.in/hotels-in-mannady-chennai/",
  },
};

/** Tags that are identical on all five pages, exactly as in the document. */
export const LANDING_SEO_COMMON = {
  robots: "index, follow",
  audience: "all",
  author: "Al NOOR RESIDENCY ",
  contact: "booking@alnoorresidency.in",
  revisitAfter: "3 days",
  language: "english",
  distribution: "global",
  rating: "general",
  copyright: "by https://www.alnoorpalace.in/",
  url: "https://www.alnoorpalace.in/",
  twitterCard: "summary",
  twitterSite: "https://www.alnoorpalace.in/",
  twitterCreator: "Al NOOR RESIDENCY ",
  twitterImage: "https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75",
  ogType: "website",
  ogUrl: "https://www.alnoorpalace.in/",
  ogImage: "https://www.facebook.com/photo/?fbid=122129919375105336&set=a.122100104505105336&locale=ta_IN/",
  ogSiteName: "https://www.facebook.com/people/Al-Noor-Residency/61583160103826/?locale=ta_IN#/",
  fbAdmins: "",
} as const;

/** The LocalBusiness data from the document. Only the telephone is the site's current number. */
export function landingJsonLd(entry: LandingSeoEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Al NOOR RESIDENCY",
    image: "https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75",
    "@id": "https://www.alnoorpalace.in/",
    url: entry.jsonUrl,
    telephone: "+91 96001 58529",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2nd Floor, 221/222, NSC Bose Rd, Parrys Corner, George Town,Tamil Nadu",
      addressLocality: "Chennai",
      postalCode: "600001",
      addressCountry: "IN",
    },
    geo: { "@type": "GeoCoordinates", latitude: 13.08901, longitude: 80.28581 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };
}
