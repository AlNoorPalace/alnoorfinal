import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "../../index.module.css";
import {
  FaBed,
  FaBath,
  FaWifi,
  FaSnowflake,
  FaElevator,
  FaBellConcierge,
  FaShirt,
  FaNewspaper,
  FaTv,
  FaFire,
} from "react-icons/fa6";
import { FaParking } from "react-icons/fa";
import { MdCleaningServices, MdSmokeFree } from "react-icons/md";
import { GiHairStrands, GiWaterDrop, GiTeapot } from "react-icons/gi";
// REMOVED: import CorporateSection from "./corporate";

// Enhanced Room Data type with more details
interface RoomData {
  title: string;
  image: string;
  bathCount: number;
  bedCount: number;
  hasWifi: boolean;
  description: string;
  pricePerNight: number;
  featured?: boolean;
  amenities: string[];
  inclusions: string[];
}

// Map amenity names to icons
const amenityIcons: Record<string, JSX.Element> = {
  Fridge: <FaSnowflake />,
  Lift: <FaElevator />,
  "Wi-Fi": <FaWifi />,
  "Free Parking": <FaParking />,
  "24×7 Room Service": <FaBellConcierge />,
  "Laundry(PAID)": <FaShirt />,
  "Power Backup": <FaFire />,
  Newspaper: <FaNewspaper />,
  Housekeeping: <MdCleaningServices />,
  "Hair Conditioning": <GiHairStrands />,
  "Smoke Detector": <MdSmokeFree />,
  TV: <FaTv />,
  "Electric Kettle": <GiTeapot />,
  Toiletries: <GiWaterDrop />,
};

// Branch data
interface BranchData {
  name: string;
  phone: string;
  email: string;
}

const branches: BranchData[] = [
  {
    name: "Triplicane Branch",
    phone: "7338944222",
    email: "booking@alnoorpalace.in",
  },
  {
    name: "Parrys Branch",
    phone: "7338955111",
    email: "booking@alnoorresidency.in",
  },
  {
    name: "Bengaluru Branch",
    phone: "8951777883",
    email: "booking.blr@alnoorpalace.in",
  },
];

// Define common amenities and default rooms
const commonAmenities = [
  "Fridge",
  "Power Backup",
  "Free Parking",
  "Newspaper",
  "Wi-Fi",
  "Housekeeping",
];

const defaultRooms: RoomData[] = [
  {
    title: "Deluxe",
    image: "/Images/room-1 1.png",
    bathCount: 1,
    bedCount: 1,
    hasWifi: true,
    description:
      "Our cozy Deluxe room offers comfort and convenience for your stay.",
    pricePerNight: 799,
    amenities: commonAmenities,
    inclusions: ["TV", "Electric Kettle", "Toiletries"],
  },
  {
    title: "Deluxe Triple ",
    image: "/Images/room-1 1.png",
    bathCount: 1,
    bedCount: 3,
    hasWifi: true,
    description: "Perfect for families or small groups.",
    pricePerNight: 1500,
    amenities: commonAmenities,
    inclusions: ["TV", "Electric Kettle", "Toiletries"],
  },
  {
    title: "Deluxe Quad",
    image: "/Images/room-1 1.png",
    bathCount: 1,
    bedCount: 4,
    hasWifi: true,
    description: "Our Deluxe Quad room provides ample space for four guests.",
    pricePerNight: 2000,
    amenities: commonAmenities,
    inclusions: ["TV", "Electric Kettle", "Toiletries"],
  },
  {
    title: "King Suite",
    image: "/Images/room-1 1.png",
    bathCount: 1,
    bedCount: 2,
    hasWifi: true,
    description: "Experience luxury in our King Suite.",
    pricePerNight: 2500,
    featured: true,
    amenities: commonAmenities,
    inclusions: ["TV", "Electric Kettle", "Toiletries"],
  },
  {
    title: "Residential Suite",
    image: "/Images/room-1 1.png",
    bathCount: 2,
    bedCount: 3,
    hasWifi: true,
    description:
      "Our premium Residential Suite offers home-away-from-home experience.",
    pricePerNight: 3000,
    featured: true,
    amenities: commonAmenities,
    inclusions: ["TV", "Electric Kettle", "Toiletries"],
  },
];

// Booking form data interface
interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  branch: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfDays: number;
  additionalQuery: string;
}

interface RoomsProps {
  rooms?: RoomData[];
  onBookNow?: (room: RoomData) => void;
}

