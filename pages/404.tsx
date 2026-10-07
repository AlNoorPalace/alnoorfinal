import Link from "next/link";
import type { GetStaticProps } from "next";
import { Hotel } from "../data/hotels";
import { SITE_REVALIDATE_SECONDS, getSiteHotels } from "../lib/siteHotels";
import Seo from "../components/site/Seo";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found | Al Noor Group of Hotels"
        description="The page you are looking for could not be found."
        noindex
      />
      <SiteHeader solid />
      <main
        id="main"
        className="flex min-h-screen flex-col items-center justify-center bg-surface-lowest px-6 pb-24 pt-32 text-center"
      >
        <span className="text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-soft">
          Error 404
        </span>
        <h1 className="mt-3 font-serif text-display-hero-m text-on-surface lg:text-display-hero">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-body-lg font-light text-on-surface-variant">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you
          back to your stay.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-gold-gradient px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink transition-shadow hover:shadow-gold"
          >
            Back to home
          </Link>
          <Link
            href="/hotels"
            className="border border-gold/50 px-10 py-4 text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-gold/10"
          >
            View hotels
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const getStaticProps: GetStaticProps<{ hotels: Hotel[] }> = async () => ({
  props: { hotels: await getSiteHotels() },
  revalidate: SITE_REVALIDATE_SECONDS,
});
