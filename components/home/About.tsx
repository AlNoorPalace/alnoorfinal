import Image from "next/image";
import styles from "../../index.module.css";
import SectionHeader from "../shared/SectionHeader";

const About: React.FC = () => {
  return (
    <section className={`${styles.aboutUs} fade-in-element`} id="about">
      <div className={styles.aboutContainer}>
        <div className={styles.aboutContent}>
          <SectionHeader title="About Us" />
          <div className={styles.aboutTextContainer}>
            <h3 className={styles.welcomeToHotelParadiseContainer}>
              <span>Welcome to </span>
              <span className={styles.accentText}>Al Noor Palace</span>
            </h3>
            <div className={styles.aboutParagraph}>
              Al Noor Group of Hotels has been a symbol of luxury and excellence
              in hospitality since 2019. Our commitment to providing exceptional
              service and creating memorable experiences for our guests has made
              us a preferred choice for travelers from around the world.
            </div>
            <div className={styles.aboutParagraph}>
              Our hotel offers the perfect blend of comfort and convenience,
              located close to some of Chennai’s most iconic landmarks. Whether
              you're visiting the US Embassy, enjoying the scenic Marina Beach,
              exploring the historic Parthasarathy Temple, or seeking world-class
              medical care at Apollo Hospitals, everything is just minutes away.
            </div>
            <a
              href="#rooms"
              className={`${styles.ctaButton} ${styles.outlineBtn}`}
            >
              <span>Discover More</span>
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
        </div>
        <div className={styles.aboutImagesGrid}>
          {[1, 2, 3, 4].map((num) => (
            <div className={styles.aboutImageWrapper} key={`about-img-${num}`}>
              <Image
                className={styles.aboutImage}
                width={300}
                height={300}
                alt={`Our Hotel - Image ${num}`}
                src={`/Images/about-${num} 1.png`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
