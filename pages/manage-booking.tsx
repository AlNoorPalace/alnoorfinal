import { FormEvent, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Phone, Search } from "lucide-react";
import Seo from "../components/site/Seo";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import type { GetStaticProps } from "next";
import { CONTACT, Hotel, formatINR } from "../data/hotels";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";

interface FoundBooking {
  reference: string;
  hotel: string;
  hotel_name: string | null;
  room_type: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guest_name: string;
  total: number;
  discount: number;
  status: "confirmed" | "cancelled";
}

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", weekday: "short", timeZone: "UTC",
  });
};

export default function ManageBooking() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<FoundBooking | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const callUs = `call us on ${CONTACT.phones[0].label}`;

  const call = async (path: string) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: reference.trim(), phone }),
    });
    return { res, data: await res.json().catch(() => ({})) };
  };

  const explain = (status: number, code?: string) =>
    status === 503
      ? `Online booking management isn't available yet. Please ${callUs}.`
      : status === 429
      ? "Too many attempts. Please wait a few minutes and try again."
      : code === "stay_started"
      ? `This stay has already started and can't be cancelled online. Please ${callUs}.`
      : status === 404 || code === "not_found"
      ? "We couldn't find a booking with that reference and phone number. Check both and try again."
      : status === 400
      ? "Please enter your booking reference and the 10-digit phone number you booked with."
      : `Something went wrong. Please try again or ${callUs}.`;

  const find = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBooking(null);
    setConfirmCancel(false);
    setBusy(true);
    try {
      const { res, data } = await call("/api/bookings/lookup");
      if (res.ok) setBooking(data.booking);
      else setError(explain(res.status, data.error));
    } catch {
      setError(explain(0));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setError("");
    setBusy(true);
    try {
      const { res, data } = await call("/api/bookings/cancel");
      if (res.ok) {
        setBooking(data.booking);
        setConfirmCancel(false);
      } else setError(explain(res.status, data.error));
    } catch {
      setError(explain(0));
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full border border-outline-variant/40 bg-surface px-3 py-3 text-[15px] text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-gold";
  const label = "mb-1.5 block text-eyebrow font-semibold uppercase text-gold";

  return (
    <>
      <Seo
        title="Manage your booking | Al Noor Group of Hotels"
        description="Look up or cancel your Al Noor hotel booking with your booking reference and phone number."
        path="/manage-booking"
        noindex
      />
      <SiteHeader solid />
      <main id="main" className="min-h-screen bg-surface-lowest px-6 pb-24 pt-32 lg:pt-36">
        <div className="mx-auto max-w-xl">
          <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
            Your stay
          </span>
          <h1 className="mt-2 font-serif text-[36px] leading-[44px] text-on-surface lg:text-[48px] lg:leading-[56px]">
            Manage your booking
          </h1>
          <p className="mt-3 text-body-md font-light text-on-surface-variant">
            Enter the booking reference from your confirmation and the phone number you booked with.
          </p>

          <form onSubmit={find} className="mt-8 space-y-4 border border-gold/30 bg-surface p-6">
            <div>
              <label className={label} htmlFor="mb-ref">Booking reference</label>
              <input id="mb-ref" className={`${input} uppercase tracking-widest`} placeholder="ALN-XXXXXX" value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label className={label} htmlFor="mb-phone">Phone number</label>
              <input id="mb-phone" inputMode="numeric" maxLength={10} className={input} placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} autoComplete="tel-national" />
            </div>
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 bg-gold-gradient py-3.5 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold disabled:opacity-60">
              <Search size={15} /> {busy && !booking ? "Searching…" : "Find booking"}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 border border-[#ffb4ab]/40 bg-[#ffb4ab]/10 p-4 text-[14px] text-[#ffb4ab]">
              {error}
            </p>
          )}

          <AnimatePresence>
            {booking && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 border border-gold/30 bg-surface"
                aria-label="Booking details"
              >
                <div className="flex items-center justify-between border-b border-gold/20 p-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-on-surface-variant">Reference</div>
                    <div className="font-serif text-[26px] tracking-[0.1em] text-gold-soft">{booking.reference}</div>
                  </div>
                  <span className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${booking.status === "confirmed" ? "bg-gold text-ink" : "border border-[#ffb4ab]/60 text-[#ffb4ab]"}`}>
                    {booking.status}
                  </span>
                </div>
                <dl className="space-y-3 p-5 text-[14px]">
                  {[
                    ["Hotel", booking.hotel_name ?? booking.hotel],
                    ["Room", `${booking.room_type} × ${booking.rooms}`],
                    ["Check-in", fmt(booking.check_in)],
                    ["Check-out", fmt(booking.check_out)],
                    ["Nights", String(booking.nights)],
                    ["Guests", `${booking.adults} adult(s), ${booking.children} child(ren)`],
                    ["Guest name", booking.guest_name],
                    ...(booking.discount > 0 ? [["Corporate discount", `−${formatINR(booking.discount)}`]] : []),
                    ["Total (pay at hotel)", formatINR(booking.total)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-on-surface-variant">{k}</dt>
                      <dd className="text-right text-on-surface">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="border-t border-gold/20 p-5">
                  {booking.status === "cancelled" ? (
                    <p className="text-[14px] text-on-surface-variant">
                      This booking has been cancelled.{" "}
                      <Link href={booking ? `/hotels/${booking.hotel}` : "/hotels"} className="text-gold-soft underline underline-offset-4">
                        Book again
                      </Link>
                    </p>
                  ) : confirmCancel ? (
                    <div>
                      <p className="text-[14px] text-on-surface">Cancel this booking? Your room will be released.</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={cancel} disabled={busy} className="border border-[#ffb4ab]/60 bg-[#ffb4ab]/10 px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-[#ffb4ab] disabled:opacity-60">
                          {busy ? "Cancelling…" : "Yes, cancel booking"}
                        </button>
                        <button type="button" onClick={() => setConfirmCancel(false)} className="border border-gold/50 px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-on-surface">
                          Keep booking
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => setConfirmCancel(true)} className="flex items-center gap-2 border border-gold/50 px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-on-surface transition-colors hover:bg-gold/10">
                        <CalendarDays size={14} className="text-gold" /> Cancel booking
                      </button>
                      <a href={`tel:${CONTACT.primaryTel}`} className="flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-gold-soft">
                        <Phone size={14} className="text-gold" /> To change dates, call {CONTACT.phones[0].label}
                      </a>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticProps: GetStaticProps<{ hotels: Hotel[] }> = async () => ({
  props: { hotels: await getSiteHotels() },
  revalidate: SITE_REVALIDATE_SECONDS,
});
