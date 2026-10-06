import Seo from "../components/site/Seo";
import { hotelGroupJsonLd } from "../data/seo";
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

const TITLE = "Al Noor Group of Hotels | Chennai, Bengaluru, Hyderabad & Ooty";
const DESCRIPTION =
  "Comfortable, affordable hotel rooms in Chennai, Bengaluru, Hyderabad and Ooty. Seven Al Noor hotels with 24×7 room service and parking. Book direct for extra perks.";

export default function Home() {
  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} path="/" jsonLd={hotelGroupJsonLd()} />

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
