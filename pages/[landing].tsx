import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, MapPin, Navigation, Phone } from "lucide-react";
import Seo from "../components/site/Seo";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import HotelGallery from "../components/site/HotelGallery";
import Faq from "../components/site/Faq";
import { EASE, Reveal } from "../components/site/motion";
import { HOTELS, SITE_URL, formatINR, formatPhone, hotelPhone, minPrice } from "../data/hotels";
import { LANDING_PAGES, LandingPage, PARRYS_ADDRESS, PARRYS_NEARBY, findLanding } from "../data/landingPages";
import { landingPageJsonLd } from "../data/seo";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";

interface Props {
  page: LandingPage;
  others: { slug: string; h1: string }[];
  fromPrice: number | null;
  phone: string;
  lat: number | null;
  lng: number | null;
}

export default function LandingPageView({ page, others, fromPrice, phone, lat, lng }: Props) {
  const hasMap = lat !== null && lng !== null;
  return (
    <>
      <Seo
        title={page.title}
        description={page.description}
        path={`/${page.slug}`}
        image={`${SITE_URL}${page.ogImage}`}
        jsonLd={landingPageJsonLd(page, { phone, lat, lng })}
      />
      <SiteHeader solid />

      <main id="main" className="bg-surface-lowest">
        <section className="relative flex min-h-[420px] items-end overflow-hidden pt-16 lg:min-h-[500px] lg:pt-20">
          <div className="absolute inset-0">
            <Image src={page.hero.src} alt={page.hero.alt} fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-lowest via-surface-lowest/60 to-black/50" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 lg:px-margin lg:pb-14">
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-on-surface-variant">
              <Link href="/" className="hover:text-gold-soft">Home</Link>
              <ChevronRight size={12} />
              <Link href="/hotels/parrys" className="hover:text-gold-soft">Parrys hotel</Link>
              <ChevronRight size={12} />
              <span aria-current="page" className="text-on-surface">{page.eyebrow}</span>
            </nav>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}>
              <div className="mb-3 inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
                <MapPin size={14} /> {page.eyebrow}
              </div>
              <h1 className="max-w-4xl font-serif text-[36px] leading-[44px] text-on-surface lg:text-[56px] lg:leading-[64px]">{page.h1}</h1>
              <p className="mt-3 max-w-2xl font-serif text-[19px] italic text-gold-soft lg:text-[24px]">{page.tagline}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/hotels/parrys"
                  className="flex items-center justify-center gap-2 bg-gold-gradient px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
                >
                  See rooms and book <ArrowRight size={14} />
                </Link>
                <a
                  href={`tel:+91${phone}`}
                  className="flex items-center justify-center gap-2 border border-gold/50 bg-black/30 px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface backdrop-blur-sm transition-colors hover:bg-gold/10"
                >
                  <Phone size={14} className="text-gold" /> Call +91 {formatPhone(phone)}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl space-y-14 px-6 py-12 lg:space-y-16 lg:px-margin lg:py-20">
          <Reveal>
            <p className="text-body-lg font-light text-on-surface-variant">{page.intro}</p>
            {fromPrice !== null && (
              <p className="mt-4 inline-block border border-gold/30 px-4 py-2 text-[14px] text-on-surface">
                Rooms from <strong className="text-gold-soft">{formatINR(fromPrice)}</strong> a night. Pay at the hotel.
              </p>
            )}
          </Reveal>

          <Reveal>
            <HotelGallery photos={page.photos} name="Al Noor Residency, Parrys Corner" />
          </Reveal>

          {page.sections.map((s) => (
            <Reveal key={s.heading}>
              <h2 className="font-serif text-[28px] leading-9 text-on-surface lg:text-[34px] lg:leading-10">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3 text-body-md text-on-surface-variant">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[15px] text-on-surface">
                      <Check size={16} className="mt-1 shrink-0 text-gold" /> {b}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}

          <Reveal>
            <h2 className="font-serif text-[28px] leading-9 text-on-surface lg:text-[34px] lg:leading-10">Where we are</h2>
            <address className="mt-3 flex items-start gap-2.5 text-body-md not-italic text-on-surface">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>Al Noor Residency Business Class Hotel, {PARRYS_ADDRESS}</span>
            </address>
            <ul className="mt-4 flex flex-wrap gap-2">
              {PARRYS_NEARBY.map((n) => (
                <li key={n.name} className="border border-gold/30 px-3 py-1.5 text-[13px] text-on-surface">
                  {n.name} <span className="text-on-surface-variant">· {n.detail}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-on-surface-variant/70">
              Times are approximate and vary with traffic. Check Google Maps for your route.
            </p>
            {hasMap && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 border border-gold/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gold-soft transition-colors hover:bg-gold hover:text-ink"
              >
                <Navigation size={14} /> Get directions
              </a>
            )}
          </Reveal>

          <section aria-labelledby="faq">
            <Reveal>
              <h2 id="faq" className="mb-5 font-serif text-[28px] leading-9 text-on-surface lg:text-[34px] lg:leading-10">Questions guests ask</h2>
            </Reveal>
            <Reveal>
              <Faq items={page.faqs} />
            </Reveal>
          </section>

          <Reveal className="border border-gold/30 bg-surface p-6 text-center lg:p-8">
            <h2 className="font-serif text-[26px] text-on-surface">Ready to book your stay?</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">Choose your dates, pick a room and pay at the hotel.</p>
            <Link
              href="/hotels/parrys"
              className="mt-5 inline-flex items-center justify-center gap-2 bg-gold-gradient px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
            >
              See rooms and book <ArrowRight size={14} />
            </Link>
          </Reveal>

          <nav aria-label="More ways to find us" className="border-t border-gold/20 pt-8">
            <h2 className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-gold">More about staying in Parrys</h2>
            <ul className="mt-4 space-y-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/${o.slug}`} className="text-[15px] text-on-surface underline-offset-4 hover:text-gold-soft hover:underline">
                    {o.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: LANDING_PAGES.map((p) => ({ params: { landing: p.slug } })),
  // Anything else under the site root is a normal 404.
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const page = findLanding(String(params?.landing));
  if (!page) return { notFound: true };
  const hotels = await getSiteHotels();
  const parrys = hotels.find((h) => h.slug === "parrys") ?? HOTELS.find((h) => h.slug === "parrys")!;
  return {
    props: {
      page,
      others: LANDING_PAGES.filter((p) => p.slug !== page.slug).map((p) => ({ slug: p.slug, h1: p.h1 })),
      fromPrice: minPrice(parrys),
      phone: hotelPhone(parrys),
      lat: parrys.lat,
      lng: parrys.lng,
    },
    revalidate: SITE_REVALIDATE_SECONDS,
  };
};
