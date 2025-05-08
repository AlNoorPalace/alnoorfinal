import React, { useEffect, useRef } from "react";
import styles from "../../index.module.css";

interface StatItem {
  number: string;
  label: string;
  suffix: string;
}

const HotelStats: React.FC = () => {
  const statsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numberElements = entry.target.querySelectorAll(
              `.${styles.statNumber}`
            ) as NodeListOf<HTMLElement>;

            numberElements.forEach((el) => {
              const finalValue = el.dataset.value || "0";
              const suffix = el.dataset.suffix || "";
              el.textContent = "0" + suffix;

              let startValue = 0;
              const duration = 2000;
              const increment = parseFloat(finalValue) / (duration / 20);

              const counter = setInterval(() => {
                startValue += increment;

                if (startValue >= parseFloat(finalValue)) {
                  el.textContent = finalValue + suffix;
                  clearInterval(counter);
                } else {
                  el.textContent = Math.floor(startValue) + suffix;
                }
              }, 20);
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats: StatItem[] = [
    { number: "75", label: "Luxury Rooms", suffix: "+" },
    { number: "99", label: "Guest Satisfaction", suffix: "%" },
    { number: "24/7", label: "Room Service", suffix: "" },
    { number: "50", label: "Corporate Clients", suffix: "+" },
  ];

  return (
    <section className={styles.statsSection} ref={statsRef}>
      <div className={styles.statsContainer}>
        <h2 className={styles.statsHeading}>
          Where Business Meets Luxury
          <br />
          Delivering comfort, confidence, and class
        </h2>

        <div className={styles.statsScrollWrapper}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div
                className={styles.statCard}
                key={index}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <h3
                  className={styles.statNumber}
                  data-value={stat.number}
                  data-suffix={stat.suffix}
                >
                  {stat.number}
                  {stat.suffix}
                </h3>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelStats;