import { ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import {
  citiesOf,
  findHotel,
  formatINR,
  hotelsInCity,
  minPrice,
} from "../../data/hotels";
import { useHotels } from "./HotelsContext";
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

export function Stepper({
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
  const { search, setSearch, openModal, sheetOpen, setSheetOpen } = useBooking();
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const hotels = useHotels();
  const cities = citiesOf(hotels);
  const hotel = findHotel(hotels, search.hotel);
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

  const closeSheet = () => {
    setSheetOpen(false);
    setCityFilter(null);
    setError("");
  };

  const submitSheet = () => {
    if (!hotel) return setError("Please choose a hotel.");
    if (!search.checkIn || !search.checkOut || nights < 1)
      return setError("Please select your check-in and check-out dates.");
    closeSheet();
    openModal();
  };

  const summaryTitle = hotel ? hotel.name.replace("Al Noor ", "") : "Choose a hotel";
  const summarySub = [
    search.checkIn && search.checkOut
      ? `${fmtShort(search.checkIn)} – ${fmtShort(search.checkOut)}`
      : "Add dates",
    `${guests} guest${guests > 1 ? "s" : ""}`,
    `${search.rooms} room${search.rooms > 1 ? "s" : ""}`,
  ].join(" · ");

  const sheetCities = cityFilter ? [cityFilter] : cities;

  return (
    <div
      id="booking-console"
      ref={ref}
      className="relative z-30 mx-auto -mt-6 w-full max-w-6xl px-6 lg:-mt-16 lg:px-margin"
    >
      {/* Phones: compact summary card + bottom sheet */}
      <div className="border border-gold/30 bg-surface-high/95 p-4 shadow-console backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-between gap-3 bg-surface-lowest p-3 text-left active:scale-[0.99]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <MapPin size={22} className="shrink-0 text-gold-soft" />
            <span className="flex min-w-0 flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Find your stay
              </span>
              <span className="truncate font-serif text-[18px] leading-5 text-on-surface">
                {summaryTitle}
              </span>
              <span className="truncate text-[12px] text-on-surface-variant">
                {summarySub}
              </span>
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-gold text-ink">
            <SlidersHorizontal size={18} />
          </span>
        </button>
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
          {cities.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCityFilter(c);
                setSheetOpen(true);
              }}
              className="shrink-0 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant active:bg-gold active:text-ink"
            >
              {c} ({hotelsInCity(hotels, c).length})
            </button>
          ))}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden border border-gold/30 bg-surface-high/95 p-6 shadow-console backdrop-blur-xl lg:block">
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
                  {cities.map((city) => (
                    <div key={city} className="mb-2 last:mb-0">
                      <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {city}
                      </div>
                      {hotelsInCity(hotels, city).map((h) => (
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
                          {minPrice(h) !== null && (
                            <span className="shrink-0 text-right text-[11px] text-gold">
                              from
                              <br />
                              <span className="text-[13px] font-semibold">
                                {formatINR(minPrice(h)!)}
                              </span>
                            </span>
                          )}
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

      {mounted &&
        createPortal(
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col justify-end lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search stays"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeSheet} />
            <motion.div
              className="relative flex max-h-[92dvh] flex-col bg-surface-low shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold-soft" />
                  <span className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-gold-soft">
                    Find your stay
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  aria-label="Close search"
                  className="flex h-9 w-9 items-center justify-center text-on-surface-variant hover:text-gold"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto px-5 pb-4">
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                      Select hotel
                    </span>
                    {cityFilter && (
                      <button
                        type="button"
                        onClick={() => setCityFilter(null)}
                        className="text-[11px] text-gold underline-offset-4 hover:underline"
                      >
                        Show all cities
                      </button>
                    )}
                  </div>
                  {sheetCities.map((city) => (
                    <div key={city} className="mb-3">
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {city}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {hotelsInCity(hotels, city).map((h) => {
                          const on = search.hotel === h.slug;
                          return (
                            <button
                              key={h.slug}
                              type="button"
                              onClick={() => {
                                setSearch({ hotel: h.slug });
                                setError("");
                              }}
                              className={`flex items-center justify-between p-3 text-left transition-colors ${
                                on ? "bg-gold text-ink" : "bg-surface-high text-on-surface"
                              }`}
                            >
                              <span>
                                <span className="block font-serif text-[17px] leading-5">
                                  {h.name.replace("Al Noor ", "")}
                                </span>
                                <span className={`block text-[11px] ${on ? "text-ink/70" : "text-on-surface-variant"}`}>
                                  {h.rooms.length} room types
                                </span>
                              </span>
                              {minPrice(h) !== null && (
                                <span className={`text-[12px] font-semibold ${on ? "text-ink" : "text-gold"}`}>
                                  from {formatINR(minPrice(h)!)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </section>

                <section>
                  <span className="mb-2 block text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    Dates
                  </span>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="bg-surface-high p-3">
                      <span className="block text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Check-in</span>
                      <span className="font-serif text-[17px] text-gold-soft">
                        {search.checkIn ? fmtShort(search.checkIn) : "Add date"}
                      </span>
                    </div>
                    <div className="bg-surface-high p-3">
                      <span className="block text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Check-out</span>
                      <span className="font-serif text-[17px] text-gold-soft">
                        {search.checkOut ? fmtShort(search.checkOut) : "Add date"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-high p-4">
                    <RangeCalendar
                      checkIn={search.checkIn}
                      checkOut={search.checkOut}
                      onChange={(ci, co) => {
                        setSearch({ checkIn: ci, checkOut: co });
                        setError("");
                      }}
                    />
                  </div>
                </section>

                <section className="space-y-4 bg-surface-high p-4">
                  <Stepper title="Adults" hint="Ages 12 and above" value={search.adults} min={1} max={10} onChange={(n) => setSearch({ adults: n })} />
                  <Stepper title="Children" hint="Ages 0 to 11" value={search.children} min={0} max={6} onChange={(n) => setSearch({ children: n })} />
                  <Stepper title="Rooms" hint="Number of rooms" value={search.rooms} min={1} max={6} onChange={(n) => setSearch({ rooms: n })} />
                </section>
              </div>

              <div className="border-t border-gold/15 bg-surface-low p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {error && (
                  <p role="alert" className="mb-3 text-[13px] text-[#ffb4ab]">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={submitSheet}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-gold-gradient text-eyebrow font-semibold uppercase tracking-[0.18em] text-ink active:opacity-90"
                >
                  <Search size={16} /> Search available stays
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
