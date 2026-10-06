import Head from "next/head";
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

const TITLE =
  "Al Noor Group of Hotels - Luxury Accommodations in Chennai, Bengaluru & More";
const DESCRIPTION =
  "Book the best hotels in Chennai, Triplicane, Parrys, Electronic City, Koramangala, Koyambedu, Hyderabad and Ooty. Enjoy affordable, budget-friendly rooms with premium service at Al Noor Group of Hotels.";

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="best hotels in chennai, best hotels in triplicane, best hotels in parrys, best hotels in electronic city, best hotels in koramangala, best hotels in koyambedu, best hotels in hyderabad, best hotels in ooty, cheap hotels chennai, affordable hotels bengaluru, budget hotels hyderabad, budget hotels ooty, hotel booking india, online hotel booking"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://alnoorpalace.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Al Noor Group of Hotels - Luxury Accommodations" />
        <meta
          property="og:description"
          content="Stay at the best affordable hotels in Chennai, Bengaluru, Hyderabad and Ooty with Al Noor Group of Hotels."
        />
        <meta property="og:url" content="https://alnoorpalace.in/" />
        <meta property="og:image" content="https://alnoorpalace.in/img/hero-facade.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Al Noor Group of Hotels" />
        <meta
          name="twitter:description"
          content="Book the best cheap and affordable hotels in every Al Noor location across India."
        />
        <meta name="twitter:image" content="https://alnoorpalace.in/img/hero-facade.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              name: "Al Noor Group of Hotels",
              description:
                "Affordable hotels in Chennai, Triplicane, Parrys, Bengaluru, Hyderabad and Ooty",
              url: "https://alnoorpalace.in",
              telephone: "+91-7338944222",
              address: { "@type": "PostalAddress", addressCountry: "IN" },
            }),
          }}
        />
      </Head>

      <SiteHeader />
      <main>
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
