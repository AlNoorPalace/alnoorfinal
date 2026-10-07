import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Phone, Utensils, Wifi } from "lucide-react";
import { CONTACT, Hotel, formatINR, minPrice } from "../../data/hotels";
import { useBooking } from "./BookingContext";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const { reserve } = useBooking();
  return (
    <article className="group flex flex-col overflow-hidden border border-gold/30 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <Link
        href={`/hotels/${hotel.slug}`}
        aria-label={`View ${hotel.name}`}
        className="relative block h-60 overflow-hidden"
      >
        <Image
          src={hotel.image}
          alt={`${hotel.name}, ${hotel.city}`}
          fill
          sizes="(min-width: 1024px) 380px, 50vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ivory">
          {hotel.city} · {hotel.state}
        </span>
        <span className="absolute bottom-3 left-3 bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
          From {formatINR(minPrice(hotel))} / night
        </span>
      </Link>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-serif text-[24px] leading-7 text-[#1B1C19]">
            <Link href={`/hotels/${hotel.slug}`} className="transition-colors hover:text-gold-deep">
              {hotel.name}
            </Link>
          </h3>
          <p className="mt-1 text-[13px] italic text-gold-ink">{hotel.tagline}</p>
          <p className="mt-3 line-clamp-3 text-body-sm text-[#474744]">
            {hotel.description}
          </p>
          <div className="my-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gold-ink">
            <span className="flex items-center gap-1.5"><Wifi size={14} /> Wi-Fi</span>
            <span className="flex items-center gap-1.5"><Car size={14} /> Parking</span>
            <span className="flex items-center gap-1.5"><Utensils size={14} /> Restaurant</span>
          </div>
          <p className="text-[12px] text-[#474744]">
            {hotel.rooms.map((r) => r.name).join(" · ")}
          </p>
        </div>
        <div className="mt-5 space-y-3 border-t border-gold/20 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-gold-ink/80">Direct contact</span>
              <a
                href={`tel:+91${hotel.phone}`}
                className="text-[16px] font-semibold text-[#1B1C19] transition-colors hover:text-gold-deep"
              >
                +91 {hotel.phone.slice(0, 5)} {hotel.phone.slice(5)}
              </a>
            </div>
            <a
              href={`tel:+91${hotel.phone}`}
              aria-label={`Call ${hotel.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold text-gold-ink transition-colors hover:bg-gold hover:text-white"
            >
              <Phone size={15} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/hotels/${hotel.slug}`}
              className="flex items-center justify-center border border-gold/60 py-3 text-eyebrow font-semibold uppercase tracking-[0.14em] text-gold-ink transition-colors hover:bg-gold/10"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={() => reserve(hotel.slug)}
              className="flex items-center justify-center gap-2 bg-gold-gradient py-3 text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink transition-shadow hover:shadow-gold"
            >
              Reserve <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Fills the last slot of the hotel grid. */
export function HelpCard() {
  const { focusBar } = useBooking();
  return (
    <div className="flex w-full flex-col justify-between border border-gold/40 bg-ink p-8 text-on-surface">
      <div>
        <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
          Need help choosing?
        </span>
        <h3 className="mt-3 font-serif text-[30px] leading-9">
          Talk to our reservations team
        </h3>
        <p className="mt-3 text-body-sm font-light text-on-surface-variant">
          Tell us your dates and we&apos;ll recommend the right hotel and room
          for your trip. Book direct for extra perks.
        </p>
      </div>
      <div className="mt-8 space-y-3">
        <a
          href={`tel:${CONTACT.primaryTel}`}
          className="flex items-center justify-center gap-2 border border-gold/50 py-3 text-eyebrow font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-gold/10"
        >
          <Phone size={14} className="text-gold" /> {CONTACT.phones[0].label}
        </a>
        <button
          type="button"
          onClick={() => focusBar()}
          className="flex w-full items-center justify-center gap-2 bg-gold-gradient py-3 text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink transition-shadow hover:shadow-gold"
        >
          Check availability <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
