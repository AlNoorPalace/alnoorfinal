import React from "react";
import Image from "next/image";
import styles from "../../index.module.css";
import { ServiceData } from "../types";

interface ServicesProps {
  services: ServiceData[];
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  return (
    <section
      className={`${styles.servicesSection} fade-in-element`}
      id="services"
    >
      <div className={styles.sectionHeader}>
        <Image
          className={styles.sectionDivider}
          width={51}
          height={2}
          alt="Line"
          src="/Icons/Line 4.svg"
        />
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <Image
          className={styles.sectionDivider}
          width={51}
          height={2}
          alt="Line"
          src="/Icons/Line 3.svg"
        />
      </div>
      <h3 className={styles.subHeading}>
        <span>Explore Our </span>
        <span className={styles.accentText}>Services</span>
      </h3>

      <div className={styles.servicesGrid}>
        {services.map((service, index) => (
          <div className={styles.serviceCard} key={`service-${index}`}>
            <div className={styles.serviceIconContainer}>
              <Image
                className={styles.serviceIcon}
                width={48}
                height={48}
                alt={service.title}
                src={service.icon}
              />
            </div>
            <div className={styles.serviceContent}>
              <h4 className={styles.serviceTitle}>{service.title}</h4>
              <p className={styles.serviceDescription}>{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
