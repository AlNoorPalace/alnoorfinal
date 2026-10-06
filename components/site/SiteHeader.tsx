import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { CONTACT } from "../../data/hotels";
import { useBooking } from "./BookingContext";
import MobileActionBar from "./MobileActionBar";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Hotels", href: "/hotels" },
  { label: "Rooms", href: "/#rooms" },
  { label: "Corporate", href: "/#corporate" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const router = useRouter();
  const { focusBar } = useBooking();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname === href;
  const bg = scrolled || solid || open;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed left-0 top-0 z-50 w-full border-b transition-colors duration-300 ${
          bg
            ? "border-gold/20 bg-ink/95 backdrop-blur-md"
            : "border-transparent bg-gradient-to-b from-black/70 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:h-20 lg:px-margin">
          <Link href="/" className="flex items-center gap-3" aria-label="Al Noor Group of Hotels, home">
            <Image
              src="/img/logo-mark.png"
              alt=""
              width={44}
              height={43}
              priority
              className="h-9 w-auto lg:h-11"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-[20px] uppercase tracking-wider text-gold-soft lg:text-[24px]">
                Al Noor
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                Group of Hotels
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`group relative pb-1 text-eyebrow font-semibold uppercase transition-colors ${
                  isActive(n.href)
                    ? "text-gold-soft"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {n.label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold-soft transition-transform duration-300 ${
                    isActive(n.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href={`tel:${CONTACT.primaryTel}`}
              className="hidden items-center gap-2 text-[13px] text-on-surface-variant transition-colors hover:text-gold-soft xl:flex"
            >
              <Phone size={14} className="text-gold" />
              {CONTACT.phones[0].label}
            </a>
            <button
              type="button"
              onClick={() => focusBar()}
              className="hidden bg-gold-gradient px-6 py-2.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink transition-shadow hover:shadow-gold sm:inline-flex"
            >
              Book Now
            </button>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center border border-gold/40 text-gold lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink px-6 pt-20 lg:hidden"
          >
            {NAV.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-gold/15 py-4 font-serif text-[34px] text-on-surface"
                >
                  {n.label}
                </Link>
              </motion.div>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                focusBar();
              }}
              className="mt-8 bg-gold-gradient py-3 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink"
            >
              Book Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <MobileActionBar />
    </>
  );
}
