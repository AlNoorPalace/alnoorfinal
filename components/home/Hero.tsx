import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../index.module.css";
const Hero: React.FC = () => {
  const [currentText, setCurrentText] = useState("");
  const locations = [
    "Rest Well, Work Better — Rooms Redefined.",
    "Chennai, Bengaluru, Ooty, Hosur and more...",
  ];
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (charIndex < locations[index].length) {
      typingTimeout = setTimeout(() => {
        setCurrentText((prev) => prev + locations[index][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 100);
    } else {
      // Wait before clearing and moving to next text
      typingTimeout = setTimeout(() => {
        setCurrentText(""); // Clear text
        setCharIndex(0); // Reset character index
        setIndex((prev) => (prev + 1) % locations.length); // Next location
      }, 1500);
    }

    return () => clearTimeout(typingTimeout);
  }, [charIndex, index]);

  return (
    <div className={styles.heroContent} id="home">
      <div className={`${styles.welcomeToParent} fade-in-element`}>
        <div className={`${styles.welcomeTo} ${styles.blinkingText}`}>
          Welcome to
        </div>
        <h1 className={`${styles.hotelHeading} ${styles.fadeSlideDelay}`}>
          Al Noor Group of Hotels
        </h1>
        <p className={`${styles.hotelDescription} ${styles.fadeSlideDelay2}`}>
          Experience unparalleled luxury and comfort at Al Noor Group of Hotels.
          Our commitment to exceptional service and elegant accommodations
          ensures a memorable stay for all our guests.
        </p>

        <div className="flex items-center mt-6 space-x-8 relative z-10">
          <a href="#about" className={styles.ctaButton}>
            <span>Explore More</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className={styles.typewriterWrapper}>
          <span className={styles.placeholder}>Now in Bengaluru</span>{" "}
          {/* Invisible placeholder */}
          <span className={styles.typewriterText}>{currentText}</span>
        </div>

        <div className={styles.fadeInTagline}>
          Escape into Comfort & Elegance
        </div>
      </div>
    </div>
  );
};

export default Hero;
