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
  return (
    <footer className={styles.footer} id="contact">
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
          <a href="#rooms" className={styles.ctaButton} style={{ display: 'inline-block', margin: '1rem 0', padding: '0.75rem 2rem', backgroundColor: '#e8a345', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.3s ease' }}>
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
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.footerHeading}>Our Services</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a href="#services">Restaurant & Bar</a>
            </li>
            <li>
              <a href="#services">Swimming Pool</a>
            </li>
            <li>
              <a href="#services">Wellness & Spa</a>
            </li>
            <li>
              <a href="#services">Conference Room</a>
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
