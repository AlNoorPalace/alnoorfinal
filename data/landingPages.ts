// Five search landing pages for the Parrys hotel (Al Noor Residency, Parrys Corner).
// Each page has its own wording, so they are not copies of one another. Only facts the hotel
// has given us or that its photos show are used; travel times are approximate figures from
// the hotel's own notes, not a live route check.

export interface LandingPhoto {
  src: string;
  alt: string;
}

export interface LandingSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LandingPage {
  slug: string;
  /** <title> (kept under about 60 characters where possible). */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  tagline: string;
  intro: string;
  hero: LandingPhoto;
  /** The photos for this page, hero first. */
  photos: LandingPhoto[];
  /** 1200x630 picture for link previews (WhatsApp, Facebook, Google Discover). */
  ogImage: string;
  sections: LandingSection[];
  faqs: { q: string; a: string }[];
  /** Used in the FAQ and intro when the live price is known. */
  keywords: string[];
}

export const PARRYS_ADDRESS = "2nd Floor, 221/222, NSC Bose Road, Parry's Corner, George Town, Chennai, Tamil Nadu 600001";

export const PARRYS_NEARBY: { name: string; detail: string }[] = [
  { name: "Fort St. George Museum", detail: "about 8 min" },
  { name: "Marina Beach", detail: "about 9 min" },
  { name: "Chennai Central railway station", detail: "about 12 min" },
  { name: "Government Museum, Chennai", detail: "about 17 min" },
];

const P = (file: string, alt: string): LandingPhoto => ({ src: `/img/parrys/${file}.webp`, alt });

