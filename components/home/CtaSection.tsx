import React from "react";
import styles from "../../index.module.css";
import Image from "next/image";
interface CtaSectionProps {
  onBookClick: () => void;
  backgroundImage?: string; // Optional - to override the default image
  overlayOpacity?: number; // Optional overlay opacity (0-1)
}

const CtaSection: React.FC<CtaSectionProps> = ({
  onBookClick,
  backgroundImage = "Images/backk.jpg", // Default to the image in your public folder
  overlayOpacity = 0.5, // Default overlay opacity
}) => {
  // These inline styles will work regardless of CSS module configuration
  const sectionStyle = {
    position: "relative" as const,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "700px",
    padding: "3rem",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
    backgroundRepeat: "no-repeat" as const,
    color: "white",
    textAlign: "center" as const,
    overflow: "hidden" as const,
    ...(styles.ctaSection ? {} : {}), // Keep any existing styles from module if they exist
  };

  const overlayStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    zIndex: 1,
    ...(styles.ctaOverlay ? {} : {}), // Keep any existing styles from module if they exist
  };

  const contentStyle = {
    position: "relative" as const,
    zIndex: 2,
    maxWidth: "800px",
    ...(styles.ctaContent ? {} : {}), // Keep any existing styles from module if they exist
  };

  const h2Style = {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    fontWeight: "bold" as const,
  };

  const pStyle = {
    fontSize: "1.2rem",
    marginBottom: "2rem",
  };

  const buttonStyle = {
    padding: "0.75rem 2rem",
    backgroundColor: "#d4af37", // Gold color for luxury feel
    color: "#000",
    fontSize: "1.1rem",
    fontWeight: "bold" as const,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer" as const,
    transition: "all 0.3s ease",
    ...(styles.ctaButton ? {} : {}), // Keep any existing styles from module if they exist
  };

  return (
    <section
      className={`${styles.ctaSection || ""} fade-in-element`}
      style={sectionStyle}
    >
      <Image
        className={styles.footerBgIcon}
        width={1920}
        height={400}
        alt="Footer"
        src="/Images/backk.png"
        priority={false}
      />
      <div className={styles.ctaOverlay || ""} style={overlayStyle}></div>
      <div className={styles.ctaContent || ""} style={contentStyle}>
        <h2 style={h2Style}>Experience Luxury Like Never Before</h2>
        <p style={pStyle}>
          Book your stay today and enjoy exclusive benefits when you reserve
          directly with us.
        </p>
        <button
          className={styles.ctaButton || ""}
          style={buttonStyle}
          onClick={onBookClick}
        >
          Book Now
        </button>
      </div>
    </section>
  );
};

export default CtaSection;
