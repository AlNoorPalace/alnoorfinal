import styles from "../../index.module.css";
interface BackToTopProps {
  scrollToTop: () => void;
}
const BackToTop: React.FC<BackToTopProps> = ({ scrollToTop }) => {

  return (
    <button
      className={styles.backToTopBtn}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 19V5M12 5L5 12M12 5L19 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default BackToTop;
