import Image from "next/image";
import styles from "../../index.module.css";
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  withDivider?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  withDivider = true,
}) => {
  return (
    <>
      <div className={styles.sectionHeader}>
        {withDivider && (
          <Image
            className={styles.sectionDivider}
            width={51}
            height={2}
            alt="Line"
            src="/Icons/Line 4.svg"
          />
        )}
        <h2 className={styles.sectionTitle}>{title}</h2>
        {withDivider && (
          <Image
            className={styles.sectionDivider}
            width={51}
            height={2}
            alt="Line"
            src="/Icons/Line 3.svg"
          />
        )}
      </div>

      {subtitle && (
        <h3 className={styles.subHeading}>
          <span>Explore Our </span>
          <span className={styles.accentText}>{subtitle}</span>
        </h3>
      )}
    </>
  );
};

export default SectionHeader;
