// Content helpers for the hotel detail pages. Everything here is derived from
// facts already in data/hotels.ts or the original site; nothing is invented.
import { CONTACT, Hotel, ROOM_AMENITIES, formatINR } from "./hotels";

// TODO(photo): per-branch galleries. Until real photos exist every hotel shows
// its own cover image followed by these shared real photos of Al Noor Palace.
const SHARED_PHOTOS = [
  { src: "/img/lobby.webp", alt: "Reception and lobby" },
  { src: "/img/reception.webp", alt: "Reception desk" },
  { src: "/img/entrance.webp", alt: "Entrance" },
  { src: "/img/corridor.webp", alt: "Guest room corridor" },
  { src: "/img/facade-close.webp", alt: "Hotel entrance" },
  { src: "/img/hero-facade.webp", alt: "Hotel exterior" },
];

export interface GalleryPhoto {
  src: string;
  alt: string;
}

export function galleryFor(h: Hotel): GalleryPhoto[] {
  return [
    { src: h.image, alt: `${h.name} exterior` },
    ...SHARED_PHOTOS.filter((p) => p.src !== h.image),
  ].slice(0, 5);
}

// TODO(photo): per-room photos. Rooms cycle through the five real room photos.
const ROOM_PHOTOS = [
  "/img/room-1.webp",
  "/img/room-2.webp",
  "/img/room-3.webp",
  "/img/room-4.webp",
  "/img/room-5.webp",
];
export const roomPhoto = (index: number) => ROOM_PHOTOS[index % ROOM_PHOTOS.length];

export interface Faq {
  q: string;
  a: string;
}

export function faqsFor(h: Hotel): Faq[] {
  const phone = CONTACT.phones[0].label;
  return [
    {
      q: `How do I book a room at ${h.name}?`,
      a: `Choose your dates and guests on this page, pick a room and send a booking request. Our team will call you to confirm availability. You can also call us directly on ${phone}.`,
    },
    {
      q: "Which room types are available and what do they cost?",
      a: `${h.name} offers ${h.rooms
        .map((r) => `${r.name} (from ${formatINR(r.price)} per night)`)
        .join(", ")}. Final tariff and taxes are confirmed by the hotel.`,
    },
    {
      q: "What amenities are included?",
      a: `Across our hotels, amenities include ${ROOM_AMENITIES.slice(0, 9)
        .join(", ")
        .toLowerCase()}, with a lift available. Laundry is a paid service. The exact in-room items vary by room type.`,
    },
    {
      q: "Is parking available?",
      a: "Yes, parking is available for guests.",
    },
    {
      q: "Is room service available?",
      a: "Yes, we offer 24×7 room service, along with an in-house restaurant.",
    },
    {
      q: "Do you offer corporate rates?",
      a: "Yes, corporate bookings receive a 20% discount. Tick “Corporate booking” when you choose your room.",
    },
  ];
}

// Only Triplicane has documented landmarks in the original site copy.
export const NEARBY: Record<string, string[]> = {
  triplicane: [
    "Marina Beach",
    "US Embassy",
    "Parthasarathy Temple",
    "Apollo Hospitals",
  ],
};
