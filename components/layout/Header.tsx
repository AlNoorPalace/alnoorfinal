import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import styles from "../../index.module.css";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className={styles.header}>
      <div className={styles.frameParent}>
        <div className={styles.logo1Parent}>
          <Image
            className={styles.logo1Icon}
            width={127}
            height={50}
            alt="Al Noor HMS"
            src="/Images/Finlogo.png"
          />

          <nav
            className={`${styles.navMenu} ${
              mobileMenuOpen ? styles.navMenuOpen : ""
            }`}
          >
            <ul>
              <li><a href="#home" className={styles.active}>Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#rooms">Rooms</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
              <li className={styles.mobileOnly}><a href="#contact">Contact Us</a></li>
            </ul>
          </nav>
        </div>

        <div className={styles.frameGroup}>
          <div className={styles.socialIcons}>
            <a href="https://twitter.com/alnoorhotels" aria-label="Twitter">
              <Image src="/Icons/Twitter 1.svg" alt="Twitter" width={19} height={19} />
            </a>
            <a href="https://facebook.com/alnoorhotels" aria-label="Facebook">
              <Image src="/Icons/Facebook 1.svg" alt="Facebook" width={19} height={19} />
            </a>
            <a href="https://instagram.com/alnoorhotels" aria-label="Instagram">
              <Image src="/Icons/Instagram 1.svg" alt="Instagram" width={19} height={19} />
            </a>
          </div>

          <div className={styles.logoutWrapper}>
            <a href="#contact" className={styles.logoutBtn}>Contact Us</a>
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.menuIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;