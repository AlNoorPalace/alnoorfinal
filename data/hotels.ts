// Single source of truth for hotels, rooms, services, reviews and contact info.
// Content comes from the original site (pages/hotels.tsx, components/home/Rooms.tsx,
// index.tsx, Footer.tsx). Prices are "onwards" rates in INR per night.

export const CONTACT = {
  phones: [
    { label: "+91 73389 44222", tel: "+917338944222" },
    { label: "+91 89517 77883", tel: "+918951777883" },
  ],
  email: "booking@alnoorpalace.in",
  whatsapp: "https://wa.me/917338944222",
  primaryTel: "+917338944222",
};

export interface RoomType {
  name: string;
  price: number;
  beds: number;
  baths: number;
  maxGuests: number;
}

export interface Hotel {
  slug: string;
  name: string;
  branch: string; // value sent to /api/send-booking
  city: string;
  state: string;
  tagline: string;
  description: string;
  phone: string;
  lat: number;
  lng: number;
  // TODO(photo): replace with real per-branch photography.
  image: string;
  amenities: string[];
  rooms: RoomType[];
}

const STD_AMENITIES = [
  "Wi-Fi",
  "Parking",
  "Restaurant",
  "24h Room Service",
  "Power Backup",
  "Laundry",
];

const room = (
  name: string,
  price: number,
  beds: number,
  baths: number,
  maxGuests: number
): RoomType => ({ name, price, beds, baths, maxGuests });

