import React from "react";
import Image from "next/image";
import styles from "../../index.module.css";
import { ReviewData } from "../types";

type ReviewsProps = {
  reviews: ReviewData[];
};
const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
  return (
    <section className={`${styles.reviewsSection} fade-in-element`}>
      <div className={styles.reviewsContainer}>
        <h3 className={styles.reviewsHeading}>
          <span>What do our </span>
          <span className={styles.accentText}>Customer Says?</span>
        </h3>
        <p className={styles.reviewsSubheading}>
          Hear from our guests at Al Noor Hotels.
        </p>

        <div className={styles.reviewsSlider}>
          {reviews.map((review, index) => (
            <div className={styles.reviewCard} key={`review-${index}`}>
              <div className={styles.profileWrapper}>
                {review.img ? (
                  <Image
                    src={review.img}
                    alt={review.name}
                    width={60}
                    height={60}
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.initialAvatar}>
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <Image
                className={styles.quoteIcon}
                width={32}
                height={32}
                alt="Quote"
                src="/Icons/quote-down.svg"
              />
              <p className={styles.reviewQuote}>{review.quote}</p>
              <h4 className={styles.reviewerName}>{review.name}</h4>
              <p className={styles.reviewerEmail}>{review.email}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
