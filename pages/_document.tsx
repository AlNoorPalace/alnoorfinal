import Document, { Html, Head, Main, NextScript } from "next/document";

// The Google tag for this site, exactly as supplied by Google. It goes at the start of the
// <head> of every public page (not the admin dashboard) and must appear only once per page.
const GOOGLE_TAG_INLINE = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
`;

export default class MyDocument extends Document {
  render() {
    const isAdmin = this.props.__NEXT_DATA__.page.startsWith("/admin");
    return (
    <Html lang="en">
      <Head>
        {!isAdmin && (
          <>
            <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-KPHBBKX2"></script>
            <script dangerouslySetInnerHTML={{ __html: GOOGLE_TAG_INLINE }} />
          </>
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A0A0A" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    );
  }
}
