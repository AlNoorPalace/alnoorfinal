import { ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  CITIES,
  HOTELS,
  formatINR,
  getHotel,
  hotelsByCity,
  minPrice,
} from "../../data/hotels";
import { useBooking } from "./BookingContext";
import RangeCalendar from "./RangeCalendar";
import { fmtShort, nightsBetween } from "./dates";

type Panel = "dest" | "dates" | "guests" | null;

const pop = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
  transition: { duration: 0.18 },
};

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-eyebrow font-semibold uppercase text-gold">
      {children}
    </span>
  );
}

function Field({
  icon,
  active,
  onClick,
  children,
  trailing,
}: {
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-between gap-2 border bg-surface px-3 text-left transition-colors ${
        active ? "border-gold" : "border-outline-variant/40 hover:border-gold/60"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="text-gold">{icon}</span>
        <span className="truncate font-serif text-[18px] text-on-surface">
          {children}
        </span>
      </span>
      {trailing}
    </button>
  );
}

function Stepper({
  title,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  title: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[13px] font-medium text-on-surface">{title}</div>
        <div className="text-[11px] text-on-surface-variant">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${title}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-7 w-7 items-center justify-center border border-gold/40 text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-4 text-center font-serif text-[18px]">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${title}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center border border-gold/40 text-gold transition-colors hover:bg-gold/10 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function BookingBar() {
  const { search, setSearch, openModal } = useBooking();
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Keep the bar (and the popover under it) fully visible when a panel opens.
  useEffect(() => {
    if (!panel || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.bottom + 460 > window.innerHeight) {
      window.scrollBy({
        top: rect.top - Math.max(96, window.innerHeight * 0.12),
        behavior: "smooth",
      });
    }
  }, [panel]);

  const hotel = getHotel(search.hotel);
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  const submit = () => {
    if (!hotel) {
      setError("Please choose a hotel.");
      setPanel("dest");
      return;
    }
    if (!search.checkIn || !search.checkOut || nights < 1) {
      setError("Please select your check-in and check-out dates.");
      setPanel("dates");
      return;
    }
    setError("");
    setPanel(null);
    openModal();
  };

  const guests = search.adults + search.children;

  return (
    <div
      id="booking-console"
      ref={ref}
      className="relative z-30 mx-auto -mt-16 w-full max-w-6xl px-margin"
    >
      <div className="border border-gold/30 bg-surface-high/95 p-6 shadow-console backdrop-blur-xl">
        <div className="grid grid-cols-12 items-end gap-4">
          {/* Destination */}
          <div className="relative col-span-3">
            <Label>Destination</Label>
            <Field
              icon={<MapPin size={16} />}
              active={panel === "dest"}
              onClick={() => toggle("dest")}
              trailing={<ChevronDown size={16} className="text-on-surface-variant" />}
            >
              {hotel ? hotel.name.replace("Al Noor ", "") : "Choose a hotel"}
            </Field>
            <AnimatePresence>
              {panel === "dest" && (
                <motion.div
                  {...pop}
                  className="thin-scroll absolute left-0 top-full z-50 mt-2 max-h-[420px] w-[360px] overflow-y-auto border border-gold/40 bg-surface-highest p-3 shadow-2xl"
                >
                  {CITIES.map((city) => (
                    <div key={city} className="mb-2 last:mb-0">
                      <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {city}
                      </div>
                      {hotelsByCity(city).map((h) => (
                        <button
                          key={h.slug}
                          type="button"
                          onClick={() => {
                            setSearch({ hotel: h.slug });
                            setError("");
                            setPanel("dates");
                          }}
                          className={`flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-surface ${
                            search.hotel === h.slug ? "bg-surface" : ""
                          }`}
                        >
                          <span className="relative h-11 w-14 shrink-0 overflow-hidden">
                            <Image
                              src={h.image}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-serif text-[17px] leading-5 text-on-surface">
                              {h.name.replace("Al Noor ", "")}
                            </span>
                            <span className="block truncate text-[11px] text-on-surface-variant">
                              {h.tagline}
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-[11px] text-gold">
                            from
                            <br />
                            <span className="text-[13px] font-semibold">
                              {formatINR(minPrice(h))}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dates */}
          <div className="relative col-span-4 grid grid-cols-2 gap-4">
            <div>
              <Label>Check-In</Label>
              <Field
                icon={<CalendarDays size={16} />}
                active={panel === "dates"}
                onClick={() => toggle("dates")}
              >
                <span className={search.checkIn ? "" : "text-on-surface-variant/70"}>
                  {search.checkIn ? fmtShort(search.checkIn) : "Add date"}
                </span>
              </Field>
            </div>
            <div>
              <Label>Check-Out</Label>
              <Field
                icon={<CalendarDays size={16} />}
                active={panel === "dates"}
                onClick={() => toggle("dates")}
              >
                <span className={search.checkOut ? "" : "text-on-surface-variant/70"}>
                  {search.checkOut ? fmtShort(search.checkOut) : "Add date"}
                </span>
              </Field>
            </div>
            <AnimatePresence>
              {panel === "dates" && (
                <motion.div
                  {...pop}
                  className="absolute left-0 top-full z-50 mt-2 border border-gold/40 bg-surface-highest p-6 shadow-2xl"
                >
                  <RangeCalendar
                    checkIn={search.checkIn}
                    checkOut={search.checkOut}
                    onChange={(ci, co) => {
                      setSearch({ checkIn: ci, checkOut: co });
                      setError("");
                    }}
                    onComplete={() => setPanel("guests")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Guests */}
          <div className="relative col-span-3">
            <Label>Guests &amp; Rooms</Label>
            <Field
              icon={<Users size={16} />}
              active={panel === "guests"}
              onClick={() => toggle("guests")}
              trailing={<ChevronDown size={16} className="text-on-surface-variant" />}
            >
              {guests} Guest{guests > 1 ? "s" : ""} · {search.rooms} Room
              {search.rooms > 1 ? "s" : ""}
            </Field>
            <AnimatePresence>
              {panel === "guests" && (
                <motion.div
                  {...pop}
                  className="absolute right-0 top-full z-50 mt-2 w-[290px] space-y-4 border border-gold/40 bg-surface-highest p-5 shadow-2xl"
                >
                  <Stepper
                    title="Adults"
                    hint="Ages 12 and above"
                    value={search.adults}
                    min={1}
                    max={10}
                    onChange={(n) => setSearch({ adults: n })}
                  />
                  <Stepper
                    title="Children"
                    hint="Ages 0 to 11"
                    value={search.children}
                    min={0}
                    max={6}
                    onChange={(n) => setSearch({ children: n })}
                  />
                  <Stepper
                    title="Rooms"
                    hint="Number of rooms"
                    value={search.rooms}
                    min={1}
                    max={6}
                    onChange={(n) => setSearch({ rooms: n })}
                  />
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    className="w-full bg-gold-gradient py-2 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="col-span-2">
            <button
              type="button"
              onClick={submit}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden bg-gold-gradient text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink shadow-lg transition-shadow hover:shadow-gold"
            >
              <Search size={16} />
              <span>Check Rooms</span>
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/40 transition-all duration-700 group-hover:left-[150%]" />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              role="alert"
              className="mt-3 text-[13px] text-[#ffb4ab]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
