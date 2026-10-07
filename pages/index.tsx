import Seo from "../components/site/Seo";
import { hotelGroupJsonLd } from "../data/seo";
import { Hotel, citiesOf, joinList } from "../data/hotels";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";
import type { GetStaticProps } from "next";
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

export default function Home({ hotels }: { hotels: Hotel[] }) {
  const cities = joinList(citiesOf(hotels));
  const title = cities ? `Al Noor Group of Hotels | ${cities.replace(/ and /g, " & ")}` : "Al Noor Group of Hotels";
  const description =
    `Comfortable, affordable hotel rooms${cities ? ` in ${cities}` : ""}. ` +
    `${hotels.length} Al Noor hotel${hotels.length === 1 ? "" : "s"} with 24×7 room service and parking. Book direct for extra perks.`;
  return (
    <>
      <Seo title={title} description={description} path="/" jsonLd={hotelGroupJsonLd(hotels)} />

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

export const getStaticProps: GetStaticProps<{ hotels: Hotel[] }> = async () => ({
  props: { hotels: await getSiteHotels() },
  revalidate: SITE_REVALIDATE_SECONDS,
});
