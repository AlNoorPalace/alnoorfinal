import { ReactNode, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Car,
  Check,
  Clock,
  MapPinned,
  Phone,
  Quote,
  Shirt,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import {
  CITY_EYEBROW,
  CONTACT,
  CORPORATE_PERKS,
  REVIEWS,
  SERVICES,
  STATS,
  formatINR,
  citiesOf,
  hotelsInCity,
  joinList,
} from "../../data/hotels";
import { aggregateRooms, roomImages } from "../../data/rooms";
import { useBooking } from "./BookingContext";
import { useHotels } from "./HotelsContext";
import { useSiteImage } from "./SiteImagesContext";
import HotelCard, { HelpCard } from "./HotelCard";
import {
  CountUp,
  EASE,
  Reveal,
  RevealImage,
  Stagger,
  StaggerItem,
} from "./motion";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={`text-eyebrow font-semibold uppercase tracking-[0.22em] ${
        light ? "text-gold-ink" : "text-gold-soft"
      }`}
    >
      {children}
    </span>
  );
}

function GoldRule() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE }}
      className="mx-auto mt-6 h-px w-14 bg-gold/50"
    />
  );
}

const goldBtn =
  "inline-flex items-center justify-center gap-2 bg-gold-gradient px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold";
const outlineBtn =
  "inline-flex items-center justify-center gap-2 border border-gold/50 bg-black/30 px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold/10";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  const heroImage = useSiteImage("hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);

  const words = ["Rest", "Well.", "Work", "Better."];
  const cities = citiesOf(useHotels());

  return (
    <section
      ref={ref}
      className="relative flex h-[calc(100svh-140px)] min-h-[560px] flex-col justify-between overflow-hidden bg-surface-lowest lg:h-[calc(100vh-110px)] lg:min-h-[620px]"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 14, ease: "easeOut" }}
        >
          <Image
            src={heroImage}
            alt="Al Noor Palace hotel entrance"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/60 to-surface-lowest/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(14,14,14,0.65)_100%)]" />

      <div className="relative z-10 mx-auto mt-auto flex w-full max-w-5xl flex-col items-start px-6 lg:px-margin pb-12 pt-28 text-left lg:my-auto lg:items-center lg:pb-24 lg:pt-32 lg:text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-soft" />
          <span className="text-eyebrow font-semibold uppercase tracking-[0.24em] text-gold-soft">
            Al Noor Group of Hotels
          </span>
        </motion.div>

        <h1 className="mb-6 max-w-4xl font-serif text-display-hero-m lg:text-display-hero text-on-surface">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className={`mr-2 inline-block lg:mr-4 ${i % 2 === 1 ? "italic text-gold-soft" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.12 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mb-8 max-w-sm text-body-md font-light text-on-surface-variant lg:mb-10 lg:max-w-2xl lg:text-body-lg"
        >
          Rooms redefined for business and leisure travellers
          {cities.length > 0 && <>, across {joinList(cities)}</>}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row lg:items-center lg:justify-center lg:gap-4"
        >
          <Link href="#hotels" className={goldBtn}>
            Explore Hotels
          </Link>
          <Link href="#corporate" className={outlineBtn}>
            Corporate Stays
          </Link>
        </motion.div>
      </div>

      <div className="relative z-10 hidden flex-col items-center pb-20 text-gold/70 lg:flex">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-gold/70 to-transparent"
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust strip                                                         */
/* ------------------------------------------------------------------ */

const TRUST = [
  { icon: Sparkles, title: "Direct-Booking Perks", text: "Extra perks when you book with us" },
  { icon: Bell, title: "24×7 Room Service", text: "Round-the-clock, whatever the hour" },
  { icon: Car, title: "Free Parking & Wi-Fi", text: "Included for every guest" },
  { icon: MapPinned, title: "Prime City Locations", text: "Close to landmarks and business hubs" },
];

export function TrustStrip() {
  return (
    <section className="mt-10 border-y border-gold/20 bg-ivory py-10 text-[#1B1C19] lg:mt-16 lg:py-8">
      <Stagger className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 lg:px-margin lg:grid-cols-4 lg:gap-6">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <StaggerItem key={title} className="flex flex-col items-start gap-3 bg-white/70 p-4 lg:flex-row lg:items-center lg:gap-4 lg:bg-transparent lg:p-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-deep">
              <Icon size={20} />
            </span>
            <span>
              <span className="block font-serif text-[18px] leading-5">{title}</span>
              <span className="block text-[12px] text-gold-ink/80">{text}</span>
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

export function Destinations() {
  const hotels = useHotels();
  const cities = citiesOf(hotels);
  if (cities.length === 0) return null;
  const tiles = cities.map((city) => ({
    city,
    image: hotelsInCity(hotels, city)[0].image,
    eyebrow: CITY_EYEBROW[city] ?? "",
  }));
  return (
    <section className="bg-surface-lowest py-16 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <Eyebrow>Our Locations</Eyebrow>
            <h2 className="mt-2 font-serif text-headline-lg-m lg:text-headline-lg text-on-surface">
              Find Your Al Noor
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="max-w-md">
            <p className="text-body-md font-light text-on-surface-variant">
              {hotels.length} hotel{hotels.length === 1 ? "" : "s"} in {cities.length}{" "}
              {cities.length === 1 ? "city" : "cities"}: {joinList(cities)}. Choose a city to see
              its Al Noor hotels.
            </p>
          </Reveal>
        </div>
        <Stagger className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-gutter lg:overflow-visible lg:px-0" gap={0.12}>
          {tiles.map((t) => {
            const count = hotelsInCity(hotels, t.city).length;
            return (
              <StaggerItem key={t.city} className="w-[270px] shrink-0 snap-center lg:w-auto">
                <Link
                  href={`/hotels?city=${encodeURIComponent(t.city)}`}
                  className="group relative block h-[360px] overflow-hidden border border-gold/20 lg:h-[480px]"
                >
                  <Image
                    src={t.image}
                    alt={`${t.city} hotels`}
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/30 to-transparent" />
                  <span className="absolute right-4 top-4 border border-gold/40 bg-surface-lowest/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-soft backdrop-blur-md">
                    {count} Hotel{count > 1 ? "s" : ""}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="text-eyebrow font-semibold uppercase tracking-widest text-gold-soft">
                      {t.eyebrow}
                    </span>
                    <h3 className="mt-1 font-serif text-headline-md text-on-surface transition-colors group-hover:text-gold-soft">
                      {t.city}
                    </h3>
                    <span className="mt-3 flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-widest text-gold-soft">
                      View hotels
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hotels                                                              */
/* ------------------------------------------------------------------ */

export function HotelsSection() {
  const hotels = useHotels();
  const cities = citiesOf(hotels);
  return (
    <section id="hotels" className="scroll-mt-20 border-y border-gold/20 bg-ivory py-16 lg:py-28 text-[#1B1C19]">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <Reveal className="mx-auto mb-10 max-w-3xl lg:mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-deep" />
            <Eyebrow light>{hotels.length} hotel{hotels.length === 1 ? "" : "s"} · {cities.length} {cities.length === 1 ? "city" : "cities"}</Eyebrow>
          </div>
          <h2 className="font-serif text-headline-lg-m lg:text-headline-lg">
            Distinctive Hotels Across South India
          </h2>
          <p className="mt-3 text-body-md text-[#474744]">
            Pick the branch that suits your trip, each with comfortable rooms,
            24×7 service and parking.
          </p>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
          {hotels.map((h) => (
            <StaggerItem key={h.slug} className="flex">
              <div className="flex w-full">
                <HotelCard hotel={h} />
              </div>
            </StaggerItem>
          ))}
          <StaggerItem className="flex">
            <div className="flex w-full">
              <HelpCard />
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured rooms                                                      */
/* ------------------------------------------------------------------ */

export function RoomsShowcase() {
  const track = useRef<HTMLDivElement>(null);
  const hotels = useHotels();
  // The room types come from the hotels' rooms in the admin, so adding or removing one there changes this list.
  const rooms = useMemo(() => aggregateRooms(hotels), [hotels]);
  if (rooms.length === 0) return null;
  const scrollBy = (dir: 1 | -1) =>
    track.current?.scrollBy({
      left: dir * (track.current.clientWidth / 2),
      behavior: "smooth",
    });

  return (
    <section id="rooms" className="scroll-mt-20 bg-surface-lowest py-16 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <div className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <Eyebrow>Rooms &amp; Suites</Eyebrow>
            <h2 className="mt-2 font-serif text-headline-lg-m lg:text-headline-lg text-on-surface">
              Rest, Redefined
            </h2>
          </Reveal>
          <div className="hidden gap-3 lg:flex">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d === -1 ? "Previous rooms" : "Next rooms"}
                onClick={() => scrollBy(d)}
                className="flex h-12 w-12 items-center justify-center border border-gold/40 text-gold-soft transition-colors hover:bg-gold/10"
              >
                {d === -1 ? <ChevronLeft /> : <ChevronRight />}
              </button>
            ))}
          </div>
        </div>
        <div
          ref={track}
          className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:-mx-2 lg:gap-6 lg:px-2"
        >
          {rooms.map((r, i) => (
            <Reveal
              key={r.slug}
              delay={i * 0.08}
              className="w-[280px] shrink-0 snap-start lg:w-[calc(25%-18px)] lg:min-w-[260px]"
            >
              <article className="group relative flex h-full flex-col border border-gold/20 bg-surface transition-colors hover:border-gold/60">
                <div className="relative h-60 overflow-hidden">
                  <Image
                    src={roomImages(r, i)[0]}
                    alt={`${r.name} room`}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {r.featured && (
                    <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="font-serif text-headline-sm text-on-surface">
                      {/* The whole card is the link (see the overlay below). */}
                      <Link href={`/rooms/${r.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-gold">
                        {r.name}
                      </Link>
                    </h3>
                    <div className="mt-2 flex gap-4 text-[12px] text-on-surface-variant">
                      <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-gold" />{r.beds} bed{r.beds > 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1.5"><Bath size={14} className="text-gold" />{r.baths} bath</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-body-sm text-on-surface-variant">{r.description}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-gold/20 pt-4">
                    <div>
                      <span className="block text-[11px] text-on-surface-variant">Nightly rate, onwards</span>
                      <span className="font-serif text-[22px] font-semibold text-gold-soft">{formatINR(r.minPrice)}</span>
                    </div>
                    <span
                      aria-hidden
                      className="flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors group-hover:bg-gold group-hover:text-ink"
                    >
                      Details <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-on-surface-variant/70">
          Rates vary by hotel. Open a room to see which hotels have it.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export function About() {
  const mainImage = useSiteImage("about_main");
  const entranceImage = useSiteImage("about_entrance");
  const corridorImage = useSiteImage("about_corridor");
  return (
    <section id="about" className="scroll-mt-20 border-y border-gold/20 bg-ivory py-16 lg:py-28 text-[#1B1C19]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:px-margin lg:grid-cols-12 lg:gap-gutter">
        <div className="relative flex min-h-[380px] items-center justify-center lg:col-span-6 lg:min-h-[500px]">
          <RevealImage
            src={mainImage}
            alt="Al Noor Palace reception and lobby"
            sizes="520px"
            className="relative z-10 h-[250px] w-4/5 border border-gold/40 shadow-xl lg:h-[340px]"
          />
          <RevealImage
            src={entranceImage}
            alt="Al Noor Palace entrance"
            sizes="300px"
            className="absolute -top-2 right-0 z-20 h-32 w-1/2 border border-gold/50 shadow-2xl lg:h-52"
          />
          <RevealImage
            src={corridorImage}
            alt="Guest room corridor"
            sizes="300px"
            className="absolute -bottom-4 left-0 z-20 h-28 w-1/2 border border-gold/50 shadow-2xl lg:left-2 lg:h-44"
          />
          <div className="pointer-events-none absolute -inset-4 border border-gold/15" />
        </div>
        <Reveal className="space-y-5 lg:col-span-6 lg:pl-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold-deep" />
            <Eyebrow light>About Us</Eyebrow>
          </div>
          <h2 className="font-serif text-headline-lg-m lg:text-headline-lg leading-tight">
            Welcome to <span className="italic text-gold-deep">Al Noor Palace</span>
          </h2>
          <p className="text-body-md font-light text-[#474744]">
            Al Noor Group of Hotels has been a symbol of comfort and excellence
            in hospitality since 2019. Our commitment to exceptional service and
            memorable stays has made us a preferred choice for travellers from
            around the world.
          </p>
          <p className="text-body-md font-light text-[#474744]">
            Our Chennai hotel offers the perfect blend of comfort and
            convenience, close to some of the city&apos;s most iconic landmarks.
            Whether you&apos;re visiting the US Embassy, enjoying Marina Beach,
            exploring the historic Parthasarathy Temple or seeking care at
            Apollo Hospitals, everything is just minutes away.
          </p>
          <Link
            href="#hotels"
            className="inline-flex items-center gap-3 border-b border-gold/60 pb-1 text-eyebrow font-semibold uppercase tracking-[0.2em] text-gold-ink transition-colors hover:text-[#1B1C19]"
          >
            Discover our hotels <ArrowRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Amenities                                                           */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, typeof Bell> = {
  building: Building2,
  laundry: Shirt,
  dining: Utensils,
  parking: Car,
  bell: Bell,
  power: Zap,
};

export function Amenities() {
  return (
    <section id="services" className="scroll-mt-20 bg-surface-lowest py-16 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <Reveal className="mx-auto mb-10 max-w-2xl lg:mb-14 text-center">
          <Eyebrow>Our Services</Eyebrow>
          <h2 className="mt-2 font-serif text-headline-lg-m lg:text-headline-lg text-on-surface">
            Thoughtful Comforts
          </h2>
          <GoldRule />
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-gutter" gap={0.08}>
          {SERVICES.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <StaggerItem key={s.title}>
                <div className="group h-full border border-gold/20 bg-surface p-5 transition-all lg:p-10 duration-300 hover:-translate-y-1 hover:border-gold/50">
                  <Icon size={32} strokeWidth={1.25} className="mb-4 text-gold-soft lg:mb-6" />
                  <h3 className="mb-2 font-serif text-[18px] leading-6 text-on-surface lg:text-headline-sm">{s.title}</h3>
                  <p className="text-body-sm font-light text-on-surface-variant">{s.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Corporate                                                           */
/* ------------------------------------------------------------------ */

export function Corporate() {
  const { focusBar } = useBooking();
  const bg = useSiteImage("corporate_bg");
  return (
    <section id="corporate" className="relative scroll-mt-20 overflow-hidden border-y border-gold/30 bg-surface py-16 lg:py-24">
      <div className="absolute inset-0 opacity-25">
        <Image src={bg} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-surface-lowest/80" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:px-margin lg:grid-cols-12 lg:gap-gutter">
        <Reveal className="lg:col-span-7">
          <div className="mb-4 inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-3 py-1">
            <Briefcase size={13} className="text-gold-soft" />
            <Eyebrow>Corporate Accommodations</Eyebrow>
          </div>
          <h2 className="font-serif text-headline-lg-m lg:text-headline-lg text-on-surface">
            20% Discount on Corporate Bookings
          </h2>
          <p className="mt-4 max-w-xl text-body-md text-on-surface-variant">
            Special rates and premium amenities for business travellers and
            corporate clients: everything you need for a productive trip.
          </p>
          <ul className="mt-6 grid max-w-xl grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {CORPORATE_PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-body-sm text-on-surface">
                <Check size={15} className="text-gold-soft" /> {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-col items-stretch gap-4 lg:col-span-5 lg:items-start lg:pl-10">
          <button type="button" onClick={() => focusBar()} className={goldBtn}>
            Book Corporate Stay
          </button>
          <a href={`tel:${CONTACT.primaryTel}`} className={outlineBtn}>
            <Phone size={14} className="text-gold" /> {CONTACT.phones[0].label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export function StatsRow() {
  const hotelCount = useHotels().length;
  const stats = STATS.map((s) => (s.label === "Hotels" ? { ...s, value: hotelCount } : s));
  return (
    <section className="border-b border-gold/20 bg-surface-lowest py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <Reveal className="mb-12 text-center">
          <h2 className="font-serif text-[24px] italic leading-8 text-on-surface-variant lg:text-headline-md lg:leading-10">
            Where business meets luxury. Comfort, confidence and class.
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 text-center lg:grid-cols-4 lg:gap-0">
          {stats.map((s, i) => (
            <div key={s.label} className={`bg-surface p-5 lg:bg-transparent lg:p-0 lg:px-4 ${i < 3 ? "lg:border-r lg:border-gold/15" : ""}`}>
              <div className="font-serif text-display-hero-m lg:text-display-hero tracking-tight text-gold-soft">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-eyebrow font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest text-on-surface-variant">
          <Clock size={14} className="text-gold" /> 24×7 room service at every hotel
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function Reviews() {
  return (
    <section className="border-b border-gold/20 bg-ivory py-16 lg:py-28 text-[#1B1C19]">
      <div className="mx-auto max-w-6xl px-6 lg:px-margin">
        <Reveal className="mx-auto mb-10 max-w-2xl lg:mb-14 text-center">
          <Eyebrow light>Guest Reviews</Eyebrow>
          <h2 className="mt-2 font-serif text-headline-lg-m lg:text-headline-lg">What Our Guests Say</h2>
          <GoldRule />
        </Reveal>
        <Stagger className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-gutter lg:overflow-visible lg:px-0" gap={0.1}>
          {REVIEWS.map((r) => (
            <StaggerItem key={r.name} className="w-[300px] shrink-0 snap-center lg:w-auto">
              <figure className="relative flex h-full flex-col justify-between border border-gold/30 bg-white p-6 shadow-sm lg:p-10">
                <Quote size={28} className="absolute right-8 top-8 text-gold/30" />
                <blockquote className="font-serif text-[18px] italic leading-7 text-[#474744] lg:text-[20px] lg:leading-8">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-gold/20 pt-5">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full border border-gold/40">
                    <Image src={r.img} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-serif text-[18px]">{r.name}</span>
                    <span className="block text-[12px] text-gold-ink">Al Noor guest</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

export function FinalCta() {
  const { focusBar } = useBooking();
  const bg = useSiteImage("final_cta_bg");
  return (
    <section className="relative overflow-hidden bg-surface-lowest py-16 lg:py-28 text-center">
      <div className="absolute inset-0 opacity-60">
        <Image src={bg} alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/80 to-surface-lowest" />
      <Reveal className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 lg:px-margin">
        <Eyebrow>Your Stay Awaits</Eyebrow>
        <h2 className="mt-3 font-serif text-headline-lg-m lg:text-headline-lg text-on-surface">
          Begin Your Journey With Al Noor
        </h2>
        <p className="mb-10 mt-3 text-body-lg font-light text-on-surface-variant">
          Book direct for extra perks, or call our reservations team.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <button type="button" onClick={() => focusBar()} className={goldBtn}>
            Book Your Stay
          </button>
          <a href={`tel:${CONTACT.primaryTel}`} className={outlineBtn}>
            <Phone size={14} className="text-gold" /> Call Reservations
          </a>
        </div>
      </Reveal>
    </section>
  );
}
