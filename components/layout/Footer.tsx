import { useState } from "react";
import Image from "next/image";
import styles from "../../index.module.css";

import { Dispatch, SetStateAction, FormEvent } from "react";

interface FooterProps {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  subscribed: boolean;
  handleSubscribe: (e: FormEvent) => void;
}

const Footer: React.FC<FooterProps> = ({
  email,
  setEmail,
  subscribed,
  handleSubscribe,
}) => {
  // State for controlling developer modal visibility
  const [showDevModal, setShowDevModal] = useState(false);

  // Developer profiles data
  const developers = [
    {
      name: "Abdul Salaam",
      phone: "+91 9600158525",
      email: "oisci0793@gmail.com",
      linkedin: "https://www.linkedin.com/in/abdulsalam03/",
      image: "/Images/developer-placeholder.jpg", // Replace with actual image
    },
    {
      name: "Mohammed Hamdan",
      phone: "+91 9150984174",
      email: "hamdanaveed07@gmail.com",
      linkedin: "https://www.linkedin.com/in/mohammed-hamdan-9b6893221",
      image: "/Images/developer-placeholder.jpg", // Replace with actual image
    },
    {
      name: "Mohamed Faraazman",
      phone: "+91 9445587067",
      email: "md.faraazman@gmail.com",
      linkedin:
        "https://www.linkedin.com/in/mohamed-faraazman-bin-farooq-s-46134525b",
      image: "/Images/developer-placeholder.jpg", // Replace with actual image
    },
  ];

  return (
    <footer className={styles.footer} id="contact">
      {/* Developer Modal - only shown when showDevModal is true */}
      {showDevModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#fffafa42",
              borderRadius: "8px",

              width: "100%",
              padding: "30px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <button
              onClick={() => setShowDevModal(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#333",
              }}
            >
              ×
            </button>

            <h2
              style={{
                textAlign: "center",
                color: "#e8a345",
                marginBottom: "30px",
                fontSize: "28px",
              }}
            >
              Meet Our Development Team
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "30px",
              }}
            >
              {developers.map((dev, index) => (
                <div
                  key={index}
                  style={{
                    flex: "1 1 250px",
                    maxWidth: "280px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    animation: `cardIn 0.5s ease-out ${index * 0.15}s both`,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto 15px",
                      border: "4px solidrgb(76, 80, 219)",
                    }}
                  >
                    {/* When you have actual developer images, replace these placeholders */}
                    <div
                      style={{
                        backgroundColor: "#e8a345",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {dev.name.charAt(0)}
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "10px 0",
                      color: "#000",
                      fontSize: "20px",
                    }}
                  >
                    {dev.name}
                  </h3>

                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      color: "#000",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {dev.phone}
                  </p>

                  <p
                    style={{
                      margin: "5px 0",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 6l-10 7L2 6"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <a
                      href={`mailto:${dev.email}`}
                      style={{
                        color: "#666",
                        textDecoration: "none",
                        wordBreak: "break-all",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#e8a345")
                      }
                      onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                    >
                      {dev.email}
                    </a>
                  </p>

                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      margin: "15px 0 5px",
                      padding: "8px 20px",
                      backgroundColor: "#0077b5",
                      color: "white",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#005f91")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0077b5")
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn Profile
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className={styles.footerBgContainer}>
        <Image
          className={styles.footerBgIcon}
          width={1920}
          height={400}
          alt="Footer"
          src="/Images/footernews.jpg"
          priority={false}
        />
        <div className={styles.reservationCallout}>
          <h3 className={styles.calloutTitle}>Hotel Reservation</h3>
          <p className={styles.calloutText}>
            Extra Perks When You Book Directly With Us
          </p>
          <a
            href="#rooms"
            className={styles.ctaButton}
            style={{
              display: "inline-block",
              margin: "1rem 0",
              padding: "0.75rem 2rem",
              backgroundColor: "#e8a345",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            View Our Rooms
          </a>
        </div>
      </div>

      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <Image
            className={styles.footerLogo}
            width={100}
            height={68}
            alt="Al Noor Hotels"
            src="/Images/Finlogo.png"
          />
          <p className={styles.footerDescription}>
            Luxury accommodations with exceptional service. Experience the best
            in hospitality at Al Noor Hotels.
          </p>
          <p className={styles.footerEmail}>booking@alnoorresidency.in</p>
          <div className={styles.footerSocials}>
            <a href="https://facebook.com/alnoorhotels" aria-label="Facebook">
              <Image
                width={24}
                height={24}
                alt="Facebook"
                src="/Icons/001-facebook-logo-button.svg"
              />
            </a>
            <a href="https://twitter.com/alnoorhotels" aria-label="Twitter">
              <Image
                width={24}
                height={24}
                alt="Twitter"
                src="/Icons/002-twitter.svg"
              />
            </a>
            <a href="https://vimeo.com/alnoorhotels" aria-label="Vimeo">
              <Image
                width={24}
                height={24}
                alt="Vimeo"
                src="/Icons/004-vimeo-social-logo.svg"
              />
            </a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.footerHeading}>Quick Links</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#rooms">Rooms</a>
            </li>
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a
                href="https://pdfhost.io/v/2q5Tz6vNCD_Privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Privacy Policy
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "5px" }}
                >
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 3h6v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14L21 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="https://zeta-labs.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
              Developers
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "5px" }}
                >
                  <path
                    d="M17 8l4 4-4 4M3 12h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              {/* Original functionality - commented out
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDevModal(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                Meet the Development
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: "5px" }}
                >
                  <path
                    d="M17 8l4 4-4 4M3 12h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              */}
            </li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.footerHeading}>Our Services</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href="#services">Rooms & Apartment</a>
            </li>
            <li>
              <a href="#services">Laundry Services</a>
            </li>
            <li>
              <a href="#services">Food & Restaurant</a>
            </li>
            <li>
              <a href="#services">Parking</a>
            </li>

            <li>
              <a href="#services">24Hour Room Service</a>
            </li>

            <li>
              <a href="#services">Power Backup</a>
            </li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.footerHeading}>Contact Info</h4>
          <ul className={styles.contactInfo}>
            <li>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Chennai | Bengaluru, India</span>
            </li>

            <li>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>+91 73389 44222, +91 89517 77883</span>
            </li>
            <li>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "3rem", height: "4rem", marginTop: "-1.5rem" }}
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6l-10 7L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.footerEmail}>
                booking@alnoorpalace.in, booking.blr@alnoorpalace.in,
                booking@alnoorresidency.in
              </span>
            </li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.footerHeading}>Newsletter</h4>
          <p className={styles.newsletterText}>
            Subscribe to receive updates and special offers
          </p>
          <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.subscribeBtn}>
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className={styles.subscribeSuccess}>
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>

      <div className={styles.copyright}>
        <p>
          &copy; {new Date().getFullYear()} Al Noor Group of Hotels. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
