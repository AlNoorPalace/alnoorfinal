import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CONTACT } from "../../data/hotels";
import { useBooking } from "./BookingContext";

const SHOW_AFTER_MS = 5000;
const SNOOZE_MS = 24 * 60 * 60 * 1000; // after a dismissal or a submit, don't show it again for a day
const SESSION_KEY = "an_enquiry_shown";
const SNOOZE_KEY = "an_enquiry_until";

const safe = {
  getLocal: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  setLocal: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch { /* private mode */ } },
  getSession: (k: string) => { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  setSession: (k: string, v: string) => { try { window.sessionStorage.setItem(k, v); } catch { /* private mode */ } },
};

/** The WhatsApp chat link with the guest's enquiry already typed. */
export function enquiryLink(v: { name: string; phone: string; message: string; page: string }): string {
  const lines = [
    "Hello Al Noor, I'd like to enquire about a room.",
    `Name: ${v.name}`,
    `Contact number: ${v.phone}`,
    ...(v.message ? [`Message: ${v.message}`] : []),
    `Page: ${v.page}`,
  ];
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** Accepts a 10-digit Indian mobile number, with or without +91 / 0 in front. Returns the 10 digits or null. */
export function cleanPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "").replace(/^(\+?91|0)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/**
 * A short enquiry form that appears 5 seconds after a visitor arrives. Submitting opens
 * WhatsApp with the name, number and message already typed. Nothing is stored on our server.
 */
export default function EnquiryPopup() {
  const { pathname, asPath } = useRouter();
  const { modalOpen, sheetOpen } = useBooking();
  const busy = useRef(false);
  busy.current = modalOpen || sheetOpen;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const skip = pathname.startsWith("/admin") || pathname === "/manage-booking";

  useEffect(() => {
    if (skip || open) return;
    if (safe.getSession(SESSION_KEY)) return;
    if (Number(safe.getLocal(SNOOZE_KEY) ?? 0) > Date.now()) return;
    let tries = 0;
    const tick = () => {
      // Never interrupt someone who is already choosing a room or dates: try again a little later.
      if (busy.current && tries++ < 6) {
        timer = window.setTimeout(tick, SHOW_AFTER_MS);
        return;
      }
      if (busy.current) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      safe.setSession(SESSION_KEY, "1");
      setOpen(true);
    };
    let timer = window.setTimeout(tick, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [skip, open]);

  const close = () => {
    setOpen(false);
    safe.setLocal(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    returnFocus.current?.focus?.();
  };

  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = cleanPhone(form.phone);
    const next: typeof errors = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!phone) next.phone = "Enter a valid 10-digit mobile number.";
    setErrors(next);
    if (next.name || !phone) return;

    const url = enquiryLink({
      name,
      phone: `+91 ${phone}`,
      message: form.message.trim(),
      page: `${window.location.origin}${asPath.split("#")[0]}`,
    });
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "enquiry_whatsapp" });
    // Opened straight from the click so phones and browsers don't block it.
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.assign(url);
    setForm({ name: "", phone: "", message: "" });
    close();
  };

  const input =
    "w-full border border-gold/30 bg-surface-lowest px-4 py-3 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-gold";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
            className="relative w-full max-w-md border border-gold/40 bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:p-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-gold/30 text-gold-soft transition-colors hover:bg-gold/10"
            >
              <X size={16} />
            </button>
            <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">Enquiry</span>
            <h2 id="enquiry-title" className="mt-1 font-serif text-[28px] leading-9 text-on-surface">
              Planning a stay in Chennai?
            </h2>
            <p className="mt-2 text-[14px] text-on-surface-variant">
              Leave your name and number and chat with us on WhatsApp. We'll help you find the right room.
            </p>

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="enq-name" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Your name</label>
                <input ref={nameRef} id="enq-name" name="name" autoComplete="name" className={input} value={form.name} maxLength={60}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "enq-name-err" : undefined} />
                {errors.name && <p id="enq-name-err" role="alert" className="mt-1 text-[12px] text-[#ffb4ab]">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="enq-phone" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Contact number</label>
                <input id="enq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className={input} value={form.phone} maxLength={16}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "enq-phone-err" : undefined} />
                {errors.phone && <p id="enq-phone-err" role="alert" className="mt-1 text-[12px] text-[#ffb4ab]">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="enq-msg" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Message <span className="font-normal normal-case tracking-normal text-on-surface-variant/70">(optional, e.g. dates and guests)</span>
                </label>
                <textarea id="enq-msg" name="message" rows={2} className={input} value={form.message} maxLength={300}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 bg-[#25D366] px-6 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90">
                Continue on WhatsApp
              </button>
              <p className="text-center text-[11px] text-on-surface-variant/70">This opens WhatsApp with your message ready to send.</p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
