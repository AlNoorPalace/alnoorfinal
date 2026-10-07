import { ReactNode } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  Car,
  ChevronRight,
  MapPin,
  Navigation,
  Phone,
  Shirt,
  Users,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";
import Seo from "../../components/site/Seo";
import SiteHeader from "../../components/site/SiteHeader";
import SiteFooter from "../../components/site/SiteFooter";
import HotelCard from "../../components/site/HotelCard";
import HotelGallery from "../../components/site/HotelGallery";
import RoomPhotos from "../../components/site/RoomPhotos";
import HotelBookingPanel from "../../components/site/HotelBookingPanel";
import Faq from "../../components/site/Faq";
import { useBooking } from "../../components/site/BookingContext";
import { EASE, Reveal, Stagger, StaggerItem } from "../../components/site/motion";
import {
  ROOM_AMENITIES,
  SITE_URL,
  formatINR,
  Hotel,
  hotelPhone,
  minPrice,
} from "../../data/hotels";
import { NEARBY, faqsFor, galleryFor, roomPhotos } from "../../data/hotelContent";
import { hotelPageJsonLd } from "../../data/seo";
import { roomSlug } from "../../data/rooms";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../../lib/siteHotels";

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  Parking: Car,
  Restaurant: Utensils,
  "24h Room Service": Bell,
  "Power Backup": Zap,
  Laundry: Shirt,
};

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <Reveal>
        <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
          {eyebrow}
        </span>
        <h2 className="mb-6 mt-2 font-serif text-[30px] leading-9 text-on-surface lg:text-[36px] lg:leading-10">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