const PHOTO = {
  workDesk: P("room-double-work-desk", "Al Noor Residency room in Parrys Corner with a double bed, work desk, tea tray and air conditioner"),
  teaTray: P("tea-coffee-tray", "Tea and coffee tray with electric kettle, cups and bottled water on the room desk"),
  reception: P("reception-lounge", "Reception and lounge seating at Al Noor Residency Business Class Hotel"),
  wideRoom: P("room-wide-double-ac", "Wide air-conditioned double room at Al Noor Residency, Parrys Corner"),
  bedFront: P("room-double-bed-front", "Double bed with bedside tables and a telephone"),
  bathroom: P("bathroom-marble-tiles", "Clean attached bathroom with marble-look tiles and a hand shower"),
  tvUnit: P("room-double-tv-unit", "Double room with a television unit and a bedside table"),
  corridor: P("corridor-room-207", "Hotel corridor with key-card door locks and CCTV"),
  entrance: P("hotel-entrance-street", "Street view of the Al Noor Residency rooms board on NSC Bose Road, Parrys Corner"),
  tvDesk: P("room-double-tv-desk", "Double room with a wall-mounted television, desk and curtains"),
  waterHeater: P("bathroom-water-heater", "Attached bathroom with a water heater and shower mixer"),
  doubleSingle: P("room-double-and-single-bed", "Room with a double bed and an extra single bed, wardrobe and air conditioner"),
  extraBed: P("room-double-extra-bed", "Room with a double bed and a second single bed for a third guest"),
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "business-class-hotels-in-parrys-corner-chennai",
    title: "Business Class Hotel in Parrys Corner, Chennai | Al Noor",
    description:
      "Business class hotel on NSC Bose Road, Parrys Corner, Chennai. Air-conditioned rooms with a work desk, tea tray and attached bathroom. Pay at the hotel.",
    eyebrow: "Parrys Corner, Chennai",
    h1: "Business class hotel in Parrys Corner, Chennai",
    tagline: "A work-ready room in the middle of Chennai's trading district.",
    intro:
      "Al Noor Residency Business Class Hotel is on the second floor at 221/222, NSC Bose Road, in the commercial heart of George Town. If your day is meetings, markets or a train from Chennai Central, you can be at your desk in the room and out of the door within minutes.",
    hero: PHOTO.workDesk,
    photos: [PHOTO.workDesk, PHOTO.teaTray, PHOTO.reception],
    ogImage: "/img/parrys/og-business.jpg",
    keywords: ["business class hotel parrys corner", "business stay in chennai", "hotel in parrys corner"],
    sections: [
      {
        heading: "Set up for a working stay",
        paragraphs: [
          "Every room has a proper desk with a mirror, a chair and power sockets within reach, so a laptop and phone can charge while you work. The air conditioner keeps the room cool through the busy season and a television is mounted on the wall for the evenings.",
        ],
        bullets: [
          "Work desk with chair and power sockets",
          "Tea and coffee tray with an electric kettle and bottled water",
          "Air-conditioned rooms with a wardrobe",
          "Attached bathroom with hot water",
        ],
      },
      {
        heading: "Calm and secure",
        paragraphs: [
          "Rooms open with key cards, and the corridors are covered by CCTV. At reception there is lounge seating, which is handy when a colleague or client calls in before you head out.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there a work desk in the rooms?",
        a: "Yes. The rooms have a desk with a chair and nearby power sockets, plus a tea and coffee tray with an electric kettle.",
      },
      {
        q: "Where is the hotel exactly?",
        a: `${PARRYS_ADDRESS}. The rooms are on the second floor, above the shops on NSC Bose Road.`,
      },
      {
        q: "How do I pay?",
        a: "Book online and pay at the hotel when you arrive. You can cancel online with your booking reference until your stay begins.",
      },
    ],
  },
  {
    slug: "budget-hotels-in-parrys-corner-chennai",
    title: "Budget Hotels in Parrys Corner, Chennai | Al Noor Residency",
    description:
      "Clean budget rooms in Parrys Corner, Chennai. Air conditioning, TV, hot water and bottled water included. Book online and pay at the hotel.",
    eyebrow: "Parrys Corner, Chennai",
    h1: "Budget hotel in Parrys Corner, Chennai",
    tagline: "A clean, comfortable room without paying for extras you won't use.",
    intro:
      "You don't need a big-hotel bill to sleep well in Chennai. Al Noor Residency in Parrys Corner keeps it simple: a clean room, a comfortable double bed, air conditioning and hot water, in a location that works for the railway station, the markets and the city's sights.",
    hero: PHOTO.wideRoom,
    photos: [PHOTO.wideRoom, PHOTO.bathroom],
    ogImage: "/img/parrys/og-budget.jpg",
    keywords: ["budget hotel parrys corner", "cheap hotel parrys chennai", "budget stay chennai central"],
    sections: [
      {
        heading: "What your room includes",
        bullets: [
          "Air-conditioned room with a double bed and fresh linen",
          "Television, a telephone and a wardrobe",
          "Tea and coffee tray with an electric kettle, and bottled water",
          "Attached bathroom with hot water and towels",
        ],
      },
      {
        heading: "Pay at the hotel, change your mind for free",
        paragraphs: [
          "There is nothing to pay online. Reserve your room, and pay when you arrive. If your plans change, you can cancel online with your booking reference any time until your stay begins.",
        ],
      },
      {
        heading: "Easy to get around from here",
        paragraphs: [
          "Parrys Corner is one of Chennai's busiest crossroads, so buses, autos and the metro are close by. Chennai Central railway station is about 12 minutes away, and Marina Beach about 9 minutes (approximate times; traffic varies).",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a room cost?",
        a: "Rates depend on the room and the dates. The live price for your dates is shown when you choose your dates on the hotel page, and you pay at the hotel.",
      },
      {
        q: "What is included in the room?",
        a: "Air conditioning, a television, a wardrobe, a tea and coffee tray with bottled water, and an attached bathroom with hot water.",
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes. Use your booking reference and phone number on the Manage booking page to cancel any time before your stay begins.",
      },
    ],
  },
  {
    slug: "budget-friendly-hotels-near-madras-high-court-chennai",
    title: "Budget Hotels near Madras High Court, Chennai | Al Noor",
    description:
      "Budget-friendly rooms near the Madras High Court in George Town, Chennai. Air-conditioned, on NSC Bose Road, Parrys Corner. Pay at the hotel.",
    eyebrow: "George Town, Chennai",
    h1: "Budget-friendly hotel near Madras High Court, Chennai",
    tagline: "Stay close to the courts, and close to everything else in George Town.",
    intro:
      "Coming to Chennai for a hearing, a filing or to support a case? Al Noor Residency is in George Town, on NSC Bose Road in Parrys Corner, in the same part of the city as the Madras High Court. You can rest properly the night before and not worry about the morning traffic across the city.",
    hero: PHOTO.tvUnit,
    photos: [PHOTO.tvUnit, PHOTO.corridor, PHOTO.entrance],
    ogImage: "/img/parrys/og-highcourt.jpg",
    keywords: ["hotels near madras high court", "budget friendly hotels high court chennai", "stay near high court"],
    sections: [
      {
        heading: "How to find us",
        paragraphs: [
          "The hotel's rooms are on the second floor at 221/222, NSC Bose Road, above the shops. From the street, look up for the tall black \"ROOMS\" board with the Al Noor Residency name, and the banner listing the room types. If you cannot find it, call the hotel and the team will guide you.",
        ],
      },
      {
        heading: "A quiet room after a long day",
        paragraphs: [
          "Rooms are air-conditioned and have a double bed, a television and a wardrobe, with an attached bathroom and hot water. Doors open with key cards and the corridors have CCTV, so you can leave your things and your papers with some peace of mind.",
        ],
      },
      {
        heading: "Planning around the court",
        paragraphs: [
          "Book your room, pay at the hotel, and cancel online until your stay begins if the hearing is postponed. For anything unusual, call the hotel on the number at the top of this page and the team will help.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the hotel close to the Madras High Court?",
        a: "Yes. It is in George Town, on NSC Bose Road in Parrys Corner, in the same area of Chennai as the High Court. Please check the exact route in Google Maps for your day.",
      },
      {
        q: "What if my hearing is postponed?",
        a: "You can cancel online with your booking reference and phone number at any time before your stay begins.",
      },
      {
        q: "Where do I enter the hotel?",
        a: "Look for the \"ROOMS\" board with the Al Noor Residency name on NSC Bose Road. The rooms are on the second floor. If you cannot find it, call the hotel and the team will guide you.",
      },
    ],
  },
  {
    slug: "couple-friendly-hotels-in-egmore",
    title: "Couple-Friendly Hotel near Egmore, Chennai | Al Noor Residency",
    description:
      "A private double room for couples near Egmore, Chennai. Air conditioning, key-card lock and attached bathroom in Parrys Corner. Pay at the hotel.",
    eyebrow: "Near Egmore, Chennai",
    h1: "Couple-friendly hotel near Egmore, Chennai",
    tagline: "A private double room, a short drive from Egmore.",
    intro:
      "Visiting Chennai together? Al Noor Residency in Parrys Corner is a short drive from Egmore and has comfortable double rooms with their own bathroom, a key-card lock on the door and a bed that is made fresh for your arrival.",
    hero: PHOTO.tvDesk,
    photos: [PHOTO.tvDesk, PHOTO.bedFront, PHOTO.waterHeater],
    ogImage: "/img/parrys/og-egmore.jpg",
    keywords: ["couple friendly hotels egmore", "hotels near egmore chennai", "couple stay chennai"],
    sections: [
      {
        heading: "Your own space",
        bullets: [
          "Double bed with bedside tables and a telephone",
          "Air conditioning, a wall-mounted television and curtains for privacy",
          "Attached bathroom with a water heater and shower",
          "Key-card door lock, with CCTV in the corridors",
        ],
      },
      {
        heading: "Easy to reach from Egmore and the station",
        paragraphs: [
          "Chennai Central railway station is about 12 minutes from the hotel and Marina Beach about 9 minutes (approximate times; traffic varies). The Government Museum is about 17 minutes away, and the Fort St. George Museum about 8 minutes.",
        ],
      },
      {
        heading: "Booking",
        paragraphs: [
          "Choose your dates on the hotel page, reserve, and pay when you arrive. Hotels in India ask every guest for a valid photo ID at check-in, so please carry one each. Call the hotel if you have any questions before you travel.",
        ],
      },
    ],
    faqs: [
      {
        q: "How far is the hotel from Egmore?",
        a: "It is a short drive across central Chennai. Check your exact route and timing in Google Maps, as traffic changes through the day.",
      },
      {
        q: "What should we bring at check-in?",
        a: "A valid photo ID for every guest. If you have a question about check-in, call the hotel before you travel.",
      },
      {
        q: "Is the room private?",
        a: "Yes. Each room has its own attached bathroom and a key-card lock on the door.",
      },
    ],
  },
  {
    slug: "hotels-in-mannady-chennai",
    title: "Hotels in Mannady, Chennai | Al Noor Residency, Parrys",
    description:
      "Rooms near Mannady in George Town, Chennai, for two or three guests. Air-conditioned with an attached bathroom. Al Noor Residency, Parrys. Pay at the hotel.",
    eyebrow: "Mannady & George Town, Chennai",
    h1: "Hotels in Mannady, Chennai",
    tagline: "Stay next to Mannady's wholesale streets, and sleep well.",
    intro:
      "Mannady is the old wholesale quarter of George Town, full of traders, shops and early mornings. Al Noor Residency is on NSC Bose Road in Parrys Corner, in the same neighbourhood, so you can finish at the market and be back in your room in a few minutes.",
    hero: PHOTO.doubleSingle,
    photos: [PHOTO.doubleSingle, PHOTO.extraBed],
    ogImage: "/img/parrys/og-mannady.jpg",
    keywords: ["hotels in mannady", "hotel rooms in mannady chennai", "stay near mannady"],
    sections: [
      {
        heading: "Rooms for you and your colleague or family",
        paragraphs: [
          "Some rooms have a double bed with an extra single bed, so a third person can share without paying for a second room. Rooms are air-conditioned with a wardrobe, a desk and an attached bathroom with hot water.",
        ],
      },
      {
        heading: "Built around a trader's day",
        paragraphs: [
          "Bring your purchase lists, spread them out on the desk, and have a hot tea from the tray in your room. There is lounge seating at reception while you wait for a supplier or a ride.",
        ],
      },
      {
        heading: "Beyond the market",
        paragraphs: [
          "When the day is done, Marina Beach is about 9 minutes away, the Fort St. George Museum about 8 minutes, and Chennai Central railway station about 12 minutes (approximate times; traffic varies).",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the hotel in Mannady?",
        a: "It is on NSC Bose Road in Parrys Corner, in George Town, in the same neighbourhood as Mannady and a few minutes from it. Check the exact route in Google Maps.",
      },
      {
        q: "Can three people share a room?",
        a: "Some rooms have a double bed and an extra single bed. Call the hotel to confirm which room suits your group.",
      },
      {
        q: "Do I pay online?",
        a: "No. You reserve online and pay at the hotel when you arrive.",
      },
    ],
  },
];

export const findLanding = (slug: string) => LANDING_PAGES.find((p) => p.slug === slug);
