import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Seo from "../components/site/Seo";
import { hotelGroupJsonLd } from "../data/seo";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import HotelCard, { HelpCard } from "../components/site/HotelCard";
import { Reveal } from "../components/site/motion";
import type { GetStaticProps } from "next";
import { Hotel, citiesOf, joinList } from "../data/hotels";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";

export default function HotelsPage({ hotels }: { hotels: Hotel[] }) {
  const router = useRouter();
  const cities = citiesOf(hotels);
  const q = router.query.city;
  const city = typeof q === "string" && cities.includes(q) ? q : "All";
  const list = city === "All" ? hotels : hotels.filter((h) => h.city === city);

  const setCity = (c: string) =>
    router.replace(
      { pathname: "/hotels", query: c === "All" ? {} : { city: c } },
      undefined,
      { shallow: true, scroll: false }
    );

  return (
    <>
      <Seo
        title="Our Hotels | Al Noor Group of Hotels"
        description={`Explore Al Noor hotels${cities.length ? ` in ${joinList(cities)}` : ""}. See rooms and prices, and book direct.`}
        path="/hotels"
        jsonLd={hotelGroupJsonLd(hotels)}
      />

      <SiteHeader solid />
      <main id="main" className="min-h-screen bg-surface-lowest pt-20">
        <section className="border-b border-gold/20 py-14 text-center lg:py-20">
          <Reveal className="mx-auto max-w-3xl px-6 lg:px-margin">
            <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
              Our Locations
            </span>
            <h1 className="mt-3 font-serif text-display-hero-m lg:text-display-hero text-on-surface">
              Our Hotels
            </h1>
            <p className="mt-4 text-body-lg font-light text-on-surface-variant">
              {hotels.length} hotel{hotels.length === 1 ? "" : "s"}{cities.length > 0 && <> across {joinList(cities)}</>}.
            </p>
          </Reveal>
        </section>

        <section className="bg-ivory py-10 text-[#1B1C19] lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-margin">
            <div className="mb-10 flex flex-wrap items-center gap-3" role="tablist" aria-label="Filter by city">
              {["All", ...cities].map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={city === c}
                  onClick={() => setCity(c)}
                  className={`relative px-5 py-2 text-eyebrow font-semibold uppercase tracking-[0.16em] transition-colors ${
                    city === c ? "text-ink" : "text-gold-ink hover:text-[#1B1C19]"
                  }`}
                >
                  {city === c && (
                    <motion.span
                      layoutId="city-pill"
                      className="absolute inset-0 bg-gold-gradient"
                      transition={{ type: "spring", damping: 28, stiffness: 320 }}
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              ))}
              <span className="ml-auto text-[13px] text-[#474744]">
                {list.length} hotel{list.length > 1 ? "s" : ""}
              </span>
            </div>
            {list.length === 0 && (
              <p className="py-10 text-center text-body-md text-[#474744]">
                Our hotels will be listed here soon.
              </p>
            )}
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((h) => (
                <motion.div
                  key={h.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex"
                >
                  <div className="flex w-full">
                    <HotelCard hotel={h} />
                  </div>
                </motion.div>
              ))}
              {city === "All" && (
                <motion.div layout className="flex">
                  <HelpCard />
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticProps: GetStaticProps<{ hotels: Hotel[] }> = async () => ({
  props: { hotels: await getSiteHotels() },
  revalidate: SITE_REVALIDATE_SECONDS,
});
