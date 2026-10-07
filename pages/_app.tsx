import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import { BookingProvider } from '../components/site/BookingContext';
import BookingModal from '../components/site/BookingModal';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Meta Pixel Code - Noscript */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1539209977275943&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </Head>

      {/* Meta Pixel Code - Script */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1539209977275943');
            fbq('track', 'PageView');
          `,
        }}
      />
      
      {/* Google Ads global site tag (gtag.js) */}
      <Script
        id="google-ads-tag-loader"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-17716678921"
      />
      <Script
        id="google-ads-tag-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17716678921');
          `,
        }}
      />
      
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <BookingProvider>
        <Component {...pageProps} />
        <BookingModal />
      </BookingProvider>
    </>
  );
}

export default MyApp;
