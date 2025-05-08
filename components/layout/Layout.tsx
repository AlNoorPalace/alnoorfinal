import { ReactNode, useState,FormEvent } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);


  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail(""); // clear input after subscribing
    // Optionally: add actual API call here
  };

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
         <Header mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}></Header>
        <main>{children}</main>
        <Footer
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          handleSubscribe={handleSubscribe}
        />
       <BackToTop scrollToTop={scrollToTop}></BackToTop>
      </div>
    </>
  );
};

export default Layout;
