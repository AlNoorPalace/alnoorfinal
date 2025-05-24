import { ReactNode, useState } from "react";
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
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribe = () => {
    // Implement your subscribe logic here
    setSubscribed(true);
  };

  // If Header requires mobileMenuOpen/setMobileMenuOpen, define them here as well
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-container">
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main>{children}</main>
        <Footer
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          handleSubscribe={handleSubscribe}
        />
        <BackToTop scrollToTop={scrollToTop} />
      </div>
    </>
  );
};

export default Layout;