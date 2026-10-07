import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Bath, BedDouble, Check, ChevronRight, MapPin, Phone, Users } from "lucide-react";
import Seo from "../../components/site/Seo";
import SiteHeader from "../../components/site/SiteHeader";
import SiteFooter from "../../components/site/SiteFooter";
import HotelGallery from "../../components/site/HotelGallery";
import { useBooking } from "../../components/site/BookingContext";
import { Reveal, Stagger, StaggerItem } from "../../components/site/motion";
import { CONTACT, Hotel, ROOM_AMENITIES, SITE_URL, formatINR } from "../../data/hotels";
import { RoomKind, aggregateRooms, roomImages } from "../../data/rooms";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../../lib/siteHotels";

interface Props {
  room: RoomKind;
  others: RoomKind[];
  /** Position in the full list, so the placeholder photo matches the one on the home page. */
  index: number;
  hotelCount: number;
}

export default function RoomPage({ room, others, index, hotelCount }: Props) {
  const { reserve, focusBar, search } = useBooking();
  const router = useRouter();
  // With dates already chosen, go straight to booking this room. Otherwise the hotel page
  // is where dates and guests are picked (there is no search bar on this page).
  const book = (hotelSlug: string) =>
    search.checkIn && search.checkOut ? reserve(hotelSlug, room.name) : router.push(`/hotels/${hotelSlug}#rooms`);
  const photos = roomImages(room, index).map((src, i) => ({
    src,
    alt: `${room.name} room${i > 0 ? `, photo ${i + 1}` : ""}`,
  }));
  const cheapest = room.offers[0];

  return (
    <>
      <Seo
        title={`${room.name} Rooms | Al Noor Group of Hotels`}
        description={`${room.description} From ${formatINR(room.minPrice)} a night at ${room.offers.length} Al Noor hotel${room.offers.length === 1 ? "" : "s"}.`.slice(0, 200)}
        path={`/rooms/${room.slug}`}
        image={photos[0].src.startsWith("http") ? photos[0].src : `${SITE_URL}${photos[0].src}`}
      />
      <SiteHeader solid />

      <main id="main" className="bg-surface-lowest pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-margin lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
            <Link href="/" className="hover:text-gold-soft">Home</Link>
            <ChevronRight size={12} />
            <Link href="/#rooms" className="hover:text-gold-soft">Rooms</Link>
            <ChevronRight size={12} />
            <span aria-current="page" className="text-on-surface">{room.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
            <div className="min-w-0 space-y-12">
              <Reveal>
                {room.featured && (
                  <span className="mb-3 inline-block bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">Featured</span>
                )}
                <h1 className="font-serif text-[40px] leading-[48px] text-on-surface lg:text-[56px] lg:leading-[64px]">{room.name}</h1>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><BedDouble size={16} className="text-gold" />{room.beds} bed{room.beds > 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1.5"><Bath size={16} className="text-gold" />{room.baths} bath</span>
                  <span className="flex items-center gap-1.5"><Users size={16} className="text-gold" />Up to {room.maxGuests} guests</span>
                </div>
              </Reveal>

              <Reveal>
                <HotelGallery photos={photos} name={room.name} />
              </Reveal>

              <Reveal>
                <h2 className="font-serif text-[28px] text-on-surface">About this room</h2>
                <p className="mt-3 text-body-lg font-light text-on-surface-variant">{room.description}</p>
              </Reveal>

              <section id="hotels" className="scroll-mt-28">
                <Reveal>
                  <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">Where to book</span>
                  <h2 className="mb-6 mt-2 font-serif text-[30px] leading-9 text-on-surface lg:text-[36px] lg:leading-10">
                    Available at {room.offers.length} hotel{room.offers.length === 1 ? "" : "s"}
                  </h2>
                </Reveal>
                <Stagger className="space-y-3" gap={0.07}>
                  {room.offers.map((o) => (
                    <StaggerItem key={o.hotelSlug}>
                      <div className="flex flex-col gap-4 border border-gold/20 bg-surface p-5 transition-colors hover:border-gold/60 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Link href={`/hotels/${o.hotelSlug}`} className="font-serif text-[22px] text-on-surface hover:text-gold-soft">
                            {o.hotelName}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gold" />{o.city}</span>
                            <span>{o.beds} bed{o.beds > 1 ? "s" : ""} · {o.baths} bath · up to {o.maxGuests} guests</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                          <div className="text-right">
                            <span className="block text-[11px] text-on-surface-variant">Per night</span>
                            <span className="font-serif text-[26px] leading-8 text-gold-soft">{formatINR(o.price)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => book(o.hotelSlug)}
                            className="flex items-center gap-2 border border-gold/50 bg-gold/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors hover:bg-gold hover:text-ink"
                          >
                            Reserve <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>

              <Reveal>
                <h2 className="font-serif text-[28px] text-on-surface">In every room</h2>
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {ROOM_AMENITIES.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-[14px] text-on-surface-variant">
                      <Check size={15} className="text-gold" /> {a}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-on-surface-variant/70">Amenities can vary by hotel. Laundry is a paid service.</p>
              </Reveal>
            </div>

            <aside>
              <div className="border border-gold/30 bg-surface p-6 lg:sticky lg:top-28">
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant">From</span>
                <div className="font-serif text-[40px] leading-[48px] text-gold-soft">{formatINR(room.minPrice)}</div>
                <span className="text-[12px] text-on-surface-variant">per night{hotelCount > 1 ? ", rates vary by hotel" : ""}</span>
                <button
                  type="button"
                  onClick={() => book(cheapest.hotelSlug)}
                  className="mt-5 w-full bg-gold-gradient px-6 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
                >
                  Reserve at {cheapest.hotelName}
                </button>
                <button
                  type="button"
                  onClick={() => focusBar()}
                  className="mt-3 w-full border border-gold/50 px-6 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-gold/10"
                >
                  Choose another hotel
                </button>
                <a
                  href={`tel:${CONTACT.primaryTel}`}
                  className="mt-3 flex items-center justify-center gap-2 text-[13px] text-on-surface-variant hover:text-gold-soft"
                >
                  <Phone size={14} className="text-gold" /> {CONTACT.phones[0].label}
                </a>
                <p className="mt-4 text-[11px] leading-4 text-on-surface-variant">Pay at the hotel on arrival. Taxes as applicable.</p>
              </div>
            </aside>
          </div>

          {others.length > 0 && (
            <section className="mt-20" aria-labelledby="more-rooms">
              <Reveal>
                <h2 id="more-rooms" className="mb-6 font-serif text-[30px] text-on-surface">More room types</h2>
              </Reveal>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/rooms/${o.slug}`} className="group block border border-gold/20 bg-surface p-5 transition-colors hover:border-gold/60">
                      <span className="block font-serif text-[22px] text-on-surface group-hover:text-gold-soft">{o.name}</span>
                      <span className="mt-1 block text-[12px] text-on-surface-variant">{o.beds} bed{o.beds > 1 ? "s" : ""} · {o.baths} bath</span>
                      <span className="mt-3 block font-serif text-[20px] text-gold-soft">{formatINR(o.minPrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  // Rooms are created in the admin at any time, so any new room page is built on first visit.
  paths: aggregateRooms(await getSiteHotels()).map((r) => ({ params: { slug: r.slug } })),
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const hotels: Hotel[] = await getSiteHotels();
  const all = aggregateRooms(hotels);
  const index = all.findIndex((r) => r.slug === params?.slug);
  if (index === -1) return { notFound: true, revalidate: 60 };
  return {
    props: {
      room: all[index],
      others: all.filter((_, i) => i !== index).slice(0, 4),
      index,
      hotelCount: hotels.length,
    },
    revalidate: SITE_REVALIDATE_SECONDS,
  };
};
