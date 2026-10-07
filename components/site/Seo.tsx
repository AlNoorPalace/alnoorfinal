import Head from "next/head";
import { SITE_URL } from "../../data/hotels";
import { OG_IMAGE } from "../../data/seo";

interface SeoProps {
  title: string;
  description: string;
  /** Canonical path, e.g. "/hotels". Query strings are never part of it. */
  path?: string;
  image?: string;
  jsonLd?: object;
  noindex?: boolean;
}

export default function Seo({
  title,
  description,
  path = "/",
  image = OG_IMAGE,
  jsonLd,
  noindex = false,
}: SeoProps) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return (
    <Head>
      <title>{title}</title>
      <meta key="description" name="description" content={description} />
      {noindex && <meta key="robots" name="robots" content="noindex" />}
      <link key="canonical" rel="canonical" href={url} />

      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content="Al Noor Group of Hotels" />
      <meta key="og:locale" property="og:locale" content="en_IN" />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={image} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content="Al Noor Palace hotel entrance" />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={image} />

      {jsonLd && (
        <script
          key="jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
