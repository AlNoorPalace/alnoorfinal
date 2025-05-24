import { ReactNode } from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "../shared/BacktoTop";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Al Noor Group of Hotels - Luxury Accommodations",
  description = "Experience luxury accommodations and exceptional service at Al Noor Group of Hotels. Book your stay today!",
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-container">
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Layout;
