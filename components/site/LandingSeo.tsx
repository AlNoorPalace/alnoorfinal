import Head from "next/head";
import { LANDING_SEO, LANDING_SEO_COMMON as C, landingJsonLd } from "../../data/landingSeo";

/**
 * The head block for one landing page, exactly as supplied in the owner's SEO document
 * (see data/landingSeo.ts). Nothing else is added to these pages' head.
 */
export default function LandingSeo({ slug }: { slug: string }) {
  const e = LANDING_SEO[slug];
  if (!e) return null;
  return (
    <Head>
      <title>{e.title}</title>
      <meta name="description" content={e.description} />
      <meta name="keywords" content={e.keywords} />
      <link rel="canonical" href={e.canonical} />
      <meta name="robots" content={C.robots} />
      <meta name="audience" content={C.audience} />
      <meta name="author" content={C.author} />
      <meta name="contact" content={C.contact} />
      <meta name="revisit-after" content={C.revisitAfter} />
      <meta name="language" content={C.language} />
      <meta name="distribution" content={C.distribution} />
      <meta name="rating" content={C.rating} />
      <meta name="copyright" content={C.copyright} />
      <meta name="url" content={C.url} />
      <meta name="twitter:card" content={C.twitterCard} />
      <meta name="twitter:site" content={C.twitterSite} />
      <meta name="twitter:title" content={e.twitterTitle} />
      <meta name="twitter:description" content={e.twitterDescription} />
      <meta name="twitter:creator" content={C.twitterCreator} />
      <meta name="twitter:image" content={C.twitterImage} />
      <meta property="og:title" content={e.ogTitle} />
      <meta property="og:type" content={C.ogType} />
      <meta property="og:url" content={C.ogUrl} />
      <meta property="og:image" content={C.ogImage} />
      <meta property="og:description" content={e.ogDescription} />
      <meta property="og:site_name" content={C.ogSiteName} />
      <meta property="fb:admins" content={C.fbAdmins} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd(e)) }} />
    </Head>
  );
}
