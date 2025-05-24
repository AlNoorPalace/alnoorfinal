import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "../../index.module.css";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

// Define branch information including email addresses
const branchInfo = [
  {
    name: "Triplicane Branch",
    email: "booking@alnoorpalace.in",
  },
  {
    name: "Parrys Branch",
    email: "booking@alnoorresidency.in",
  },
  {
    name: "Bengaluru Branch",
    email: "booking.blr@alnoorpalace.in",
  },
];

// Define room types with updated prices
const roomTypes = {
  Deluxe: 799,
  "Deluxe Triple": 1500,
  "Deluxe Quad": 2000,
  "King Suite": 2500,
  "Residential Suite": 3000,
};

const Header: React.FC<HeaderProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [notFoundLocation, setNotFoundLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numDays, setNumDays] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available branches
  const branches = ["Triplicane Chennai", "Parrys Chennai", "Bengaluru"];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Setup date constraints and handling
  useEffect(() => {
    // If check-in date is selected, ensure check-out date is after check-in
    if (checkInDate) {
      // If check-out date is before check-in date, reset it
      if (checkOutDate && checkOutDate < checkInDate) {
        setCheckOutDate("");
      }
    }

    // Calculate number of days between dates
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      setNumDays(diff > 0 ? diff : 0);
    } else {
      setNumDays(0);
    }
  }, [checkInDate, checkOutDate]);

  // Calculate total amount when room type or number of days changes
  useEffect(() => {
    if (selectedRoom && numDays > 0) {
      const roomPrice = roomTypes[selectedRoom as keyof typeof roomTypes] || 0;
      setTotalAmount(roomPrice * numDays);
    } else {
      setTotalAmount(0);
    }
  }, [selectedRoom, numDays]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBookingDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter branches based on search
  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Handle branch selection
  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    setBookingDropdownOpen(false);
    setFormOpen(true);
  };

  // Handle location not found
  const handleLocationNotFound = () => {
    setNotFoundLocation(searchValue);
    setSelectedBranch("Other Branch");
    setBookingDropdownOpen(false);
    setFormOpen(true);
  };

  // Handle form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // prevent double submit
    setIsSubmitting(true); // start submission
    // Get form data
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const formDataObj = Object.fromEntries(formData.entries());

      // Add room type, number of days, and total amount
      formDataObj.roomType = selectedRoom;
      formDataObj.numberOfDays = numDays.toString();
      formDataObj.totalAmount = totalAmount.toString();

      if (notFoundLocation) {
        formDataObj.searchedLocation = notFoundLocation;
      }

      // Determine which email(s) to send to
      let emailRecipients: string[] = [];

      if (selectedBranch === "Other Branch") {
        // Send to all branches
        emailRecipients = branchInfo.map((branch) => branch.email);
      } else {
        // Find the matching branch and get its email
        const branch = branchInfo.find((b) => b.name === selectedBranch);
        if (branch) {
          emailRecipients.push(branch.email);
        }
      }

      // Add email recipients to form data
      formDataObj.emailRecipients = emailRecipients.join(", ");

      console.log("Form submitted with data:", formDataObj);
      console.log("Email will be sent to:", emailRecipients);

      try {
        const response = await fetch("/api/send-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_type: formDataObj.roomType,
            name: formDataObj.fullName,
            phone: formDataObj.phoneNumber,
            email: formDataObj.email || "N/A",
            branch: formDataObj.branch,
            checkin: formDataObj.checkInDate,
            checkout: formDataObj.checkOutDate,
            days: formDataObj.numberOfDays,
            query: formDataObj.additionalRequests || "None",
            totalAmount: formDataObj.totalAmount,
            searchedLocation: formDataObj.searchedLocation || "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send booking email");
        }
      } catch (error) {
        console.error("Booking API error:", error);
        alert("Failed to send booking request. Please try again.");
      }

      // Show success message
      alert(
        `Booking request submitted successfully! Your request will be sent to ${emailRecipients.join(
          ", "
        )}`
      );

      // Reset form
      setFormOpen(false);
      setSelectedBranch("");
      setCheckInDate("");
      setCheckOutDate("");
      setNumDays(0);
      setSelectedRoom("");
      setNotFoundLocation("");
      setTotalAmount(0);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
              <li>
                <a href="#home" className={styles.active}>
                  Home
                </a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#rooms">Rooms</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li className={styles.mobileOnly}>
                <a href="#contact">Contact Us</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.frameGroup}>
          <div className={styles.socialIcons}>
            <a href="https://twitter.com/alnoorhotels" aria-label="Twitter">
              <Image
                src="/Icons/Twitter 1.svg"
                alt="Twitter"
                width={19}
                height={19}
              />
            </a>
            <a href="https://facebook.com/alnoorhotels" aria-label="Facebook">
              <Image
                src="/Icons/Facebook 1.svg"
                alt="Facebook"
                width={19}
                height={19}
              />
            </a>
            <a href="https://instagram.com/alnoorhotels" aria-label="Instagram">
              <Image
                src="/Icons/Instagram 1.svg"
                alt="Instagram"
                width={19}
                height={19}
              />
            </a>
          </div>

          <div className={styles.bookingBtnContainer} ref={dropdownRef}>
            <button
              className={styles.bookNowBtn}
              onClick={() => setBookingDropdownOpen(!bookingDropdownOpen)}
            >
              Book Now
            </button>

            {bookingDropdownOpen && (
              <div className={styles.bookingDropdown}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.branchOptions}>
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch, index) => (
                      <div
                        key={index}
                        className={styles.branchOption}
                        onClick={() => handleBranchSelect(branch)}
                      >
                        {branch}
                      </div>
                    ))
                  ) : (
                    <div
                      className={styles.notFoundOption}
                      onClick={handleLocationNotFound}
                    >
                      Can't find location? Let's find it for you
                    </div>
                  )}
                </div>
              </div>
            )}

            {formOpen && (
              <div className={styles.bookingFormOverlay}>
                <div className={styles.bookingForm}>
                  <div className={styles.formHeader}>
                    <button
                      className={styles.closeFormBtn}
                      onClick={() => setFormOpen(false)}
                      aria-label="Close form"
                    >
                      ×
                    </button>
                    <h2>Hotel Booking Request</h2>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">Full Name *</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phoneNumber">Phone Number *</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        required
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="branch">Select Branch *</label>
                      <select
                        id="branch"
                        name="branch"
                        required
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="">Select a Branch</option>
                        {branchInfo.map((branch, index) => (
                          <option key={index} value={branch.name}>
                            {branch.name}
                          </option>
                        ))}
                        <option value="Other Branch">Other Branch</option>
                      </select>

                      {notFoundLocation && (
                        <div className={styles.searchedLocation}>
                          Searched location: {notFoundLocation}
                          <input
                            type="hidden"
                            name="searchedLocation"
                            value={notFoundLocation}
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="checkIn">Check-in Date *</label>
                        <input
                          type="date"
                          id="checkIn"
                          name="checkInDate"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className={styles.formInput}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="checkOut">Check-out Date *</label>
                        <input
                          type="date"
                          id="checkOut"
                          name="checkOutDate"
                          required
                          min={
                            checkInDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className={styles.formInput}
                          disabled={!checkInDate}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="numDays">Number of Days</label>
                      <input
                        type="number"
                        id="numDays"
                        name="numberOfDays"
                        value={numDays}
                        readOnly
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.roomTypeSection}>
                      <label>Select Room Type *</label>
                      <input
                        type="hidden"
                        name="roomType"
                        value={selectedRoom}
                        required
                      />

                      <div className={styles.roomOptions}>
                        <div
                          className={`${styles.roomOption} ${
                            selectedRoom === "Deluxe" ? styles.selectedRoom : ""
                          }`}
                          onClick={() => setSelectedRoom("Deluxe")}
                        >
                          <div className={styles.roomHeader}>
                            <h3>Deluxe</h3>
                            <span className={styles.price}>₹799 onwards</span>
                          </div>
                          <p>1 Bed • 1 Bath • Free WiFi</p>
                        </div>

                        <div
                          className={`${styles.roomOption} ${
                            selectedRoom === "Deluxe Triple"
                              ? styles.selectedRoom
                              : ""
                          }`}
                          onClick={() => setSelectedRoom("Deluxe Triple")}
                        >
                          <div className={styles.roomHeader}>
                            <h3>Deluxe Triple</h3>
                            <span className={styles.price}>₹1,500 onwards</span>
                          </div>
                          <p>3 Beds • 1 Bath • Free WiFi</p>
                        </div>

                        <div
                          className={`${styles.roomOption} ${
                            selectedRoom === "Deluxe Quad"
                              ? styles.selectedRoom
                              : ""
                          }`}
                          onClick={() => setSelectedRoom("Deluxe Quad")}
                        >
                          <div className={styles.roomHeader}>
                            <h3>Deluxe Quad</h3>
                            <span className={styles.price}>₹2,000 onwards</span>
                          </div>
                          <p>4 Beds • 1 Bath • Free WiFi</p>
                        </div>

                        <div
                          className={`${styles.roomOption} ${
                            styles.featuredRoom
                          } ${
                            selectedRoom === "King Suite"
                              ? styles.selectedRoom
                              : ""
                          }`}
                          onClick={() => setSelectedRoom("King Suite")}
                        >
                          <div className={styles.roomHeader}>
                            <h3>King Suite</h3>
                            <span className={styles.featured}>Featured</span>
                            <span className={styles.price}>₹2,500 onwards</span>
                          </div>
                          <p>2 Beds • 1 Bath • Free WiFi</p>
                        </div>

                        <div
                          className={`${styles.roomOption} ${
                            styles.featuredRoom
                          } ${
                            selectedRoom === "Residential Suite"
                              ? styles.selectedRoom
                              : ""
                          }`}
                          onClick={() => setSelectedRoom("Residential Suite")}
                        >
                          <div className={styles.roomHeader}>
                            <h3>Residential Suite</h3>
                            <span className={styles.featured}>Featured</span>
                            <span className={styles.price}>₹3,000 onwards</span>
                          </div>
                          <p>2 Beds • 1 Bath • Free WiFi</p>
                        </div>
                      </div>
                    </div>

                    {/* Total Amount Section */}
                    <div className={styles.formGroup}>
                      <label htmlFor="totalAmount">
                        Total Amount (Approx, Not Exact!)
                      </label>
                      <div className={styles.totalAmountDisplay}>
                        <input
                          type="text"
                          id="totalAmount"
                          name="totalAmount"
                          value={
                            totalAmount > 0
                              ? formatCurrency(totalAmount)
                              : "Select room and dates"
                          }
                          readOnly
                          className={`${styles.formInput} ${styles.totalAmountInput}`}
                        />
                        {totalAmount > 0 && (
                          <div className={styles.totalCalculation}>
                            {numDays} {numDays === 1 ? "day" : "days"} ×{" "}
                            {formatCurrency(
                              roomTypes[
                                selectedRoom as keyof typeof roomTypes
                              ] || 0
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="additionalRequests">
                        Additional Requests or Queries{" "}
                        <b>if Other Branch Mention that Branch here</b>
                      </label>
                      <textarea
                        id="additionalRequests"
                        name="additionalRequests"
                        className={styles.formTextarea}
                      ></textarea>
                    </div>

                    {/* Hidden field for tracking that form originated from website */}
                    <input
                      type="hidden"
                      name="source"
                      value="website_booking"
                    />

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => setFormOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending" : "Submit Booking"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className={styles.logoutWrapper}>
            <a href="#contact" className={styles.logoutBtn}>
              Contact Us
            </a>
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
