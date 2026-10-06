import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, Phone, Users } from "lucide-react";
import { CONTACT, Hotel, formatINR, minPrice } from "../../data/hotels";
import { useBooking } from "./BookingContext";
import { Stepper } from "./BookingBar";
import RangeCalendar from "./RangeCalendar";
import { fmtShort, nightsBetween } from "./dates";

/** Sticky booking card on a hotel detail page. */
export default function HotelBookingPanel({ hotel }: { hotel: Hotel }) {
  const { search, setSearch, openModal } = useBooking();
  const [panel, setPanel] = useState<"dates" | "guests" | null>("dates");
  const [error, setError] = useState("");

  // This page is about one hotel; keep the shared search pointed at it.
  useEffect(() => {
    setSearch({ hotel: hotel.slug });
  }, [hotel.slug, setSearch]);

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const guests = search.adults + search.children;
  const toggle = (p: "dates" | "guests") => setPanel((c) => (c === p ? null : p));

  const submit = () => {
    if (!search.checkIn || !search.checkOut || nights < 1) {
      setError("Please select your check-in and check-out dates.");
      setPanel("dates");
      return;
    }
    setError("");
    openModal({ hotel: hotel.slug });
  };

  const fieldCls = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 border bg-surface px-3 py-3 text-left transition-colors ${
      active ? "border-gold" : "border-outline-variant/40 hover:border-gold/60"
    }`;

  return (
    <div
      id="hotel-booking"
      className="scroll-mt-28 border border-gold/30 bg-surface-high/95 p-6 shadow-console"
    >
      <div className="flex items-baseline justify-between border-b border-gold/20 pb-4">
        <div>
          <span className="block text-[11px] uppercase tracking-widest text-on-surface-variant">
            From
          </span>
          <span className="font-serif text-[32px] leading-8 text-gold-soft">
            {formatINR(minPrice(hotel))}
          </span>
        </div>
        <span className="text-[12px] text-on-surface-variant">per night, onwards</span>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <button type="button" onClick={() => toggle("dates")} className={fieldCls(panel === "dates")}>
            <span className="flex items-center gap-2.5">
              <CalendarDays size={16} className="text-gold" />
              <span className="font-serif text-[17px] text-on-surface">
                {search.checkIn && search.checkOut
                  ? `${fmtShort(search.checkIn)} – ${fmtShort(search.checkOut)}`
                  : "Select your dates"}
              </span>
            </span>
            {nights > 0 && (
              <span className="text-[11px] uppercase tracking-wider text-gold">
                {nights} night{nights > 1 ? "s" : ""}
              </span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {panel === "dates" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border border-t-0 border-gold/30 bg-surface-highest p-4">
                  <RangeCalendar
                    single
                    checkIn={search.checkIn}
                    checkOut={search.checkOut}
                    onChange={(ci, co) => {
                      setSearch({ checkIn: ci, checkOut: co });
                      setError("");
                    }}
                    onComplete={() => setPanel("guests")}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <button type="button" onClick={() => toggle("guests")} className={fieldCls(panel === "guests")}>
            <span className="flex items-center gap-2.5">
              <Users size={16} className="text-gold" />
              <span className="font-serif text-[17px] text-on-surface">
                {guests} guest{guests > 1 ? "s" : ""} · {search.rooms} room
                {search.rooms > 1 ? "s" : ""}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-on-surface-variant transition-transform ${panel === "guests" ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {panel === "guests" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border border-t-0 border-gold/30 bg-surface-highest p-4">
                  <Stepper title="Adults" hint="Ages 12 and above" value={search.adults} min={1} max={10} onChange={(n) => setSearch({ adults: n })} />
                  <Stepper title="Children" hint="Ages 0 to 11" value={search.children} min={0} max={6} onChange={(n) => setSearch({ children: n })} />
                  <Stepper title="Rooms" hint="Number of rooms" value={search.rooms} min={1} max={6} onChange={(n) => setSearch({ rooms: n })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-[#ffb4ab]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        className="mt-5 w-full bg-gold-gradient py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
      >
        Check rooms
      </button>
      <a
        href={`tel:+91${hotel.phone}`}
        className="mt-3 flex items-center justify-center gap-2 border border-gold/40 py-3 text-[13px] text-on-surface transition-colors hover:bg-gold/10"
      >
        <Phone size={14} className="text-gold" />
        Call +91 {hotel.phone.slice(0, 5)} {hotel.phone.slice(5)}
      </a>
      <p className="mt-4 text-center text-[11px] text-on-surface-variant/70">
        Send a request now. Our team confirms availability by phone.
      </p>
    </div>
  );
}
