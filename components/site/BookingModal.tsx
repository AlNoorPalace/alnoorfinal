import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import UpiPay from "./UpiPay";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Check,
  Phone,
  Users,
  X,
} from "lucide-react";
import { CONTACT, findHotel, formatINR } from "../../data/hotels";
import { useHotels } from "./HotelsContext";
import { useBooking } from "./BookingContext";
import { fmtLong, nightsBetween } from "./dates";

type Step = "room" | "details" | "done";
/** engine = live availability + instant booking; request = legacy email request */
type Mode = "loading" | "engine" | "request" | "error";

interface Option {
  name: string;
  rate: number;
  maxGuests: number;
  beds: number;
  baths: number;
  /** First photo of the room, if the admin uploaded any. */
  photo?: string;
  /** null when availability is unknown (request mode) */
  available: number | null;
  fits: boolean;
}

interface Confirmed {
  reference: string;
  total: number;
  discount: number;
  emailed: boolean;
}

const errorText = (code: string, phone: string) =>
  code === "sold_out"
    ? "Sorry, that room was just booked. Please choose another room or different dates."
    : code === "rate_limited"
    ? "Too many attempts. Please wait a few minutes and try again."
    : `We couldn't complete your booking. Please try again or call ${phone}.`;

export default function BookingModal() {
  const { modalOpen, closeModal, search, preferredRoom, focusBar } = useBooking();
  const hotels = useHotels();
  const hotel = findHotel(hotels, search.hotel);
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const guests = search.adults + search.children;
  const phoneLabel = CONTACT.phones[0].label;

  const [mode, setMode] = useState<Mode>("loading");
  const [options, setOptions] = useState<Option[]>([]);
  const [step, setStep] = useState<Step>("room");
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const loadRooms = useCallback(
    async (signal?: AbortSignal) => {
      if (!hotel || !search.checkIn || !search.checkOut) return;
      setMode("loading");
      const staticOptions = (available: null): Option[] =>
        hotel.rooms.map((r) => ({
          name: r.name,
          rate: r.price,
          maxGuests: r.maxGuests,
          beds: r.beds,
          baths: r.baths,
          photo: r.images?.[0],
          available,
          fits: guests <= r.maxGuests * search.rooms,
        }));
      try {
        const qs = new URLSearchParams({
          hotel: hotel.slug,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          rooms: String(search.rooms),
          guests: String(guests),
        });
        const res = await fetch(`/api/availability?${qs}`, { signal });
        if (res.status === 503) {
          // Booking engine not set up yet: keep the original email-request flow.
          setOptions(staticOptions(null));
          return setMode("request");
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          rooms: { roomType: string; rate: number; available: number; maxGuests: number; fitsParty: boolean }[];
        };
        setOptions(
          data.rooms.map((r) => {
            const meta = hotel.rooms.find((x) => x.name === r.roomType);
            return {
              name: r.roomType,
              rate: r.rate,
              maxGuests: r.maxGuests,
              beds: meta?.beds ?? 1,
              baths: meta?.baths ?? 1,
              photo: meta?.images?.[0],
              available: r.available,
              fits: r.fitsParty,
            };
          })
        );
        setMode("engine");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setMode("error");
      }
    },
    [hotel, search.checkIn, search.checkOut, search.rooms, guests]
  );

  // Reset and load availability each time the modal opens.
  useEffect(() => {
    if (!modalOpen) return;
    setStep("room");
    setSelected(null);
    setErrors({});
    setApiError("");
    setSending(false);
    setConfirmed(null);
    const ctrl = new AbortController();
    loadRooms(ctrl.signal);
    return () => ctrl.abort();
  }, [modalOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preselect the room the guest clicked "Reserve" on, once rooms are known.
  useEffect(() => {
    if (!modalOpen || selected || !preferredRoom) return;
    const o = options.find((x) => x.name === preferredRoom);
    if (o && o.fits && o.available !== 0) setSelected(o.name);
  }, [modalOpen, options, preferredRoom, selected]);

  // Lock scroll + close on Escape.
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, closeModal]);

  const room = options.find((o) => o.name === selected) ?? null;

  const pricing = useMemo(() => {
    if (!room) return null;
    const base = room.rate * nights * search.rooms;
    return { base, total: base };
  }, [room, nights, search.rooms]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit phone number.";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!hotel || !room || !validate()) return;
    setSending(true);
    setApiError("");
    try {
      if (mode === "engine") {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotel: hotel.slug,
            roomType: room.name,
            checkIn: search.checkIn,
            checkOut: search.checkOut,
            rooms: search.rooms,
            adults: search.adults,
            children: search.children,
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            notes: form.notes.trim(),
            website: form.website,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 201) {
          setConfirmed({
            reference: data.booking.reference,
            total: data.booking.total,
            discount: data.booking.discount,
            emailed: Boolean(data.emailed?.guest),
          });
          return setStep("done");
        }
        if (res.status === 400 && data.fields) {
          const f: Record<string, string> = {};
          if (data.fields.name) f.name = data.fields.name;
          if (data.fields.phone) f.phone = data.fields.phone;
          if (data.fields.email) f.email = data.fields.email;
          setErrors(f);
          if (Object.keys(f).length) return;
        }
        if (res.status === 409) {
          setApiError(errorText("sold_out", phoneLabel));
          setSelected(null);
          setStep("room");
          return void loadRooms();
        }
        return setApiError(errorText(res.status === 429 ? "rate_limited" : "", phoneLabel));
      }

      // Legacy request mode
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_type: room.name,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          branch: hotel.name,
          checkin: search.checkIn,
          checkout: search.checkOut,
          days: nights,
          query: [
            `${search.adults} adult(s), ${search.children} child(ren), ${search.rooms} room(s)`,
            pricing ? `Estimated total: ${formatINR(pricing.total)}` : "",
            form.notes.trim(),
          ].filter(Boolean).join(" | "),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setConfirmed(null);
      setStep("done");
    } catch {
      setApiError(errorText("", phoneLabel));
    } finally {
      setSending(false);
    }
  };

  const inputCls = (err?: string) =>
    `w-full border bg-surface px-3 py-3 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-gold ${
      err ? "border-[#ffb4ab]" : "border-outline-variant/40"
    }`;
  const labelCls = "mb-1.5 block text-eyebrow font-semibold uppercase text-gold";
  const engine = mode === "engine";

  return (
    <AnimatePresence>
      {modalOpen && hotel && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center lg:items-center lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Book ${hotel.name}`}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            className="relative flex max-h-[96dvh] w-full max-w-5xl overflow-hidden border border-gold/40 bg-surface-lowest shadow-2xl lg:max-h-[90vh]"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            {/* Summary column (desktop) */}
            <aside className="relative hidden w-[300px] shrink-0 flex-col justify-end lg:flex">
              <Image src={hotel.image} alt="" fill sizes="300px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              <div className="relative p-6">
                <div className="text-eyebrow font-semibold uppercase text-gold">{hotel.city}</div>
                <h3 className="mt-1 font-serif text-[28px] leading-8 text-on-surface">{hotel.name}</h3>
                <dl className="mt-5 space-y-2 text-[13px] text-on-surface-variant">
                  <div className="flex justify-between"><dt>Check-in</dt><dd className="text-on-surface">{fmtLong(search.checkIn)}</dd></div>
                  <div className="flex justify-between"><dt>Check-out</dt><dd className="text-on-surface">{fmtLong(search.checkOut)}</dd></div>
                  <div className="flex justify-between"><dt>Stay</dt><dd className="text-on-surface">{nights} night{nights > 1 ? "s" : ""}</dd></div>
                  <div className="flex justify-between"><dt>Guests</dt><dd className="text-on-surface">{guests} · {search.rooms} room{search.rooms > 1 ? "s" : ""}</dd></div>
                </dl>
                {pricing && room && (
                  <div className="mt-5 border-t border-gold/30 pt-4 text-[13px]">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>{room.name} × {nights} × {search.rooms}</span>
                      <span>{formatINR(pricing.base)}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-eyebrow uppercase tracking-widest text-gold">{engine ? "Total" : "Est. total"}</span>
                      <span className="font-serif text-[26px] text-on-surface">{formatINR(pricing.total)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-on-surface-variant/70">
                      {engine ? "Pay at the hotel on arrival. Taxes as applicable." : "Final tariff and taxes confirmed by the hotel."}
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* Main column */}
            <div className="thin-scroll flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:p-8">
              {/* Phones: compact trip summary */}
              {step !== "done" && (
                <div className="mb-5 mr-12 border-b border-gold/20 pb-4 lg:hidden">
                  <div className="text-eyebrow font-semibold uppercase text-gold">{hotel.city}</div>
                  <div className="font-serif text-[22px] leading-7 text-on-surface">{hotel.name}</div>
                  <div className="mt-1 text-[12px] text-on-surface-variant">
                    {fmtLong(search.checkIn)} → {fmtLong(search.checkOut)} · {nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}
                  </div>
                  {pricing && room && (
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-[12px] text-on-surface-variant">{room.name}</span>
                      <span className="font-serif text-[22px] text-gold-soft">{formatINR(pricing.total)}</span>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center border border-gold/40 text-gold transition-colors hover:bg-gold/10 lg:right-4 lg:top-4"
              >
                <X size={16} />
              </button>

              {step !== "done" && (
                <ol className="mb-6 flex items-center gap-3 text-eyebrow font-semibold uppercase tracking-[0.18em]">
                  {(["room", "details"] as const).map((s, i) => (
                    <li key={s} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                          step === s
                            ? "border-gold bg-gold text-ink"
                            : i === 0 && step === "details"
                            ? "border-gold text-gold"
                            : "border-outline-variant text-on-surface-variant"
                        }`}
                      >
                        {i === 0 && step === "details" ? <Check size={12} /> : i + 1}
                      </span>
                      <span className={step === s ? "text-gold" : "text-on-surface-variant"}>
                        {s === "room" ? "Choose room" : "Your details"}
                      </span>
                      {i === 0 && <span className="h-px w-10 bg-gold/30" />}
                    </li>
                  ))}
                </ol>
              )}

              <AnimatePresence mode="wait">
                {step === "room" && (
                  <motion.div
                    key="room"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-[28px] leading-9 text-on-surface lg:text-[34px] lg:leading-10">
                      Choose your room
                    </h2>
                    <p className="mt-1 text-[14px] text-on-surface-variant">
                      {hotel.name} · {nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}
                      {engine && " · live availability"}
                    </p>

                    {apiError && (
                      <p role="alert" className="mt-4 border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 p-3 text-[13px] text-[#ffb4ab]">
                        {apiError}
                      </p>
                    )}

                    {mode === "loading" && (
                      <div className="mt-6 space-y-3" aria-busy="true" aria-label="Checking availability">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-[92px] animate-pulse border border-gold/15 bg-surface" />
                        ))}
                      </div>
                    )}

                    {mode === "error" && (
                      <div className="mt-6 border border-gold/30 p-5 text-[14px] text-on-surface-variant">
                        We couldn&apos;t check availability right now.
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button type="button" onClick={() => loadRooms()} className="bg-gold-gradient px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink">
                            Try again
                          </button>
                          <a href={`tel:${CONTACT.primaryTel}`} className="border border-gold/50 px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-on-surface">
                            Call {phoneLabel}
                          </a>
                        </div>
                      </div>
                    )}

                    {(mode === "engine" || mode === "request") && (
                      <>
                        <div className="mt-6 space-y-3">
                          {options.map((r) => {
                            const soldOut = r.available === 0;
                            const disabled = soldOut || !r.fits;
                            const on = selected === r.name;
                            return (
                              <button
                                key={r.name}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelected(r.name)}
                                className={`flex w-full items-center justify-between gap-4 border p-4 text-left transition-colors ${
                                  on
                                    ? "border-gold bg-gold/10"
                                    : disabled
                                    ? "cursor-not-allowed border-outline-variant/30 opacity-50"
                                    : "border-outline-variant/40 hover:border-gold/60"
                                }`}
                              >
                                {r.photo && (
                                  <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden sm:block">
                                    <Image src={r.photo} alt="" fill sizes="96px" className="object-cover" />
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block font-serif text-[22px] text-on-surface">{r.name}</span>
                                  <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                                    <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-gold" />{r.beds} bed{r.beds > 1 ? "s" : ""}</span>
                                    <span className="flex items-center gap-1.5"><Bath size={14} className="text-gold" />{r.baths} bath</span>
                                    <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" />Max {r.maxGuests}</span>
                                    {soldOut && <span className="font-semibold text-[#ffb4ab]">Sold out for these dates</span>}
                                    {!soldOut && !r.fits && <span className="text-[#ffb4ab]">Too small for {guests} guests per room</span>}
                                    {!soldOut && r.fits && r.available !== null && r.available <= 3 && (
                                      <span className="font-semibold text-gold-soft">Only {r.available} left</span>
                                    )}
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span className="block font-serif text-[24px] text-gold">{formatINR(r.rate)}</span>
                                  <span className="text-[11px] text-on-surface-variant">{engine ? "per night" : "per night, onwards"}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {engine && options.length === 0 && (
                          <p role="status" className="mt-4 border border-gold/30 p-4 text-[14px] text-on-surface-variant">
                            Online booking isn&apos;t available for this hotel right now. Please call us on {phoneLabel} and we&apos;ll book your room.
                          </p>
                        )}
                        {engine && options.length > 0 && options.every((o) => o.available === 0) && (
                          <p className="mt-4 text-[14px] text-on-surface-variant">
                            Everything is booked for these dates. Try different dates or call us on {phoneLabel}.
                          </p>
                        )}
                      </>
                    )}

                    <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => { closeModal(); focusBar(); }}
                        className="flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-gold"
                      >
                        <ArrowLeft size={14} /> Change dates or hotel
                      </button>
                      <button
                        type="button"
                        disabled={!room}
                        onClick={() => setStep("details")}
                        className="bg-gold-gradient px-8 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.form
                    key="details"
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2 className="font-serif text-[28px] leading-9 text-on-surface lg:text-[34px] lg:leading-10">Your details</h2>
                    <p className="mt-1 text-[14px] text-on-surface-variant">
                      {room?.name} at {hotel.name}.{" "}
                      {engine
                        ? "Your booking is confirmed instantly. You pay at the hotel."
                        : "Our team will call to confirm availability."}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelCls} htmlFor="bk-name">Full name *</label>
                        <input id="bk-name" className={inputCls(errors.name)} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                        {errors.name && <p className="mt-1 text-[12px] text-[#ffb4ab]">{errors.name}</p>}
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="bk-phone">Phone *</label>
                        <input id="bk-phone" inputMode="numeric" maxLength={10} className={inputCls(errors.phone)} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} autoComplete="tel-national" placeholder="10-digit mobile" />
                        {errors.phone && <p className="mt-1 text-[12px] text-[#ffb4ab]">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="bk-email">Email {engine ? "(for your confirmation)" : "(optional)"}</label>
                        <input id="bk-email" type="email" className={inputCls(errors.email)} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                        {errors.email && <p className="mt-1 text-[12px] text-[#ffb4ab]">{errors.email}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls} htmlFor="bk-notes">Special requests (optional)</label>
                        <textarea id="bk-notes" rows={3} maxLength={500} className={inputCls()} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                      </div>
                      {/* Honeypot: hidden from people, tempting to bots. */}
                      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                        <label htmlFor="bk-website">Website</label>
                        <input id="bk-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                      </div>
                    </div>
                    {apiError && <p role="alert" className="mt-4 text-[13px] text-[#ffb4ab]">{apiError}</p>}
                    <div className="mt-8 flex items-center justify-between">
                      <button type="button" onClick={() => setStep("room")} className="flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-gold">
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button type="submit" disabled={sending} className="bg-gold-gradient px-8 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold disabled:opacity-60">
                        {sending ? "Booking…" : engine ? "Confirm booking" : "Send booking request"}
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex min-h-[440px] flex-col items-center justify-center text-center"
                  >
                    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" aria-hidden>
                      <motion.circle cx="42" cy="42" r="38" stroke="#C9A24B" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
                      <motion.path d="M26 43l11 11 21-23" stroke="#E6C972" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
                    </svg>
                    {confirmed ? (
                      <>
                        <h2 className="mt-6 font-serif text-[32px] leading-10 text-on-surface lg:text-[36px]">Booking confirmed</h2>
                        <p className="mt-2 text-[14px] text-on-surface-variant">Your booking reference</p>
                        <div data-testid="booking-reference" className="mt-1 border border-gold/40 bg-gold/10 px-6 py-2 font-serif text-[30px] tracking-[0.12em] text-gold-soft">
                          {confirmed.reference}
                        </div>
                        <p className="mt-4 max-w-md text-[15px] text-on-surface-variant">
                          {room?.name} at {hotel.name}, {fmtLong(search.checkIn)} to {fmtLong(search.checkOut)}.
                          Total <strong className="text-on-surface">{formatINR(confirmed.total)}</strong>, payable at the hotel on arrival.
                          {confirmed.emailed
                            ? ` We've emailed your confirmation to ${form.email}.`
                            : " Please note your reference: you'll need it with your phone number to manage the booking."}
                        </p>
                        {engine && <UpiPay amount={confirmed.total} reference={confirmed.reference} />}
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                          <Link href="/manage-booking" onClick={closeModal} className="border border-gold/50 px-6 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-gold/10">
                            Manage booking
                          </Link>
                          <button type="button" onClick={closeModal} className="bg-gold-gradient px-8 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink">
                            Done
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="mt-6 font-serif text-[32px] leading-10 text-on-surface lg:text-[36px]">Request received</h2>
                        <p className="mt-3 max-w-md text-[15px] text-on-surface-variant">
                          Thank you, {form.name.trim().split(" ")[0]}. We&apos;ve sent your request for {room?.name} at {hotel.name}. Our team will call you on {form.phone} to confirm your booking.
                        </p>
                        <div className="mt-8 flex gap-3">
                          <a href={`tel:${CONTACT.primaryTel}`} className="flex items-center gap-2 border border-gold/50 px-6 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-gold/10">
                            <Phone size={14} className="text-gold" /> Call us
                          </a>
                          <button type="button" onClick={closeModal} className="bg-gold-gradient px-8 py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink">Done</button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
