import type { GetServerSideProps } from "next";
import { SITE_URL } from "../data/hotels";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  );
  res.end();
  return { props: {} };
};

export default function Robots() {
  return null;
}
