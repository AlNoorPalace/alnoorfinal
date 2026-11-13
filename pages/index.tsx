import Head from "next/head";
import HomeSeo from "../components/site/HomeSeo";
import { hotelGroupJsonLd } from "../data/seo";
import { Hotel } from "../data/hotels";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";
import type { GetStaticProps } from "next";
import { SiteImages, getSiteImages } from "../lib/siteImages";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import BookingBar from "../components/site/BookingBar";
import {
  About,
  Amenities,
  Corporate,
  Destinations,
  FinalCta,
  Hero,
  HotelsSection,
  Reviews,
  RoomsShowcase,
  StatsRow,
  TrustStrip,
} from "../components/site/HomeSections";

export default function Home({ hotels }: { hotels: Hotel[]; siteImages?: SiteImages }) {
  return (
    <>
      {/* The owner's search-engine block, exactly as supplied. */}
      <HomeSeo />
      {/* The hotel list as structured data (in addition to the block above). */}
      <Head>
        <script key="jsonld-hotels" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelGroupJsonLd(hotels)) }} />
      </Head>

      <SiteHeader />
      <main id="main">
        <Hero />
        <BookingBar />
        <TrustStrip />
        <Destinations />
        <HotelsSection />
        <RoomsShowcase />
        <About />
        <Amenities />
        <Corporate />
        <StatsRow />
        <Reviews />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticProps: GetStaticProps<{ hotels: Hotel[]; siteImages: SiteImages }> = async () => ({
  props: { hotels: await getSiteHotels(), siteImages: await getSiteImages() },
  revalidate: SITE_REVALIDATE_SECONDS,
});
