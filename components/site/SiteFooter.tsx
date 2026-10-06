import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { CONTACT, HOTELS } from "../../data/hotels";

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-gold/20 bg-ink py-16">
      <div className="mx-auto max-w-7xl px-margin">
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <Image src="/img/logo-mark.png" alt="" width={40} height={39} className="h-10 w-auto" />
              <div className="leading-tight">
                <div className="font-serif text-[24px] uppercase tracking-wider text-gold-soft">
                  Al Noor
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Group of Hotels
                </div>
              </div>
            </div>
            <p className="max-w-md text-body-md font-light text-on-surface-variant">
              Comfortable, well-appointed rooms for business and leisure
              travellers across Chennai, Bengaluru, Hyderabad and Ooty.
            </p>
          </div>

          <div className="col-span-3">
            <div className="mb-4 text-eyebrow font-semibold uppercase text-gold">
              Our Hotels
            </div>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              {HOTELS.map((h) => (
                <li key={h.slug}>
                  <Link
                    href={`/?hotel=${h.slug}#booking-console`}
                    className="transition-colors hover:text-gold-soft"
                  >
                    {h.name.replace("Al Noor ", "")}
                    {h.name.replace("Al Noor ", "") !== h.city && `, ${h.city}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4">
            <div className="mb-4 text-eyebrow font-semibold uppercase text-gold">
              Direct Reservations
            </div>
            <ul className="space-y-3 text-body-sm text-on-surface-variant">
              {CONTACT.phones.map((p) => (
                <li key={p.tel} className="flex items-center gap-3">
                  <Phone size={14} className="text-gold" />
                  <a href={`tel:${p.tel}`} className="transition-colors hover:text-gold-soft">
                    {p.label}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-gold" />
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-gold-soft">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 space-y-2 text-body-sm text-on-surface-variant">
              <Link href="/hotels" className="block transition-colors hover:text-gold-soft">
                All hotels
              </Link>
              <a
                href="https://pdfhost.io/v/2q5Tz6vNCD_Privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-gold-soft"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gold/10 pt-6 text-[11px] uppercase tracking-widest text-outline">
          © {new Date().getFullYear()} Al Noor Group of Hotels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