export const HOTELS: Hotel[] = [
  {
    slug: "triplicane",
    name: "Al Noor Triplicane",
    branch: "Triplicane Branch",
    city: "Chennai",
    state: "Tamil Nadu",
    tagline: "Heritage Chennai, minutes from Marina Beach",
    description:
      "Nestled in the heart of Chennai, our Triplicane location offers a perfect blend of traditional charm and modern comfort, with easy access to the city's cultural landmarks and business districts.",
    phone: "7338944222",
    lat: 13.0665,
    lng: 80.2789,
    image: "/img/facade-close.webp",
    amenities: STD_AMENITIES,
    rooms: [
      room("Deluxe", 899, 1, 1, 2),
      room("Triple", 1499, 2, 1, 3),
      room("Quadruple", 1999, 2, 1, 5),
      room("Suite", 2999, 1, 1, 2),
    ],
  },
  {
    slug: "parrys",
    name: "Al Noor Parrys",
    branch: "Parrys Branch",
    city: "Chennai",
    state: "Tamil Nadu",
    tagline: "Commercial hub, seamless city connectivity",
    description:
      "Located in the bustling commercial hub of Parrys, our hotel suits business and leisure travellers alike, with prime access to major transportation hubs across the city.",
    phone: "7338944222",
    lat: 13.0855,
    lng: 80.2822,
    image: "/img/entrance.webp",
    amenities: STD_AMENITIES,
    rooms: [room("Standard", 799, 1, 1, 2), room("Deluxe", 1499, 2, 2, 4)],
  },
  {
    slug: "koyambedu",
    name: "Al Noor Koyambedu",
    branch: "Koyambedu Branch",
    city: "Chennai",
    state: "Tamil Nadu",
    tagline: "Modern stays, also known as Smart Homes",
    description:
      "Also known as Smart Homes, our Koyambedu location offers modern accommodation in the heart of Chennai, perfect for business and leisure travellers seeking comfort and convenience.",
    phone: "7338944222",
    lat: 13.0665,
    lng: 80.2043,
    image: "/img/night-facade.webp",
    amenities: STD_AMENITIES,
    rooms: [room("Deluxe", 899, 1, 1, 2), room("Deluxe Quad", 1999, 2, 1, 4)],
  },
  {
    slug: "electronic-city",
    name: "Al Noor Electronic City",
    branch: "Electronic City Branch",
    city: "Bengaluru",
    state: "Karnataka",
    tagline: "In Bengaluru's thriving tech corridor",
    description:
      "Situated in Bengaluru's tech corridor, our Electronic City branch caters to the modern professional, close to major IT parks and corporate offices.",
    phone: "7338944222",
    lat: 12.8456,
    lng: 77.6634,
    image: "/img/lobby.webp",
    amenities: STD_AMENITIES,
    rooms: [
      room("Deluxe", 899, 1, 1, 2),
      room("Deluxe Twin", 1499, 2, 1, 3),
      room("Deluxe Fam", 1999, 2, 1, 4),
    ],
  },
  {
    slug: "koramangala",
    name: "Al Noor Koramangala",
    branch: "Koramangala Branch",
    city: "Bengaluru",
    state: "Karnataka",
    tagline: "One of Bengaluru's most vibrant neighbourhoods",
    description:
      "Premium hospitality in one of Bengaluru's most vibrant neighbourhoods, combining contemporary design with warm service for business travellers and families.",
    phone: "7338944222",
    lat: 12.9352,
    lng: 77.6245,
    image: "/img/night-grids.webp",
    amenities: STD_AMENITIES,
    rooms: [
      room("Deluxe Double", 899, 1, 1, 2),
      room("Deluxe Twin", 1499, 2, 1, 3),
      room("Junior Suite", 1999, 1, 1, 2),
    ],
  },
  {
    slug: "hyderabad",
    name: "Al Noor Hyderabad",
    branch: "Hyderabad Branch",
    city: "Hyderabad",
    state: "Telangana",
    tagline: "Luxury and convenience in the City of Pearls",
    description:
      "Whether you're visiting for business or exploring the city's rich heritage, our Hyderabad hotel offers a comfortable retreat with attentive service and complete amenities.",
    phone: "7338944222",
    lat: 17.385,
    lng: 78.4867,
    image: "/img/corridor.webp",
    amenities: STD_AMENITIES,
    rooms: [
      room("Classic", 899, 1, 1, 2),
      room("Deluxe", 1499, 1, 1, 2),
      room("Suite", 1999, 1, 1, 2),
    ],
  },
  {
    slug: "ooty",
    name: "Al Noor Ooty",
    branch: "Ooty Branch",
    city: "Ooty",
    state: "Tamil Nadu",
    tagline: "A peaceful retreat in the Nilgiri hills",
    description:
      "Escape to the serene hills of Ooty. Surrounded by tea gardens and cool mountain air, this hotel is a peaceful retreat with every modern comfort for a delightful stay.",
    phone: "7338944222",
    lat: 11.4102,
    lng: 76.695,
    image: "/img/pool-dusk.webp",
    amenities: STD_AMENITIES,
    rooms: [room("Standard", 899, 1, 1, 2), room("Deluxe", 1499, 2, 2, 4)],
  },
];

export const CITIES = ["Chennai", "Bengaluru", "Hyderabad", "Ooty"] as const;

export const getHotel = (slug?: string | null) =>
  HOTELS.find((h) => h.slug === slug);

export const hotelsByCity = (city: string) =>
  HOTELS.filter((h) => h.city === city);

export const minPrice = (h: Hotel) => Math.min(...h.rooms.map((r) => r.price));

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n));

// City tiles. TODO(photo): swap for dedicated city photography.
export const CITY_TILES: {
  city: (typeof CITIES)[number];
  image: string;
  eyebrow: string;
}[] = [
  { city: "Chennai", image: "/img/hero-facade.webp", eyebrow: "Coromandel Coast" },
  { city: "Bengaluru", image: "/img/lobby.webp", eyebrow: "Garden City" },
  { city: "Hyderabad", image: "/img/corridor.webp", eyebrow: "City of Pearls" },
  { city: "Ooty", image: "/img/pool-dusk.webp", eyebrow: "Nilgiri Hills" },
];

export interface FeaturedRoom {
  title: string;
  image: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  tag?: string;
}