export default function HotelPage({ hotel, hotels }: { hotel: Hotel; hotels: Hotel[] }) {
  const { reserve, focusBar } = useBooking();
  const faqs = faqsFor(hotel);
  const photos = galleryFor(hotel);
  const nearby = NEARBY[hotel.slug];

  const related = [
    ...hotels.filter((h) => h.slug !== hotel.slug && h.city === hotel.city),
    ...hotels.filter((h) => h.slug !== hotel.slug && h.city !== hotel.city),
  ].slice(0, 3);

  const hasMap = hotel.lat !== null && hotel.lng !== null;
  const place = [hotel.city, hotel.state].filter(Boolean).join(", ");
  const phone = hotelPhone(hotel);
  const mapSrc = `https://maps.google.com/maps?q=${hotel.lat},${hotel.lng}&z=15&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${hotel.lat},${hotel.lng}`;

  const rawDescription =
    hotel.description || `${hotel.name} in ${place}. Rooms, prices and booking at Al Noor Group of Hotels.`;
  const description =
    rawDescription.length > 158 ? `${rawDescription.slice(0, 155).trimEnd()}…` : rawDescription;

  return (
    <>
      <Seo
        title={`${hotel.name}, ${hotel.city} | Al Noor Group of Hotels`}
        description={description}
        path={`/hotels/${hotel.slug}`}
        image={`${SITE_URL}${hotel.image}`}
        jsonLd={hotelPageJsonLd(hotel, faqs)}
      />
      <SiteHeader solid />

      <main id="main" className="bg-surface-lowest">
        {/* Hero */}
        <section className="relative flex h-[62vh] min-h-[480px] items-end overflow-hidden pt-16 lg:h-[68vh] lg:pt-20">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 12, ease: "easeOut" }}
          >
            <Image
              src={hotel.image}
              alt={`${hotel.name}, ${hotel.city}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/55 to-black/50" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 lg:px-margin lg:pb-14">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
              <Link href="/" className="hover:text-gold-soft">Home</Link>
              <ChevronRight size={12} />
              <Link href="/hotels" className="hover:text-gold-soft">Hotels</Link>
              <ChevronRight size={12} />
              <span aria-current="page" className="text-on-surface">{hotel.name}</span>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            >
              <div className="mb-3 inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
                <MapPin size={14} /> {place}
              </div>
              <h1 className="font-serif text-[40px] leading-[48px] text-on-surface lg:text-[64px] lg:leading-[72px]">
                {hotel.name}
              </h1>
              <p className="mt-2 max-w-2xl font-serif text-[20px] italic text-gold-soft lg:text-[24px]">
                {hotel.tagline}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => focusBar(hotel.slug)}
                  className="bg-gold-gradient px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
                >
                  {minPrice(hotel) !== null ? `Book from ${formatINR(minPrice(hotel)!)}` : "Book your stay"}
                </button>
                <a
                  href={`tel:+91${phone}`}
                  className="flex items-center justify-center gap-2 border border-gold/50 bg-black/30 px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface backdrop-blur-sm transition-colors hover:bg-gold/10"
                >
                  <Phone size={14} className="text-gold" /> Call
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content + sticky booking panel */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:px-margin lg:py-20">
          <aside className="lg:order-last">
            <div className="lg:sticky lg:top-28">
              <HotelBookingPanel hotel={hotel} />
            </div>
          </aside>

          <div className="min-w-0 space-y-16 lg:space-y-20">
            <Section id="overview" eyebrow="Overview" title={`Stay at ${hotel.name}`}>
              {hotel.description && (
                <Reveal>
                  <p className="text-body-lg font-light text-on-surface-variant">
                    {hotel.description}
                  </p>
                </Reveal>
              )}
              {nearby && (
                <Reveal className="mt-6">
                  <div className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-gold">
                    Close to
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {nearby.map((n) => (
                      <li key={n} className="border border-gold/30 px-3 py-1.5 text-[13px] text-on-surface">
                        {n}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </Section>

            <Section id="gallery" eyebrow="Gallery" title="Take a look inside">
              <Reveal>
                <HotelGallery photos={photos} name={hotel.name} />
              </Reveal>
            </Section>

            <Section id="rooms" eyebrow="Rooms" title="Choose your room">
              {hotel.rooms.length === 0 && (
                <p className="border border-gold/30 p-5 text-body-md text-on-surface-variant">
                  Rooms for this hotel will be listed soon. Please call us on +91 {phone.slice(0, 5)} {phone.slice(5)} to book.
                </p>
              )}
              <Stagger className="space-y-4" gap={0.1}>
                {hotel.rooms.map((r, i) => (
                  <StaggerItem key={r.name}>
                    <article className="group flex flex-col overflow-hidden border border-gold/20 bg-surface transition-colors hover:border-gold/60 sm:flex-row">
                      <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-56">
                        <RoomPhotos images={roomPhotos(r.images, i)} name={r.name} sizes="(min-width: 640px) 224px, 100vw" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-5 lg:p-6">
                        <div>
                          <h3 className="font-serif text-[26px] leading-8 text-on-surface">
                            <Link href={`/rooms/${roomSlug(r.name)}`} className="hover:text-gold-soft">{r.name}</Link>
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-on-surface-variant">
                            <span className="flex items-center gap-1.5"><BedDouble size={15} className="text-gold" />{r.beds} bed{r.beds > 1 ? "s" : ""}</span>
                            <span className="flex items-center gap-1.5"><Bath size={15} className="text-gold" />{r.baths} bath</span>
                            <span className="flex items-center gap-1.5"><Users size={15} className="text-gold" />Up to {r.maxGuests} guests</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-4 border-t border-gold/15 pt-4">
                          <div>
                            <span className="block text-[11px] text-on-surface-variant">Per night, onwards</span>
                            <span className="font-serif text-[28px] leading-8 text-gold-soft">{formatINR(r.price)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => reserve(hotel.slug, r.name)}
                            className="flex items-center gap-2 border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors hover:bg-gold hover:text-ink"
                          >
                            Reserve <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </Stagger>
            </Section>

            <Section id="amenities" eyebrow="Amenities" title="Everything you need">
              <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3" gap={0.06}>
                {hotel.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Wifi;
                  return (
                    <StaggerItem key={a}>
                      <div className="flex h-full items-center gap-3 border border-gold/20 bg-surface p-4">
                        <Icon size={20} strokeWidth={1.4} className="shrink-0 text-gold-soft" />
                        <span className="text-[14px] text-on-surface">{a}</span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
              <Reveal className="mt-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Also available across our hotels
                </p>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {ROOM_AMENITIES.join(" · ")}. Laundry is a paid service.
                </p>
              </Reveal>
            </Section>

            <Section id="location" eyebrow="Location" title={place}>
              {hasMap ? (
              <Reveal>
                <div className="overflow-hidden border border-gold/30">
                  <iframe
                    title={`Map of ${hotel.name}`}
                    src={mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[320px] w-full border-0 lg:h-[380px]"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gold-gradient px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink"
                  >
                    <Navigation size={14} /> Get directions
                  </a>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-gold/50 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface hover:bg-gold/10"
                  >
                    <MapPin size={14} className="text-gold" /> Open in Google Maps
                  </a>
                </div>
                <p className="mt-3 text-[12px] text-on-surface-variant/70">
                  Map shows the approximate hotel location.
                </p>
              </Reveal>
              ) : (
                <Reveal>
                  <p className="text-body-md font-light text-on-surface-variant">
                    Call us on +91 {phone.slice(0, 5)} {phone.slice(5)} for directions to {hotel.name}.
                  </p>
                </Reveal>
              )}
            </Section>

            <Section id="faq" eyebrow="FAQ" title="Good to know">
              <Reveal>
                <Faq items={faqs} />
              </Reveal>
            </Section>
          </div>
        </div>

        {/* More hotels */}
        <section className="border-t border-gold/20 bg-ivory py-16 text-[#1B1C19] lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-margin">
            <Reveal className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-ink">
                  More Al Noor hotels
                </span>
                <h2 className="mt-2 font-serif text-[30px] leading-9 lg:text-[40px] lg:leading-[48px]">
                  You may also like
                </h2>
              </div>
              <Link
                href="/hotels"
                className="inline-flex items-center gap-2 border-b border-gold/60 pb-1 text-eyebrow font-semibold uppercase tracking-[0.2em] text-gold-ink hover:text-[#1B1C19]"
              >
                All hotels <ArrowRight size={14} />
              </Link>
            </Reveal>
            <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
              {related.map((h) => (
                <StaggerItem key={h.slug} className="flex">
                  <div className="flex w-full">
                    <HotelCard hotel={h} />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getSiteHotels()).map((h) => ({ params: { slug: h.slug } })),
  // Hotels added in the admin get their page on first visit.
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<{ hotel: Hotel; hotels: Hotel[] }> = async ({ params }) => {
  const hotels = await getSiteHotels();
  const hotel = hotels.find((h) => h.slug === String(params?.slug ?? ""));
  if (!hotel) return { notFound: true, revalidate: 60 };
  return { props: { hotel, hotels }, revalidate: SITE_REVALIDATE_SECONDS };
};