const Rooms: React.FC<RoomsProps> = ({ rooms = defaultRooms, onBookNow }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    phone: "",
    email: "",
    branch: "Triplicane Branch",
    checkInDate: "",
    checkOutDate: "",
    numberOfDays: 1,
    additionalQuery: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll modal into view when it opens
  useEffect(() => {
    if (showBookingForm && modalRef.current) {
      // Scroll the modal into view with a smooth animation
      modalRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showBookingForm]);

  // Calculate number of days between check-in and check-out dates
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff > 0) {
        setFormData((prev) => ({ ...prev, numberOfDays: daysDiff }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Format price with comma separators
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get amenity icon or default to text
  const getAmenityIcon = (amenity: string) => {
    return amenityIcons[amenity] || null;
  };

  // Handle view details button click
  const handleViewDetails = (index: number) => {
    if (flippedIndex === index) {
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
    }
  };

  // Handle book now button click
  const handleBookNow = (room: RoomData) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
    setFormSubmitted(false);

    // Reset form data
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    setFormData({
      name: "",
      phone: "",
      email: "",
      branch: "Triplicane Branch",
      checkInDate: formatDateForInput(tomorrow),
      checkOutDate: formatDateForInput(dayAfterTomorrow),
      numberOfDays: 1,
      additionalQuery: "",
    });

    // If an external onBookNow function is provided, call it
    if (onBookNow) {
      onBookNow(room);
    }
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name as keyof BookingFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Partial<BookingFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    // Email validation - only validate if email is provided (since it's optional)
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.checkInDate) {
      errors.checkInDate = "Check-in date is required";
    }

    if (!formData.checkOutDate) {
      errors.checkOutDate = "Check-out date is required";
    } else if (
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      errors.checkOutDate = "Check-out date must be after check-in date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if(isSubmitting)return // Prevent multiple submissions


    setIsSubmitting(true); // Set submitting state


try{
    if (validateForm()) {
      // Here you would typically send the data to your backend
      // For now, we'll just simulate a successful submission
      console.log("Form submitted:", formData);
      console.log("Selected room:", selectedRoom);
console.log("Branch",formData.branch);

      try {
        const response = await fetch("/api/send-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_type: selectedRoom?.title,
            name: formData.name,
            phone: formData.phone,
            email: formData.email || "N/A",
            branch: formData.branch,
            checkin: formData.checkInDate,
            checkout: formData.checkOutDate,
            days: formData.numberOfDays,
            query: formData.additionalQuery || "None",
          }),
        });
      
        if (response.ok) {
          setFormSubmitted(true);
          setTimeout(() => setShowBookingForm(false), 3000);
        } else {
          alert("❌ Failed to send booking email. Please try again.");
        }
      } catch (error) {
        console.error("❌ API Error:", error);
        alert("Something went wrong. Please try again later.");
      }


      // In a real implementation, you would send this data to your backend
      const emailBody = `
        Booking Details:
        ----------------
        Room Type: ${selectedRoom?.title}
        Guest Name: ${formData.name}
        Phone: ${formData.phone}
        Email: ${formData.email}
        Branch: ${formData.branch}
        Check-in Date: ${formData.checkInDate}
        Check-out Date: ${formData.checkOutDate}
        Number of Days: ${formData.numberOfDays}
        Room Rate: ₹${selectedRoom?.pricePerNight}/night
        Total Amount: ₹${
          (selectedRoom?.pricePerNight || 0) * formData.numberOfDays
        }
        Additional Query: ${formData.additionalQuery || "None"}
      `;

      console.log("Email body:", emailBody);

      // Close the form after 3 seconds
      setTimeout(() => {
        setShowBookingForm(false);
      }, 3000);
    }
  }catch(error){
  console.error("Error submitting form:", error);
  alert("Something went wrong. Please try again later.");
  }finally{
    setIsSubmitting(false); // Reset submitting state
  }
  };

  return (
    <section className={`${styles.roomsSection} fade-in-element`} id="rooms">
      <div className={styles.sectionHeader}>
        <Image
          className={styles.sectionDivider}
          width={51}
          height={2}
          alt=""
          src="/Icons/Line 4.svg"
        />
        <h2 className={styles.sectionTitle}>Our Luxury Rooms</h2>
        <Image
          className={styles.sectionDivider}
          width={51}
          height={2}
          alt=""
          src="/Icons/Line 3.svg"
        />
      </div>
      <h3 className={styles.subHeading}>
        <span>More than </span>
        <span className={styles.accentText}>75+ ROOMS</span>
        <span> available across 3 branches</span>
      </h3>

      <div className={styles.roomsGrid}>
        {rooms.map((room, index) => (
          <div
            key={`room-${index}`}
            className={`${styles.flipCard} ${isLoading ? styles.shimmer : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`${styles.flipCardInner} ${
                flippedIndex === index ? styles.flipped : ""
              }`}
            >
              {/* FRONT */}
              <div className={styles.flipCardFront}>
                {room.featured && <div className={styles.ribbon}>Featured</div>}
                <Image
                  className={styles.roomImage}
                  src={room.image}
                  alt={room.title}
                  width={400}
                  height={180}
                  priority={index < 2}
                />
                <div className={styles.cardTitle}>
                  <h3>{room.title}</h3>
                  <p className={styles.cardPrice}>
                    ₹{formatPrice(room.pricePerNight)} onwards
                  </p>
                </div>
                <div className={styles.amenitiesGrid}>
                  {room.amenities?.slice(0, 5).map((amenity, idx) => (
                    <span key={idx}>
                      {getAmenityIcon(amenity)} {amenity}
                    </span>
                  ))}
                  {room.amenities && room.amenities.length > 5 && (
                    <span>+{room.amenities.length - 5} more</span>
                  )}
                </div>
                <button
                  className={styles.viewDetailsBtn}
                  onClick={() => handleViewDetails(index)}
                >
                  View Details
                </button>
              </div>

              {/* BACK */}
              <div className={styles.flipCardBack}>
                <button
                  className={styles.closeDetailsBtn}
                  onClick={() => setFlippedIndex(null)}
                >
                  ×
                </button>
                <h3 className={styles.backTitle}>{room.title}</h3>

                <p className={styles.cardDescription}>{room.description}</p>

                <div className={styles.iconRow}>
                  <span>
                    <FaBed className={styles.iconBlue} /> {room.bedCount}{" "}
                    {room.bedCount > 1 ? "Beds" : "Bed"}
                  </span>
                  <span>
                    <FaBath className={styles.iconBlue} /> {room.bathCount}{" "}
                    {room.bathCount > 1 ? "Baths" : "Bath"}
                  </span>
                  {room.hasWifi && (
                    <span>
                      <FaWifi className={styles.iconBlue} /> Free WiFi
                    </span>
                  )}
                </div>

                <div className={styles.roomHighlights}>
                  <p className={styles.highlightsTitle}>Room Inclusions:</p>
                  <div className={styles.amenitiesGrid}>
                    {room.inclusions?.map((inclusion, idx) => (
                      <span key={idx}>{inclusion}</span>
                    ))}
                  </div>
                </div>
                <button
                  className={styles.bookNowBtn}
                  onClick={() => handleBookNow(room)}
                >
                  Book Now • ₹{formatPrice(room.pricePerNight)} onwards/night
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REMOVED: Corporate Section component from here */}

      {/* Booking Form Modal - With scroll behavior */}
      {showBookingForm && selectedRoom && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => !formSubmitted && setShowBookingForm(false)}
          />
          <div ref={modalRef} className={styles.modal}>
            {formSubmitted ? (
              <div className={styles.successMessage}>
                <h3>Thank You!</h3>
                <p>
                  Your booking request for {selectedRoom.title} has been
                  submitted successfully.
                </p>
                <p>We will contact you shortly to confirm your reservation.</p>
              </div>
            ) : (
              <>
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setShowBookingForm(false)}
                >
                  ×
                </button>
                <h3>Book {selectedRoom.title}</h3>
                <p className={styles.bookingPrice}>
                  ₹{formatPrice(selectedRoom.pricePerNight)} onwards per night
                </p>

                <form
                  onSubmit={handleSubmitForm}
                  className={styles.bookingForm}
                >
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? styles.inputError : ""}
                      required
                    />
                    {formErrors.name && (
                      <span className={styles.errorText}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? styles.inputError : ""}
                      required
                    />
                    {formErrors.phone && (
                      <span className={styles.errorText}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? styles.inputError : ""}
                    />
                    {formErrors.email && (
                      <span className={styles.errorText}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="branch">Select Branch *</label>
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      {branches.map((branch, index) => (
                        <option key={index} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="checkInDate">Check-in Date *</label>
                      <input
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        className={
                          formErrors.checkInDate ? styles.inputError : ""
                        }
                        required
                        min={formatDateForInput(new Date())}
                      />
                      {formErrors.checkInDate && (
                        <span className={styles.errorText}>
                          {formErrors.checkInDate}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="checkOutDate">Check-out Date *</label>
                      <input
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        className={
                          formErrors.checkOutDate ? styles.inputError : ""
                        }
                        required
                        min={formData.checkInDate}
                      />
                      {formErrors.checkOutDate && (
                        <span className={styles.errorText}>
                          {formErrors.checkOutDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="numberOfDays">Number of Days</label>
                    <input
                      type="number"
                      id="numberOfDays"
                      name="numberOfDays"
                      value={formData.numberOfDays}
                      onChange={handleInputChange}
                      min="1"
                      readOnly
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="additionalQuery">
                      Additional Requests or Queries
                    </label>
                    <textarea
                      id="additionalQuery"
                      name="additionalQuery"
                      value={formData.additionalQuery}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className={styles.formTotal}>
                    <span>Total Amount:</span>
                    <span>
                      ₹
                      {formatPrice(
                        selectedRoom.pricePerNight * formData.numberOfDays
                      )}{" "}
                      onwards
                    </span>
                  </div>

                  <div className={styles.formButtons}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowBookingForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting?"Sending":"Submit Booking"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default Rooms;
