import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { CONTACT, HOTELS } from "../../data/hotels";

/** Collapsible on phones, always open (and not toggleable) from lg up. */
function FooterSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className={`group py-4 lg:py-0 ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-eyebrow font-semibold uppercase text-gold lg:pointer-events-none lg:mb-4">
        {title}
        <ChevronDown
          size={18}
          className="transition-transform group-open:rotate-180 lg:hidden"
        />
      </summary>
      <div className="mt-4 lg:mt-0">{children}</div>
    </details>
  );
}

export default function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-gold/20 bg-ink pb-28 pt-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-margin">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-gutter">
          <div className="space-y-5 lg:col-span-5">
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

          <div className="divide-y divide-gold/15 border-y border-gold/15 lg:col-span-7 lg:grid lg:grid-cols-7 lg:gap-gutter lg:divide-y-0 lg:border-0">
            <FooterSection title="Our Hotels" className="lg:col-span-3">
              <ul className="space-y-2 text-body-sm text-on-surface-variant">
                {HOTELS.map((h) => {
                  const short = h.name.replace("Al Noor ", "");
                  return (
                    <li key={h.slug}>
                      <Link
                        href={`/hotels/${h.slug}`}
                        className="transition-colors hover:text-gold-soft"
                      >
                        {short}
                        {short !== h.city && `, ${h.city}`}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </FooterSection>

            <FooterSection title="Direct Reservations" className="lg:col-span-4">
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
                <Link href="/manage-booking" className="block transition-colors hover:text-gold-soft">
                  Manage your booking
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
            </FooterSection>
          </div>
        </div>
        <div className="mt-10 border-t border-gold/10 pt-6 text-center text-[10px] uppercase tracking-widest text-outline lg:mt-12 lg:text-left lg:text-[11px]">
          © {new Date().getFullYear()} Al Noor Group of Hotels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