export const FEATURED_ROOMS: FeaturedRoom[] = [
  {
    title: "Deluxe",
    image: "/img/room-1.webp",
    description:
      "A cosy room with modern amenities for a refreshing, comfortable stay.",
    price: 799,
    beds: 1,
    baths: 1,
  },
  {
    title: "Deluxe Triple",
    image: "/img/room-2.webp",
    description:
      "Spacious accommodation for families or small groups, with every essential amenity.",
    price: 1500,
    beds: 3,
    baths: 1,
  },
  {
    title: "Deluxe Quad",
    image: "/img/room-3.webp",
    description:
      "Ample space for four guests, with premium bedding and modern facilities.",
    price: 2000,
    beds: 4,
    baths: 1,
  },
  {
    title: "King Suite",
    image: "/img/room-4.webp",
    description:
      "Elegant decor, premium bedding and a spacious living area for an elevated stay.",
    price: 2500,
    beds: 2,
    baths: 1,
    tag: "Featured",
  },
  {
    title: "Residential Suite",
    image: "/img/room-5.webp",
    description:
      "A home away from home with separate living and dining areas, ideal for extended stays.",
    price: 3000,
    beds: 3,
    baths: 2,
    tag: "Featured",
  },
];

export const ROOM_AMENITIES = [
  "Fridge",
  "Power Backup",
  "Free Parking",
  "Newspaper",
  "Wi-Fi",
  "Housekeeping",
  "Air Conditioning",
  "Smoke Detector",
  "24×7 Room Service",
  "Lift",
];

export const SERVICES = [
  {
    title: "Rooms & Apartments",
    icon: "building",
    description:
      "Comfortable accommodation with modern amenities for a restful stay.",
  },
  {
    title: "Laundry Services",
    icon: "laundry",
    description:
      "Efficient, professional laundry to keep your clothing fresh during your stay.",
  },
  {
    title: "Food & Restaurant",
    icon: "dining",
    description:
      "Diverse cuisines prepared by our chefs, served in-house or to your room.",
  },
  {
    title: "Parking",
    icon: "parking",
    description: "Secure, spacious parking available around the clock for all guests.",
  },
  {
    title: "24 Hours Room Service",
    icon: "bell",
    description:
      "Round-the-clock room service for your comfort and convenience at any hour.",
  },
  {
    title: "Power Backup",
    icon: "power",
    description:
      "Uninterrupted power with full backup systems for a hassle-free experience.",
  },
] as const;

export const REVIEWS = [
  {
    quote:
      "The location of the hotel is excellent as it's near the beach. We stayed for 3 nights, and the suite was spacious and comfortable. The check-in was swift. The staff were very kind and warm. Overall, it was a pleasant stay.",
    name: "Prakash N",
    img: "/Images/man2.png",
  },
  {
    quote:
      "It's a very good place to stay. The hospitality is also very nice. Definitely a place to stay.",
    name: "Hyder Ali",
    img: "/Images/manavatar.png",
  },
  {
    quote:
      "Pleasant stay experience. Really nice hotel and service also good. Will definitely come again.",
    name: "Sonu Kumar",
    img: "/Images/man3.png",
  },
  {
    quote:
      "It was a pleasant stay. The room service and staff were very supportive and helpful. Easy access to the marina and cityside malls.",
    name: "Yasir Arafath",
    img: "/Images/man4.png",
  },
];

export const STATS = [
  { value: 75, suffix: "+", label: "Luxury Rooms" },
  { value: 7, suffix: "", label: "Hotels" },
  { value: 99, suffix: "%", label: "Guest Satisfaction" },
  { value: 50, suffix: "+", label: "Corporate Clients" },
];

export const CORPORATE_PERKS = [
  "Dedicated Workspace",
  "Meeting Facilities",
  "Premium Wi-Fi",
  "Concierge Service",
  "Business Center",
  "Complimentary Breakfast",
];
